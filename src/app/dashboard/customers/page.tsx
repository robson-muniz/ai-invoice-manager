"use client";

import { useState } from "react";
import { useOrganization } from "@/lib/hooks";
import { CustomerList } from "@/components/customers/CustomerList";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ArrowLeft, Loader2 } from "lucide-react";

export default function CustomersPage() {
  const { organizationId, isLoading } = useOrganization();
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: string } | null>(null);

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
        <p className="text-gray-500">Please select or join an organization to manage customers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500 mt-1">Manage client records, billing details, and contacts</p>
        </div>
        {view === "list" ? (
          <Button onClick={() => setView("create")} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setView("list")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
        )}
      </div>

      {/* Main Content */}
      {view === "list" && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerList
              organizationId={organizationId}
              onEdit={(customer) => {
                setSelectedCustomer(customer);
                setView("edit");
              }}
            />
          </CardContent>
        </Card>
      )}

      {(view === "create" || view === "edit") && (
        <Card>
          <CardHeader>
            <CardTitle>{view === "create" ? "Add New Customer" : "Edit Customer"}</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerForm
              organizationId={organizationId}
              customerId={view === "edit" ? selectedCustomer?.id : undefined}
              onSuccess={() => setView("list")}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
