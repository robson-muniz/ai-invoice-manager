import { ProductRepository } from "@/server/repositories/ProductRepository";
import { createProductSchema, updateProductSchema } from "@/server/validators/productSchemas";

/**
 * ProductService handles all product-related business logic
 */
export class ProductService {
  private repository: ProductRepository;

  constructor(organizationId: string) {
    this.repository = new ProductRepository(organizationId);
  }

  async list(skip = 0, take = 50) {
    return await this.repository.getAll(skip, take);
  }

  async getById(productId: string) {
    return await this.repository.getById(productId);
  }

  async getBySku(sku: string) {
    return await this.repository.getBySku(sku);
  }

  async create(input: unknown) {
    const validated = createProductSchema.parse(input);

    // If SKU is provided, check for duplicates
    if (validated.sku) {
      const existing = await this.getBySku(validated.sku);
      if (existing) {
        throw new Error(`Product with SKU ${validated.sku} already exists`);
      }
    }

    return await this.repository.create(validated);
  }

  async update(productId: string, input: unknown) {
    const validated = updateProductSchema.parse(input);

    // If changing SKU, check for duplicates
    if (validated.sku) {
      const existing = await this.getBySku(validated.sku);
      if (existing && existing.id !== productId) {
        throw new Error(`Product with SKU ${validated.sku} already exists`);
      }
    }

    return await this.repository.update(productId, validated);
  }

  async deactivate(productId: string) {
    return await this.repository.deactivate(productId);
  }

  async getCount() {
    return await this.repository.count();
  }
}
