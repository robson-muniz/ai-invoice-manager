import { CustomerRepository } from "@/server/repositories/CustomerRepository";
import { createCustomerSchema, updateCustomerSchema } from "@/server/validators/customerSchemas";

/**
 * CustomerService handles all customer-related business logic
 * Enforces business rules and orchestrates repository operations
 */
export class CustomerService {
  private repository: CustomerRepository;

  constructor(organizationId: string) {
    this.repository = new CustomerRepository(organizationId);
  }

  async list(skip = 0, take = 50) {
    return await this.repository.getAll(skip, take);
  }

  async getById(customerId: string) {
    return await this.repository.getById(customerId);
  }

  async getByEmail(email: string) {
    return await this.repository.getByEmail(email);
  }

  async create(input: unknown) {
    const validated = createCustomerSchema.parse(input);

    // Check if customer with this email already exists
    const existing = await this.getByEmail(validated.email);
    if (existing) {
      throw new Error(`Customer with email ${validated.email} already exists`);
    }

    return await this.repository.create(validated);
  }

  async update(customerId: string, input: unknown) {
    const validated = updateCustomerSchema.parse(input);
    return await this.repository.update(customerId, validated);
  }

  async delete(customerId: string) {
    // Soft delete to preserve invoice history
    return await this.repository.softDelete(customerId);
  }

  async getCount() {
    return await this.repository.count();
  }
}
