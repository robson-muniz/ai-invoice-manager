import { db } from "@/server/db";
import { BaseRepository } from "./BaseRepository";
import { NotFoundError } from "@/server/permissions/authorization";
import type { CreateProductInput, UpdateProductInput } from "@/server/validators/productSchemas";

export class ProductRepository extends BaseRepository {
  async getAll(skip = 0, take = 50) {
    return await db.product.findMany({
      where: {
        organizationId: this.organizationId,
        active: true,
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(productId: string) {
    const product = await db.product.findFirst({
      where: {
        id: productId,
        organizationId: this.organizationId,
      },
    });

    if (!product) {
      throw new NotFoundError(`Product ${productId} not found`);
    }

    return product;
  }

  async getBySku(sku: string) {
    return await db.product.findFirst({
      where: {
        sku,
        organizationId: this.organizationId,
      },
    });
  }

  async create(input: CreateProductInput) {
    return await db.product.create({
      data: {
        organizationId: this.organizationId,
        name: input.name,
        description: input.description,
        sku: input.sku,
        unitPrice: input.unitPrice,
        taxRate: input.taxRate,
        currency: input.currency,
        active: input.active,
      },
    });
  }

  async update(productId: string, input: UpdateProductInput) {
    const product = await this.getById(productId);

    return await db.product.update({
      where: { id: product.id },
      data: {
        name: input.name ?? undefined,
        description: input.description ?? undefined,
        sku: input.sku ?? undefined,
        unitPrice: input.unitPrice ?? undefined,
        taxRate: input.taxRate ?? undefined,
        currency: input.currency ?? undefined,
        active: input.active ?? undefined,
      },
    });
  }

  async deactivate(productId: string) {
    const product = await this.getById(productId);

    return await db.product.update({
      where: { id: product.id },
      data: { active: false },
    });
  }

  async count() {
    return await db.product.count({
      where: {
        organizationId: this.organizationId,
        active: true,
      },
    });
  }
}
