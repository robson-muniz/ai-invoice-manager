import { z } from "zod";

export const createCustomerSchema = z.object({
  organizationId: z.string().cuid("Invalid organization ID"),
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email address"),
  company: z.string().max(255).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  taxNumber: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  organizationId: z.string().cuid(),
});

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
