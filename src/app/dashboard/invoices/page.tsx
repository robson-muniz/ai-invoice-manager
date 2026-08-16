"use client";

import { useState } from "react";
import { useOrganization } from "@/lib/hooks";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import { InvoiceDetail } from "@/components/invoices/InvoiceDetail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ArrowLeft, Loader2 } from "lucide-react";

export default function InvoicesPage() {
  const { organizationId, isLoading } = useOrganization();
  const [view, setView] = useState<"list" | "create" | "detail">("list");
  const [selectedInvoice, setSelectedInvoice] = useState<{ id: string } | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Please select or join an organization to manage invoices.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-500 mt-1">Create, track, and manage customer invoices</p>
        </div>
        {view === "list" ? (
          <Button onClick={() => setView("create")} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setView("list")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
        )}
      </div>

      {/* Main Content */}
      {view === "list" && (
        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceList
              organizationId={organizationId}
              onView={(invoice) => {
                setSelectedInvoice(invoice);
                setView("detail");
              }}
            />
          </CardContent>
        </Card>
      )}

      {view === "create" && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceForm
              organizationId={organizationId}
              onSuccess={() => setView("list")}
              onCancel={() => setView("list")}
            />
          </CardContent>
        </Card>
      )}

      {view === "detail" && selectedInvoice && (
        <Card>
          <CardContent className="pt-6">
            <InvoiceDetail
              organizationId={organizationId}
              invoiceId={selectedInvoice.id}
              onBack={() => setView("list")}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
