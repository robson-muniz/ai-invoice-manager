"use client";

import { useEffect, useState } from "react";
import { useProducts } from "@/lib/hooks";
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
import { Edit2, Power, Loader2 } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { centsToDollars } from "@/lib/money";

interface Product {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  taxRate: number;
  currency: string;
  active: boolean;
}

interface ProductListProps {
  organizationId: string;
  onEdit?: (product: Product) => void;
}

export function ProductList({ organizationId, onEdit }: ProductListProps) {
  const { list, deactivate, error } = useProducts(organizationId);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deactivating, setDeactivating] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const data = await list();
        setProducts(data || []);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [list]);

  const handleDeactivate = async (productId: string) => {
    if (!window.confirm("Are you sure you want to deactivate this product?")) {
      return;
    }

    try {
      setDeactivating(productId);
      await deactivate(productId);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, active: false } : p))
      );
    } catch (err) {
      console.error("Failed to deactivate product:", err);
    } finally {
      setDeactivating(null);
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

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-gray-500">No products yet. Create one to get started.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Unit Price</TableHead>
          <TableHead>Tax Rate</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{product.sku}</TableCell>
            <TableCell>
              {product.currency} {centsToDollars(product.unitPrice).toFixed(2)}
            </TableCell>
            <TableCell>{(product.taxRate / 100).toFixed(2)}%</TableCell>
            <TableCell>
              <Badge variant={product.active ? "default" : "secondary"}>
                {product.active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit?.(product)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                {product.active && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={deactivating === product.id}
                    onClick={() => handleDeactivate(product.id)}
                  >
                    {deactivating === product.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Power className="h-4 w-4" />
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
