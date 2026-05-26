const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();
const db = admin.firestore();

// Paystack API Base URL
const PAYSTACK_API_BASE_URL = 'https://api.paystack.co';

/**
 * 1. Initialize Deposit:
 *    Trigger: onCreate in deposit_requests/{id}.
 *    Action: Call https://api.paystack.co/transaction/initialize.
 *    Update the document with the returned authorization_url.
 */
exports.initializeDeposit = functions.firestore
  .document('deposit_requests/{depositRequestId}')
  .onCreate(async (snap, context) => {
    const depositRequest = snap.data();
    const depositRequestId = context.params.depositRequestId;

    // Retrieve Paystack secret key from Firebase secret
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      console.error('PAYSTACK_SECRET_KEY is not set in environment variables.');
      await snap.ref.update({ status: 'failed', error: 'Server configuration error' });
      return null;
    }

    try {
      const response = await axios.post(
        `${PAYSTACK_API_BASE_URL}/transaction/initialize`,
        {
          email: depositRequest.email, // Assuming email is part of the deposit request
          amount: depositRequest.amount * 100, // Paystack expects amount in kobo (cents)
          callback_url: depositRequest.callbackUrl, // Optional: for redirect after payment
          metadata: {
            depositRequestId: depositRequestId,
            userId: depositRequest.userId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status) {
        await snap.ref.update({
          status: 'pending',
          authorization_url: response.data.data.authorization_url,
          access_code: response.data.data.access_code,
          reference: response.data.data.reference,
          paystackResponse: response.data.data,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Deposit initialization successful for ${depositRequestId}. Authorization URL: ${response.data.data.authorization_url}`);
      } else {
        console.error(`Paystack initialization failed for ${depositRequestId}:`, response.data.message);
        await snap.ref.update({
          status: 'failed',
          error: response.data.message,
          paystackResponse: response.data,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      return null;
    } catch (error) {
      console.error(`Error initializing deposit for ${depositRequestId}:`, error.message);
      await snap.ref.update({
        status: 'failed',
        error: error.message,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
      return null;
    }
  });

/**
 * 2. Verify Payment:
 *    Trigger: onCreate in deposit_verifications/{id}.
 *    Action: Call https://api.paystack.co/transaction/verify/{reference}.
 *    On Success:
 *      ▪ Add amount to wallets/{uid}.availableBalance.
 *      ▪ Create a document in transactions collection.
 */
exports.verifyPayment = functions.firestore
  .document('deposit_verifications/{verificationId}')
  .onCreate(async (snap, context) => {
    const verificationRequest = snap.data();
    const verificationId = context.params.verificationId;
    const reference = verificationRequest.reference;

    if (!reference) {
      console.error(`No reference provided for verification ${verificationId}.`);
      await snap.ref.update({ status: 'failed', error: 'No transaction reference provided' });
      return null;
    }

    // Retrieve Paystack secret key from Firebase secret
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      console.error('PAYSTACK_SECRET_KEY is not set in environment variables.');
      await snap.ref.update({ status: 'failed', error: 'Server configuration error' });
      return null;
    }

    try {
      const response = await axios.get(
        `${PAYSTACK_API_BASE_URL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status && response.data.data.status === 'success') {
        const transactionData = response.data.data;
        const amount = transactionData.amount / 100; // Convert kobo back to main currency
        const userId = transactionData.metadata ? transactionData.metadata.userId : null;

        if (!userId) {
          console.error(`User ID not found in Paystack metadata for reference ${reference}.`);
          await snap.ref.update({ status: 'failed', error: 'User ID missing in transaction metadata' });
          return null;
        }

        // Use a transaction to update wallet balance and create transaction record atomically
        await db.runTransaction(async (t) => {
          const walletRef = db.collection('wallets').doc(userId);
          const walletDoc = await t.get(walletRef);

          let newAvailableBalance = amount;
          if (walletDoc.exists) {
            newAvailableBalance += walletDoc.data().availableBalance || 0;
          }

          t.set(walletRef, { availableBalance: newAvailableBalance, lastUpdated: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

          const transactionRef = db.collection('transactions').doc();
          t.set(transactionRef, {
            userId: userId,
            type: 'deposit',
            amount: amount,
            status: 'completed',
            description: `Deposit via Paystack (Ref: ${reference})`,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            paystackTransaction: transactionData,
          });
        });

        await snap.ref.update({
          status: 'success',
          amount: amount,
          userId: userId,
          paystackTransaction: transactionData,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Payment verified and wallet updated for user ${userId}, amount ${amount}. Reference: ${reference}`);
      } else {
        const errorMessage = response.data.message || `Payment verification failed for reference ${reference}.`;
        console.error(errorMessage, response.data);
        await snap.ref.update({
          status: 'failed',
          error: errorMessage,
          paystackResponse: response.data,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      return null;
    } catch (error) {
      console.error(`Error verifying payment for reference ${reference}:`, error.message);
      await snap.ref.update({
        status: 'failed',
        error: error.message,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
      return null;
    }
  });

/**
 * 3. Process Withdrawal:
 *    Trigger: onCreate in withdrawal_requests/{id}.
 *    Action: Call https://api.paystack.co/transfer.
 *    On Success: Deduct amount from wallets/{uid}.availableBalance.
 */
exports.processWithdrawal = functions.firestore
  .document('withdrawal_requests/{withdrawalRequestId}')
  .onCreate(async (snap, context) => {
    const withdrawalRequest = snap.data();
    const withdrawalRequestId = context.params.withdrawalRequestId;
    const userId = withdrawalRequest.userId;
    const amount = withdrawalRequest.amount; // Assuming amount is in main currency
    const recipientCode = withdrawalRequest.recipientCode; // This needs to be created first via Paystack's Transfer Recipients API

    if (!userId || !amount || !recipientCode) {
      console.error(`Missing data for withdrawal request ${withdrawalRequestId}.`);
      await snap.ref.update({ status: 'failed', error: 'Missing userId, amount, or recipientCode' });
      return null;
    }

    // Retrieve Paystack secret key from Firebase secret
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      console.error('PAYSTACK_SECRET_KEY is not set in environment variables.');
      await snap.ref.update({ status: 'failed', error: 'Server configuration error' });
      return null;
    }

    // First, check if the user has sufficient balance
    const walletRef = db.collection('wallets').doc(userId);
    const walletDoc = await walletRef.get();

    if (!walletDoc.exists || walletDoc.data().availableBalance < amount) {
      console.error(`Insufficient balance for user ${userId} to process withdrawal ${withdrawalRequestId}.`);
      await snap.ref.update({ status: 'failed', error: 'Insufficient available balance' });
      return null;
    }

    try {
      // Use a transaction to deduct balance before initiating Paystack transfer
      await db.runTransaction(async (t) => {
        const currentBalance = (await t.get(walletRef)).data().availableBalance || 0;
        const newBalance = currentBalance - amount;

        if (newBalance < 0) {
          throw new Error('Insufficient balance during transaction update.');
        }

        t.update(walletRef, { availableBalance: newBalance, lastUpdated: admin.firestore.FieldValue.serverTimestamp() });
        
        // Now, initiate the Paystack transfer
        const response = await axios.post(
          `${PAYSTACK_API_BASE_URL}/transfer`,
          {
            source: 'balance', // Transfer from your Paystack balance
            amount: amount * 100, // Paystack expects amount in kobo (cents)
            recipient: recipientCode,
            reason: `Withdrawal for user ${userId} (Request ID: ${withdrawalRequestId})`,
            // Optional: reference, currency (default to NGN for Paystack Nigeria)
          },
          {
            headers: {
              Authorization: `Bearer ${paystackSecretKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data.status) {
          await snap.ref.update({
            status: 'completed', // Or 'pending' if Paystack transfer is async
            transfer_code: response.data.data.transfer_code,
            reference: response.data.data.reference,
            paystackResponse: response.data.data,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`Withdrawal successful for user ${userId}, amount ${amount}. Transfer code: ${response.data.data.transfer_code}`);
        } else {
          // If Paystack transfer fails, revert the balance deduction (this is tricky with external APIs)
          // A more robust solution might involve a separate compensation transaction or status for the withdrawal request
          console.error(`Paystack transfer failed for ${withdrawalRequestId}:`, response.data.message);
          t.update(walletRef, { availableBalance: currentBalance }); // Revert balance if Paystack fails
          throw new Error(`Paystack transfer failed: ${response.data.message}`);
        }
      });
      return null;
    } catch (error) {
      console.error(`Error processing withdrawal for ${withdrawalRequestId}:`, error.message);
      await snap.ref.update({
        status: 'failed',
        error: error.message,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
      return null;
    }
  });