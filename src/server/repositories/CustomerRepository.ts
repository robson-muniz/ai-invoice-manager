import { db } from "@/server/db";
import { BaseRepository } from "./BaseRepository";
import { NotFoundError } from "@/server/permissions/authorization";
import type { CreateCustomerInput, UpdateCustomerInput } from "@/server/validators/customerSchemas";

export class CustomerRepository extends BaseRepository {
  async getAll(skip = 0, take = 50) {
    return await db.customer.findMany({
      where: {
        organizationId: this.organizationId,
        deletedAt: null,
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(customerId: string) {
    const customer = await db.customer.findFirst({
      where: {
        id: customerId,
        organizationId: this.organizationId,
        deletedAt: null,
      },
    });

    if (!customer) {
      throw new NotFoundError(`Customer ${customerId} not found`);
    }

    return customer;
  }

  async getByEmail(email: string) {
    return await db.customer.findFirst({
      where: {
        email,
        organizationId: this.organizationId,
        deletedAt: null,
      },
    });
  }

  async create(input: CreateCustomerInput) {
    return await db.customer.create({
      data: {
        organizationId: this.organizationId,
        name: input.name,
        email: input.email,
        company: input.company,
        phone: input.phone,
        address: input.address,
        city: input.city,
        postalCode: input.postalCode,
        country: input.country,
        taxNumber: input.taxNumber,
        notes: input.notes,
      },
    });
  }

  async update(customerId: string, input: UpdateCustomerInput) {
    const customer = await this.getById(customerId);

    return await db.customer.update({
      where: { id: customer.id },
      data: {
        name: input.name ?? undefined,
        email: input.email ?? undefined,
        company: input.company ?? undefined,
        phone: input.phone ?? undefined,
        address: input.address ?? undefined,
        city: input.city ?? undefined,
        postalCode: input.postalCode ?? undefined,
        country: input.country ?? undefined,
        taxNumber: input.taxNumber ?? undefined,
        notes: input.notes ?? undefined,
      },
    });
  }

  async softDelete(customerId: string) {
    const customer = await this.getById(customerId);

    return await db.customer.update({
      where: { id: customer.id },
      data: { deletedAt: new Date() },
    });
  }

  async count() {
    return await db.customer.count({
      where: {
        organizationId: this.organizationId,
        deletedAt: null,
      },
    });
  }
}
