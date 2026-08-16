import Decimal from "decimal.js";

/**
 * All monetary amounts in the app are stored as integers (cents).
 * These utilities prevent floating-point arithmetic errors that could
 * cause revenue loss or incorrect calculations.
 */

/**
 * Convert dollars/euros to cents
 * @example: dollarsToCents(19.99) => 1999
 */
export function dollarsToCents(amount: number): number {
  return Math.round(new Decimal(amount).times(100).toNumber());
}

/**
 * Convert cents to dollars/euros
 * @example: centsToDollars(1999) => 19.99
 */
export function centsToDollars(cents: number): number {
  return new Decimal(cents).dividedBy(100).toNumber();
}

/**
 * Format cents as currency string
 * @example: formatCurrency(1999) => "$19.99"
 */
export function formatCurrency(cents: number, currency = "USD"): string {
  const amount = centsToDollars(cents);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Calculate percentage of an amount
 * @example: calculatePercentage(1000, 1000) => 10 (1000 cents = 1000 basis points = 10%)
 */
export function calculatePercentage(
  amount: number,
  basisPoints: number
): number {
  return Math.round(
    new Decimal(amount).times(basisPoints).dividedBy(10000).toNumber()
  );
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(
  subtotal: number,
  discountType: "PERCENTAGE" | "FIXED",
  discountValue: number
): number {
  if (discountType === "PERCENTAGE") {
    return calculatePercentage(subtotal, discountValue);
  }
  return discountValue;
}

/**
 * Calculate tax amount
 */
export function calculateTax(taxBase: number, taxRate: number): number {
  return calculatePercentage(taxBase, taxRate);
}

/**
 * Safe addition of monetary amounts
 */
export function addCents(...amounts: number[]): number {
  return amounts.reduce((sum, amount) => {
    return Math.round(
      new Decimal(sum).plus(amount).toNumber()
    );
  }, 0);
}

/**
 * Safe subtraction of monetary amounts
 */
export function subtractCents(minuend: number, subtrahend: number): number {
  return Math.round(
    new Decimal(minuend).minus(subtrahend).toNumber()
  );
}

/**
 * Verify that an amount is valid (non-negative, integer)
 */
export function isValidAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount >= 0;
}
