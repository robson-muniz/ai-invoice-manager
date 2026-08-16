import type { DefaultSession } from "next-auth";

// Extend NextAuth session with custom fields
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
  }
}

// Application Types
export type UserRole = "OWNER" | "ADMIN" | "MEMBER";

export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export type PaymentMethod = "STRIPE" | "BANK_TRANSFER" | "CASH" | "CHECK";

export type SubscriptionPlan = "FREE" | "PRO";

export type SubscriptionStatus = "ACTIVE" | "INACTIVE" | "CANCELLED";

export type RecurringFrequency = "MONTHLY" | "QUARTERLY" | "YEARLY";

export type DiscountType = "PERCENTAGE" | "FIXED";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "JPY";

// Request/Response Types
export interface CreateInvoiceInput {
  organizationId: string;
  customerId: string;
  issueDate: Date;
  dueDate: Date;
  items: {
    productId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
  }[];
  discountType?: DiscountType;
  discountValue?: number;
  currency: CurrencyCode;
  notes?: string;
}

export interface CreateCustomerInput {
  organizationId: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  taxNumber?: string;
  notes?: string;
}

export interface CreateProductInput {
  organizationId: string;
  name: string;
  description?: string;
  sku?: string;
  unitPrice: number;
  taxRate?: number;
  currency?: CurrencyCode;
}

// Error handling
export class ApplicationError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "ApplicationError";
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, public field?: string) {
    super("VALIDATION_ERROR", message, 400);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string, public resource?: string) {
    super("NOT_FOUND", message, 404);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message: string = "Unauthorized") {
    super("UNAUTHORIZED", message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message: string = "Forbidden") {
    super("FORBIDDEN", message, 403);
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string) {
    super("CONFLICT", message, 409);
    this.name = "ConflictError";
  }
}
