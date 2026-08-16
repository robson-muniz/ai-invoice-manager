import { z } from "zod";

export const createProductSchema = z.object({
  organizationId: z.string().cuid("Invalid organization ID"),
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
  sku: z.string().max(100).optional(),
  unitPrice: z.number().int().nonnegative("Price must be non-negative"),
  taxRate: z
    .number()
    .int()
    .min(0, "Tax rate cannot be negative")
    .max(10000, "Tax rate cannot exceed 100%")
    .default(0),
  currency: z.enum(["USD", "EUR", "GBP", "CAD", "AUD", "JPY"]).default("USD"),
  active: z.boolean().default(true),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema
  .partial()
  .extend({
    organizationId: z.string().cuid(),
  });

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
