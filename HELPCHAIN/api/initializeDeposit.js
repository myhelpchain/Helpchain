// api/initializeDeposit.js
const admin = require('firebase-admin');
const axios = require('axios');

// IMPORTANT: Only initialize Firebase Admin ONCE per function instance.
// Vercel reuses instances, so we check if it's already initialized.
if (!admin.apps.length) {
  // You'll need your Firebase project's service account credentials.
  // We'll set this securely in Vercel later.
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
  });
}

const db = admin.firestore();
const PAYSTACK_API_BASE_URL = 'https://api.paystack.co';

// This is an HTTP-triggered function for Vercel
module.exports = async (req, res) => {
  // Vercel functions receive requests via `req` and send responses via `res`
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // We expect the client to send the deposit request details in the body
  const { depositRequestId, email, amount, userId, callbackUrl } = req.body;

  if (!depositRequestId || !email || !amount || !userId) {
    return res.status(400).send('Missing required fields: depositRequestId, email, amount, userId');
  }

  // Retrieve Paystack secret key from Vercel environment variables
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecretKey) {
    console.error('PAYSTACK_SECRET_KEY is not set in environment variables.');
    return res.status(500).send('Server configuration error: Paystack secret key missing.');
  }

  try {
    const response = await axios.post(
      `${PAYSTACK_API_BASE_URL}/transaction/initialize`,
      {
        email: email,
        amount: amount * 100, // Paystack expects amount in kobo
        callback_url: callbackUrl,
        metadata: {
          depositRequestId: depositRequestId,
          userId: userId,
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
      // Update the original Firestore deposit_requests document
      await db.collection('deposit_requests').doc(depositRequestId).update({
        status: 'pending',
        authorization_url: response.data.data.authorization_url,
        access_code: response.data.data.access_code,
        reference: response.data.data.reference,
        paystackResponse: response.data.data,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`Deposit initialization successful for ${depositRequestId}.`);
      return res.status(200).json({
        message: 'Deposit initialized',
        authorization_url: response.data.data.authorization_url,
        reference: response.data.data.reference,
      });
    } else {
      console.error(`Paystack initialization failed for ${depositRequestId}:`, response.data.message);
      await db.collection('deposit_requests').doc(depositRequestId).update({
        status: 'failed',
        error: response.data.message,
        paystackResponse: response.data,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
      return res.status(500).json({ error: `Paystack initialization failed: ${response.data.message}` });
    }
  } catch (error) {
    console.error(`Error initializing deposit for ${depositRequestId}:`, error.message);
    await db.collection('deposit_requests').doc(depositRequestId).update({
      status: 'failed',
      error: error.message,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });
    return res.status(500).json({ error: error.message });
  }
};