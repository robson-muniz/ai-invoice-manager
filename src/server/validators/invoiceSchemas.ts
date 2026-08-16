import { z } from "zod";

export const invoiceItemSchema = z.object({
  productId: z.string().cuid().optional().nullable(),
  description: z.string().min(1, "Description is required").max(1000),
  quantity: z.number().positive("Quantity must be positive"),
  unitPrice: z.number().int().nonnegative("Unit price must be non-negative"),
  taxRate: z
    .number()
    .int()
    .min(0)
    .max(10000)
    .default(0),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;

export const createInvoiceSchema = z.object({
  organizationId: z.string().cuid(),
  customerId: z.string().cuid(),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  discountType: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  discountValue: z.number().nonnegative().optional(),
  currency: z.enum(["USD", "EUR", "GBP", "CAD", "AUD", "JPY"]).default("USD"),
  notes: z.string().max(1000).optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export const updateInvoiceSchema = z.object({
  organizationId: z.string().cuid(),
  customerId: z.string().cuid().optional(),
  issueDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  items: z.array(invoiceItemSchema).optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  discountValue: z.number().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
});

export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;

export const invoiceStatusTransitionSchema = z.object({
  organizationId: z.string().cuid(),
  currentStatus: z.enum([
    "DRAFT",
    "SENT",
    "VIEWED",
    "PARTIALLY_PAID",
    "PAID",
    "OVERDUE",
    "CANCELLED",
  ]),
  newStatus: z.enum([
    "DRAFT",
    "SENT",
    "VIEWED",
    "PARTIALLY_PAID",
    "PAID",
    "OVERDUE",
    "CANCELLED",
  ]),
});

export type InvoiceStatusTransition = z.infer<typeof invoiceStatusTransitionSchema>;
