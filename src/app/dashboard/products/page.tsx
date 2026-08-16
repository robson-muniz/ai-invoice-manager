"use client";

import { useState } from "react";
import { useOrganization } from "@/lib/hooks";
import { ProductList } from "@/components/products/ProductList";
import { ProductForm } from "@/components/products/ProductForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ArrowLeft, Loader2 } from "lucide-react";

export default function ProductsPage() {
  const { organizationId, isLoading } = useOrganization();
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [selectedProduct, setSelectedProduct] = useState<{ id: string } | null>(null);

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
        <p className="text-gray-500">Please select or join an organization to manage products.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products & Services</h1>
          <p className="text-slate-500 mt-1">Manage reusable catalog items, prices, and SKUs</p>
        </div>
        {view === "list" ? (
          <Button onClick={() => setView("create")} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setView("list")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Catalog
          </Button>
        )}
      </div>

      {/* Main Content */}
      {view === "list" && (
        <Card>
          <CardHeader>
            <CardTitle>Catalog Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductList
              organizationId={organizationId}
              onEdit={(product) => {
                setSelectedProduct(product);
                setView("edit");
              }}
            />
          </CardContent>
        </Card>
      )}

      {(view === "create" || view === "edit") && (
        <Card>
          <CardHeader>
            <CardTitle>{view === "create" ? "Add New Product / Service" : "Edit Product / Service"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm
              organizationId={organizationId}
              productId={view === "edit" ? selectedProduct?.id : undefined}
              onSuccess={() => setView("list")}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
