"use client";

import { useEffect, useState } from "react";
import { useInvoices } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { centsToDollars } from "@/lib/money";
import { format } from "date-fns";

interface InvoiceDetailProps {
  organizationId: string;
  invoiceId: string;
  onBack?: () => void;
}

interface InvoiceItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  product?: { name: string };
}

interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  status: string;
  customer: {
    id: string;
    name: string;
    email: string;
    company: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  discount: { type: string; value: number };
  discountAmount: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  issueDate: string;
  dueDate: string;
  notes: string;
  paymentMethod: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  SENT: "bg-blue-100 text-blue-800",
  VIEWED: "bg-purple-100 text-purple-800",
  PAID: "bg-green-100 text-green-800",
  PARTIALLY_PAID: "bg-yellow-100 text-yellow-800",
  OVERDUE: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

export function InvoiceDetail({
  organizationId,
  invoiceId,
  onBack,
}: InvoiceDetailProps) {
  const { getById, loading, error } = useInvoices(organizationId);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const data = await getById(invoiceId);
        setInvoice(data);
      } catch (err) {
        console.error("Failed to load invoice:", err);
      }
    };

    loadInvoice();
  }, [invoiceId, getById]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || "Invoice not found"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
        <h1 className="text-3xl font-bold">{invoice.invoiceNumber}</h1>
        <Badge className={statusColors[invoice.status]}>
          {invoice.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Bill To</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{invoice.customer.name}</p>
              <p>{invoice.customer.company}</p>
              <p>{invoice.customer.address}</p>
              <p>
                {invoice.customer.city}, {invoice.customer.postalCode}{" "}
                {invoice.customer.country}
              </p>
              <p className="text-gray-500">{invoice.customer.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Issue Date:</span>
                <span>{format(new Date(invoice.issueDate), "MMM d, yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span>{format(new Date(invoice.dueDate), "MMM d, yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span>{invoice.paymentMethod.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span>
                  {format(new Date(invoice.createdAt), "MMM d, yyyy HH:mm")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left font-semibold">Description</th>
                  <th className="px-4 py-2 text-center font-semibold">Qty</th>
                  <th className="px-4 py-2 text-right font-semibold">Unit Price</th>
                  <th className="px-4 py-2 text-right font-semibold">Tax Rate</th>
                  <th className="px-4 py-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-4 py-2">{item.description}</td>
                    <td className="px-4 py-2 text-center">{item.quantity}</td>
                    <td className="px-4 py-2 text-right">
                      ${centsToDollars(item.unitPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {(item.taxRate / 100).toFixed(2)}%
                    </td>
                    <td className="px-4 py-2 text-right">
                      $
                      {centsToDollars(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-end gap-4">
              <span>Subtotal:</span>
              <span>${centsToDollars(invoice.subtotal).toFixed(2)}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-end gap-4 text-red-600">
                <span>
                  Discount ({invoice.discount.type}):
                </span>
                <span>-${centsToDollars(invoice.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-end gap-4">
              <span>Tax:</span>
              <span>${centsToDollars(invoice.taxAmount).toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-end gap-4 font-bold">
              <span>Total:</span>
              <span>${centsToDollars(invoice.total).toFixed(2)}</span>
            </div>
            {invoice.paidAmount > 0 && (
              <>
                <Separator />
                <div className="flex justify-end gap-4 text-green-600">
                  <span>Paid:</span>
                  <span>${centsToDollars(invoice.paidAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-end gap-4 font-bold">
                  <span>Outstanding:</span>
                  <span>
                    ${centsToDollars(invoice.total - invoice.paidAmount).toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
