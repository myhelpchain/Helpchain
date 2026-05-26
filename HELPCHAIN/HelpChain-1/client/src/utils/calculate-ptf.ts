/**
 * Calculate Platform Protection Fee (PTF) based on budget amount
 * Works universally for ANY budget amount, no upper limit
 * @param budget - The budget amount in naira
 * @returns The PTF fee amount
 */
export function calculatePTF(budget: number): number {
  if (typeof budget !== 'number' || isNaN(budget) || budget < 5) {
    throw new Error('Invalid budget. Budget must be a number >= 5');
  }

  const b = Math.floor(budget);

  if (b <= 999) return 15;
  if (b <= 4999) return 60;
  if (b <= 9999) return 150;
  if (b <= 14999) return 200;
  if (b <= 19999) return 250;
  if (b <= 24999) return 300;

  // Universal fallback rule for ANY AMOUNT above ₦25,000
  // Adds ₦60 for every ₦5,000 or fraction thereof
  const baseFee = 300;       // fee for budgets up to ₦25,000  
  const addPer5k = 60;       // additional ₦60 for every 5k or fraction above 25k  
  const excess = b - 25000;
  const chunks = Math.ceil(excess / 5000);
  return baseFee + (addPer5k * chunks);
}

/**
 * Calculate total deposit needed (budget + PTF)
 */
export function calculateTotalDeposit(budget: number): number {
  return budget + calculatePTF(budget);
}
