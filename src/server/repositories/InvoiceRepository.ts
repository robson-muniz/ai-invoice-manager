import { db } from "@/server/db";
import { BaseRepository } from "./BaseRepository";
import { NotFoundError } from "@/server/permissions/authorization";
import type { CreateInvoiceInput, UpdateInvoiceInput } from "@/server/validators/invoiceSchemas";
import type Decimal from "decimal.js";

export class InvoiceRepository extends BaseRepository {
  async getAll(skip = 0, take = 50) {
    return await db.invoice.findMany({
      where: {
        organizationId: this.organizationId,
      },
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async getById(invoiceId: string) {
    const invoice = await db.invoice.findFirst({
      where: {
        id: invoiceId,
        organizationId: this.organizationId,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    if (!invoice) {
      throw new NotFoundError(`Invoice ${invoiceId} not found`);
    }

    return invoice;
  }

  async getByNumber(invoiceNumber: string) {
    return await db.invoice.findFirst({
      where: {
        invoiceNumber,
        organizationId: this.organizationId,
      },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async create(
    invoiceData: Omit<CreateInvoiceInput, "items">,
    items: Array<{
      productId?: string;
      description: string;
      quantity: Decimal;
      unitPrice: number;
      taxRate: number;
    }>,
    invoiceNumber: string,
    amounts: {
      subtotal: number;
      discount: number;
      tax: number;
      total: number;
    }
  ) {
    return await db.invoice.create({
      data: {
        organizationId: this.organizationId,
        customerId: invoiceData.customerId,
        invoiceNumber,
        issueDate: invoiceData.issueDate,
        dueDate: invoiceData.dueDate,
        status: "DRAFT",
        subtotalAmount: amounts.subtotal,
        discountAmount: amounts.discount,
        discountType: invoiceData.discountType,
        discountValue: invoiceData.discountValue,
        taxAmount: amounts.tax,
        totalAmount: amounts.total,
        currency: invoiceData.currency,
        notes: invoiceData.notes,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
          })),
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });
  }

  async getLatestInvoiceNumber(): Promise<string | null> {
    const latest = await db.invoice.findFirst({
      where: { organizationId: this.organizationId },
      orderBy: { createdAt: "desc" },
      select: { invoiceNumber: true },
    });
    return latest?.invoiceNumber || null;
  }

  async update(invoiceId: string, input: UpdateInvoiceInput) {
    const invoice = await this.getById(invoiceId);

    if (invoice.status !== "DRAFT") {
      throw new Error("Can only edit draft invoices");
    }

    return await db.invoice.update({
      where: { id: invoice.id },
      data: {
        customerId: input.customerId ?? undefined,
        issueDate: input.issueDate ?? undefined,
        dueDate: input.dueDate ?? undefined,
        notes: input.notes ?? undefined,
        discountType: input.discountType ?? undefined,
      },
    });
  }

  async updateStatus(invoiceId: string, newStatus: string) {
    const invoice = await this.getById(invoiceId);

    return await db.invoice.update({
      where: { id: invoice.id },
      data: { status: newStatus },
    });
  }

  async markSent(invoiceId: string) {
    const invoice = await this.getById(invoiceId);

    return await db.invoice.update({
      where: { id: invoice.id },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });
  }

  async markViewed(invoiceId: string) {
    const invoice = await this.getById(invoiceId);

    if (invoice.status === "DRAFT") {
      throw new Error("Cannot mark draft invoices as viewed");
    }

    return await db.invoice.update({
      where: { id: invoice.id },
      data: { viewedAt: new Date() },
    });
  }

  async getOverdue() {
    const now = new Date();

    return await db.invoice.findMany({
      where: {
        organizationId: this.organizationId,
        dueDate: {
          lt: now,
        },
        status: {
          in: ["SENT", "VIEWED", "PARTIALLY_PAID"],
        },
      },
      include: {
        customer: true,
      },
    });
  }

  async getByCustomer(customerId: string) {
    return await db.invoice.findMany({
      where: {
        organizationId: this.organizationId,
        customerId,
      },
      orderBy: { issueDate: "desc" },
      include: {
        items: true,
        payments: true,
      },
    });
  }

  async count() {
    return await db.invoice.count({
      where: {
        organizationId: this.organizationId,
      },
    });
  }

  async countByStatus(status: string) {
    return await db.invoice.count({
      where: {
        organizationId: this.organizationId,
        status,
      },
    });
  }
}
