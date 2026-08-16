"use client";

import { useEffect, useState } from "react";
import { useInvoices } from "@/lib/hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit2, Send, Loader2 } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { centsToDollars } from "@/lib/money";
import { format } from "date-fns";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer: { name: string };
  status: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  total?: number;
  paidAmount: number;
}

interface InvoiceListProps {
  organizationId: string;
  onEdit?: (invoice: Invoice) => void;
  onView?: (invoice: Invoice) => void;
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

export function InvoiceList({
  organizationId,
  onEdit,
  onView,
}: InvoiceListProps) {
  const { list, transitionStatus, error } = useInvoices(organizationId);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transitioning, setTransitioning] = useState<string | null>(null);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setIsLoading(true);
        const data = await list();
        setInvoices(data || []);
      } catch (err) {
        console.error("Failed to load invoices:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoices();
  }, [list]);

  const handleSend = async (invoice: Invoice) => {
    if (invoice.status !== "DRAFT") {
      alert("Only draft invoices can be sent");
      return;
    }

    try {
      setTransitioning(invoice.id);
      await transitionStatus(invoice.id, "SENT");
      setInvoices((prev) =>
        prev.map((i) => (i.id === invoice.id ? { ...i, status: "SENT" } : i))
      );
    } catch (err) {
      console.error("Failed to send invoice:", err);
    } finally {
      setTransitioning(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-gray-500">No invoices yet. Create one to get started.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Issue Date</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Paid</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
            <TableCell>{invoice.customer.name}</TableCell>
            <TableCell>{format(new Date(invoice.issueDate), "MMM d, yyyy")}</TableCell>
            <TableCell>{format(new Date(invoice.dueDate), "MMM d, yyyy")}</TableCell>
            <TableCell className="text-right">
              ${centsToDollars(invoice.totalAmount ?? invoice.total ?? 0).toFixed(2)}
            </TableCell>
            <TableCell className="text-right">
              ${centsToDollars(invoice.paidAmount).toFixed(2)}
            </TableCell>
            <TableCell>
              <Badge className={statusColors[invoice.status]}>
                {invoice.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView?.(invoice)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {invoice.status === "DRAFT" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit?.(invoice)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
                {invoice.status === "DRAFT" && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={transitioning === invoice.id}
                    onClick={() => handleSend(invoice)}
                  >
                    {transitioning === invoice.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
