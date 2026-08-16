import { db } from "@/server/db";
import { InvoiceRepository } from "@/server/repositories/InvoiceRepository";
import { CustomerRepository } from "@/server/repositories/CustomerRepository";
import { ProductRepository } from "@/server/repositories/ProductRepository";
import {
  createInvoiceSchema,
  updateInvoiceSchema,
} from "@/server/validators/invoiceSchemas";
import {
  calculateDiscount,
  calculateTax,
  addCents,
  subtractCents,
} from "@/lib/money";
import Decimal from "decimal.js";

type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

/**
 * InvoiceService handles all invoice-related business logic
 * CRITICAL: All calculations are performed server-side
 * CRITICAL: Invoice state transitions are validated here
 */
export class InvoiceService {
  private invoiceRepository: InvoiceRepository;
  private customerRepository: CustomerRepository;
  private productRepository: ProductRepository;
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
    this.invoiceRepository = new InvoiceRepository(organizationId);
    this.customerRepository = new CustomerRepository(organizationId);
    this.productRepository = new ProductRepository(organizationId);
  }

  /**
   * Calculate invoice totals (CRITICAL: Server-side only)
   * Never trust calculations sent from the browser
   */
  private calculateTotals(
    items: Array<{
      quantity: number;
      unitPrice: number;
      taxRate: number;
    }>,
    discountType?: "PERCENTAGE" | "FIXED",
    discountValue?: number
  ) {
    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = Math.round(
        new Decimal(item.quantity)
          .times(item.unitPrice)
          .toNumber()
      );
      return addCents(sum, itemTotal);
    }, 0);

    // Calculate discount
    const rawDiscount =
      discountType && discountValue
        ? calculateDiscount(subtotal, discountType, discountValue)
        : 0;
    const discount = Math.min(subtotal, rawDiscount);

    // Tax base after discount
    const taxBase = Math.max(0, subtractCents(subtotal, discount));

    // Calculate total tax on discounted tax base
    const totalTax = items.reduce((sum, item) => {
      const itemSubtotal = Math.round(
        new Decimal(item.quantity)
          .times(item.unitPrice)
          .toNumber()
      );
      const itemRatio = subtotal > 0 ? itemSubtotal / subtotal : 0;
      const itemTaxBase = Math.round(taxBase * itemRatio);
      const itemTax = calculateTax(itemTaxBase, item.taxRate);
      return addCents(sum, itemTax);
    }, 0);

    const total = addCents(taxBase, totalTax);

    return {
      subtotal,
      discount,
      tax: totalTax,
      total,
    };
  }

  /**
   * Generate next invoice number (concurrency-safe sequentially based on DB records)
   */
  private async generateInvoiceNumber(): Promise<string> {
    const latest = await this.invoiceRepository.getLatestInvoiceNumber();
    if (!latest) {
      return "INV-000001";
    }

    const match = latest.match(/INV-(\d+)/);
    if (!match) {
      const count = await this.invoiceRepository.count();
      return `INV-${String(count + 1).padStart(6, "0")}`;
    }

    const nextNum = parseInt(match[1]!, 10) + 1;
    return `INV-${String(nextNum).padStart(6, "0")}`;
  }

  /**
   * Verify valid status transition
   */
  private isValidStatusTransition(
    currentStatus: InvoiceStatus,
    newStatus: InvoiceStatus
  ): boolean {
    const validTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
      DRAFT: ["SENT", "CANCELLED"],
      SENT: ["VIEWED", "PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED"],
      VIEWED: ["PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED"],
      PARTIALLY_PAID: ["PAID", "OVERDUE", "CANCELLED"],
      PAID: [], // Terminal state
      OVERDUE: ["PAID", "CANCELLED"],
      CANCELLED: [], // Terminal state
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }

  /**
   * Create a new invoice with items
   */
  async create(input: unknown) {
    const validated = createInvoiceSchema.parse(input);

    // Verify customer exists
    await this.customerRepository.getById(validated.customerId);

    // Validate items
    const itemsWithDetails = await Promise.all(
      validated.items.map(async (item) => {
        let unitPrice = item.unitPrice;
        let taxRate = item.taxRate;

        // If product is referenced, use its details
        if (item.productId) {
          const product = await this.productRepository.getById(
            item.productId
          );
          unitPrice = product.unitPrice;
          taxRate = product.taxRate;
        }

        return {
          productId: item.productId || undefined,
          description: item.description,
          quantity: new Decimal(item.quantity),
          unitPrice,
          taxRate,
        };
      })
    );

    // Calculate totals (server-side only)
    const amounts = this.calculateTotals(
      itemsWithDetails.map((item) => ({
        quantity: item.quantity.toNumber(),
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
      })),
      validated.discountType,
      validated.discountValue
    );

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    // Create invoice
    return await this.invoiceRepository.create(
      validated,
      itemsWithDetails,
      invoiceNumber,
      amounts
    );
  }

  /**
   * Update invoice (only drafts can be edited)
   */
  async update(invoiceId: string, input: unknown) {
    const validated = updateInvoiceSchema.parse(input);
    const invoice = await this.invoiceRepository.getById(invoiceId);

    if (invoice.status !== "DRAFT") {
      throw new Error("Can only edit draft invoices");
    }

    return await this.invoiceRepository.update(invoiceId, validated);
  }

  /**
   * Transition invoice to new status with validation
   */
  async transitionStatus(invoiceId: string, newStatus: InvoiceStatus) {
    const invoice = await this.invoiceRepository.getById(invoiceId);

    if (!this.isValidStatusTransition(invoice.status as InvoiceStatus, newStatus)) {
      throw new Error(
        `Cannot transition from ${invoice.status} to ${newStatus}`
      );
    }

    return await this.invoiceRepository.updateStatus(invoiceId, newStatus);
  }

  /**
   * Send invoice to customer
   */
  async send(invoiceId: string) {
    const invoice = await this.invoiceRepository.getById(invoiceId);

    if (invoice.status !== "DRAFT") {
      throw new Error("Can only send draft invoices");
    }

    return await this.invoiceRepository.markSent(invoiceId);
  }

  /**
   * Mark invoice as viewed by customer
   */
  async markViewed(invoiceId: string) {
    return await this.invoiceRepository.markViewed(invoiceId);
  }

  /**
   * Get invoice details
   */
  async getById(invoiceId: string) {
    return await this.invoiceRepository.getById(invoiceId);
  }

  /**
   * List invoices
   */
  async list(skip = 0, take = 50) {
    return await this.invoiceRepository.getAll(skip, take);
  }

  /**
   * Get invoices for a customer
   */
  async getByCustomer(customerId: string) {
    return await this.invoiceRepository.getByCustomer(customerId);
  }

  /**
   * Get overdue invoices
   */
  async getOverdue() {
    return await this.invoiceRepository.getOverdue();
  }

  /**
   * Get total revenue
   */
  async getTotalRevenue() {
    const invoices = await db.invoice.findMany({
      where: {
        organizationId: this.organizationId,
        status: "PAID",
      },
      select: {
        totalAmount: true,
      },
    });

    return invoices.reduce((sum: number, inv: { totalAmount: number }) => addCents(sum, inv.totalAmount), 0);
  }

  /**
   * Get outstanding amount
   */
  async getOutstanding() {
    const invoices = await db.invoice.findMany({
      where: {
        organizationId: this.organizationId,
        status: {
          in: ["SENT", "VIEWED", "PARTIALLY_PAID"],
        },
      },
      select: {
        totalAmount: true,
        paidAmount: true,
      },
    });

    return invoices.reduce((sum: number, inv: { totalAmount: number; paidAmount: number }) => {
      const outstanding = subtractCents(inv.totalAmount, inv.paidAmount);
      return addCents(sum, outstanding);
    }, 0);
  }

  async getCount() {
    return await this.invoiceRepository.count();
  }

  async getCountByStatus(status: string) {
    return await this.invoiceRepository.countByStatus(status);
  }
}
