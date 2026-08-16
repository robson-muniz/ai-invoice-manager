import { describe, it, expect } from "vitest";
import {
  dollarsToCents,
  centsToDollars,
  calculatePercentage,
  calculateDiscount,
  calculateTax,
  addCents,
  subtractCents,
  isValidAmount,
} from "@/lib/money";

describe("Money Utilities", () => {
  describe("dollarsToCents", () => {
    it("converts dollars to cents correctly", () => {
      expect(dollarsToCents(19.99)).toBe(1999);
      expect(dollarsToCents(100)).toBe(10000);
      expect(dollarsToCents(0.01)).toBe(1);
      expect(dollarsToCents(1234.56)).toBe(123456);
    });

    it("handles edge cases", () => {
      expect(dollarsToCents(0)).toBe(0);
      expect(dollarsToCents(0.001)).toBe(0); // Rounds down
      expect(dollarsToCents(0.005)).toBe(1); // Rounds normally
    });
  });

  describe("centsToDollars", () => {
    it("converts cents to dollars correctly", () => {
      expect(centsToDollars(1999)).toBe(19.99);
      expect(centsToDollars(10000)).toBe(100);
      expect(centsToDollars(1)).toBe(0.01);
    });
  });

  describe("calculatePercentage", () => {
    it("calculates percentages using basis points", () => {
      // 10% = 1000 basis points
      expect(calculatePercentage(1000, 1000)).toBe(100); // 10% of $10 = $1
      expect(calculatePercentage(5000, 1000)).toBe(500); // 10% of $50 = $5

      // 5% = 500 basis points
      expect(calculatePercentage(10000, 500)).toBe(500); // 5% of $100 = $5
    });
  });

  describe("calculateDiscount", () => {
    it("calculates percentage discounts", () => {
      // 10% discount on $100 = $10 discount
      expect(calculateDiscount(10000, "PERCENTAGE", 1000)).toBe(1000);
    });

    it("calculates fixed discounts", () => {
      // $5 fixed discount
      expect(calculateDiscount(10000, "FIXED", 500)).toBe(500);
    });
  });

  describe("calculateTax", () => {
    it("calculates tax correctly", () => {
      // 10% tax on $100 = $10
      expect(calculateTax(10000, 1000)).toBe(1000);

      // 20% tax on $50 = $10
      expect(calculateTax(5000, 2000)).toBe(1000);
    });
  });

  describe("addCents", () => {
    it("adds multiple cent amounts", () => {
      expect(addCents(1000, 2000)).toBe(3000);
      expect(addCents(1000, 2000, 3000)).toBe(6000);
      expect(addCents(1, 1, 1)).toBe(3);
    });

    it("handles empty input", () => {
      expect(addCents()).toBe(0);
    });
  });

  describe("subtractCents", () => {
    it("subtracts cent amounts", () => {
      expect(subtractCents(5000, 2000)).toBe(3000);
      expect(subtractCents(1000, 1000)).toBe(0);
    });

    it("handles zero results", () => {
      expect(subtractCents(1000, 1000)).toBe(0);
    });
  });

  describe("isValidAmount", () => {
    it("validates amount correctness", () => {
      expect(isValidAmount(1000)).toBe(true);
      expect(isValidAmount(0)).toBe(true);
      expect(isValidAmount(-100)).toBe(false);
      expect(isValidAmount(100.5)).toBe(false); // Must be integer
    });
  });

  describe("Full invoice calculation example", () => {
    it("calculates a complete invoice correctly", () => {
      // Invoice with:
      // - Item 1: 1x $100 (10% tax = $10)
      // - Item 2: 2x $50 (10% tax = $10)
      // - Subtotal: $200
      // - Discount: 10% = $20
      // - Tax: $20
      // - Total: $200

      const item1Subtotal = dollarsToCents(100);
      const item1Tax = calculateTax(item1Subtotal, 1000); // 10%

      const item2Subtotal = dollarsToCents(100);
      const item2Tax = calculateTax(item2Subtotal, 1000); // 10%

      const subtotal = addCents(item1Subtotal, item2Subtotal);
      expect(subtotal).toBe(dollarsToCents(200));

      const discount = calculateDiscount(subtotal, "PERCENTAGE", 1000); // 10%
      expect(discount).toBe(dollarsToCents(20));

      const totalTax = addCents(item1Tax, item2Tax);
      expect(totalTax).toBe(dollarsToCents(20));

      const total = addCents(subtotal, totalTax);
      const finalTotal = subtractCents(total, discount);

      expect(finalTotal).toBe(dollarsToCents(200));
      expect(centsToDollars(finalTotal)).toBe(200);
    });
  });
});
