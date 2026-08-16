import { describe, it, expect } from "vitest";

/**
 * Invoice Status Transition Tests
 * Validates the state machine for invoice statuses
 */

type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

const validTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: ["SENT", "CANCELLED"],
  SENT: ["VIEWED", "PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED"],
  VIEWED: ["PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED"],
  PARTIALLY_PAID: ["PAID", "OVERDUE", "CANCELLED"],
  PAID: [],
  OVERDUE: ["PAID", "CANCELLED"],
  CANCELLED: [],
};

function isValidTransition(
  current: InvoiceStatus,
  target: InvoiceStatus
): boolean {
  return validTransitions[current]?.includes(target) ?? false;
}

describe("Invoice Status Transitions", () => {
  describe("DRAFT state", () => {
    it("can transition to SENT", () => {
      expect(isValidTransition("DRAFT", "SENT")).toBe(true);
    });

    it("can transition to CANCELLED", () => {
      expect(isValidTransition("DRAFT", "CANCELLED")).toBe(true);
    });

    it("cannot transition to PAID", () => {
      expect(isValidTransition("DRAFT", "PAID")).toBe(false);
    });

    it("cannot transition to VIEWED", () => {
      expect(isValidTransition("DRAFT", "VIEWED")).toBe(false);
    });
  });

  describe("SENT state", () => {
    it("can transition to VIEWED", () => {
      expect(isValidTransition("SENT", "VIEWED")).toBe(true);
    });

    it("can transition to PAID", () => {
      expect(isValidTransition("SENT", "PAID")).toBe(true);
    });

    it("can transition to PARTIALLY_PAID", () => {
      expect(isValidTransition("SENT", "PARTIALLY_PAID")).toBe(true);
    });

    it("can transition to OVERDUE", () => {
      expect(isValidTransition("SENT", "OVERDUE")).toBe(true);
    });

    it("can transition to CANCELLED", () => {
      expect(isValidTransition("SENT", "CANCELLED")).toBe(true);
    });

    it("cannot transition back to DRAFT", () => {
      expect(isValidTransition("SENT", "DRAFT")).toBe(false);
    });
  });

  describe("VIEWED state", () => {
    it("can transition to PAID", () => {
      expect(isValidTransition("VIEWED", "PAID")).toBe(true);
    });

    it("can transition to PARTIALLY_PAID", () => {
      expect(isValidTransition("VIEWED", "PARTIALLY_PAID")).toBe(true);
    });

    it("cannot transition to SENT", () => {
      expect(isValidTransition("VIEWED", "SENT")).toBe(false);
    });
  });

  describe("PARTIALLY_PAID state", () => {
    it("can transition to PAID", () => {
      expect(isValidTransition("PARTIALLY_PAID", "PAID")).toBe(true);
    });

    it("can transition to OVERDUE", () => {
      expect(isValidTransition("PARTIALLY_PAID", "OVERDUE")).toBe(true);
    });

    it("cannot transition to SENT", () => {
      expect(isValidTransition("PARTIALLY_PAID", "SENT")).toBe(false);
    });
  });

  describe("OVERDUE state", () => {
    it("can transition to PAID", () => {
      expect(isValidTransition("OVERDUE", "PAID")).toBe(true);
    });

    it("can transition to CANCELLED", () => {
      expect(isValidTransition("OVERDUE", "CANCELLED")).toBe(true);
    });

    it("cannot transition to SENT", () => {
      expect(isValidTransition("OVERDUE", "SENT")).toBe(false);
    });

    it("cannot transition to VIEWED", () => {
      expect(isValidTransition("OVERDUE", "VIEWED")).toBe(false);
    });
  });

  describe("Terminal states", () => {
    it("PAID state has no valid transitions", () => {
      expect(isValidTransition("PAID", "CANCELLED")).toBe(false);
      expect(isValidTransition("PAID", "DRAFT")).toBe(false);
      expect(isValidTransition("PAID", "SENT")).toBe(false);
    });

    it("CANCELLED state has no valid transitions", () => {
      expect(isValidTransition("CANCELLED", "DRAFT")).toBe(false);
      expect(isValidTransition("CANCELLED", "SENT")).toBe(false);
      expect(isValidTransition("CANCELLED", "PAID")).toBe(false);
    });
  });

  describe("Common workflows", () => {
    it("supports normal payment workflow: DRAFT -> SENT -> VIEWED -> PAID", () => {
      let status: InvoiceStatus = "DRAFT";

      status = "SENT";
      expect(isValidTransition("DRAFT", status)).toBe(true);

      status = "VIEWED";
      expect(isValidTransition("SENT", status)).toBe(true);

      status = "PAID";
      expect(isValidTransition("VIEWED", status)).toBe(true);
    });

    it("supports partial payment workflow: DRAFT -> SENT -> PARTIALLY_PAID -> PAID", () => {
      expect(isValidTransition("DRAFT", "SENT")).toBe(true);
      expect(isValidTransition("SENT", "PARTIALLY_PAID")).toBe(true);
      expect(isValidTransition("PARTIALLY_PAID", "PAID")).toBe(true);
    });

    it("supports overdue workflow: SENT -> OVERDUE -> PAID", () => {
      expect(isValidTransition("SENT", "OVERDUE")).toBe(true);
      expect(isValidTransition("OVERDUE", "PAID")).toBe(true);
    });

    it("supports cancellation from draft", () => {
      expect(isValidTransition("DRAFT", "CANCELLED")).toBe(true);
    });

    it("supports cancellation of sent invoice", () => {
      expect(isValidTransition("SENT", "CANCELLED")).toBe(true);
    });
  });
});
