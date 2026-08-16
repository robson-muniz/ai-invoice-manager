"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema } from "@/server/validators/productSchemas";
import { useProducts } from "@/lib/hooks";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { z } from "zod";

type ProductFormData = z.infer<typeof createProductSchema>;

interface ProductFormProps {
  organizationId: string;
  onSuccess?: () => void;
  productId?: string;
  initialData?: Partial<ProductFormData>;
}

export function ProductForm({
  organizationId,
  onSuccess,
  productId,
  initialData,
}: ProductFormProps) {
  const { create, update, loading, error } = useProducts(organizationId);
  const [localError, setLocalError] = useState<string | null>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(createProductSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      sku: "",
      unitPrice: 0,
      taxRate: 1000,
      currency: "USD",
      active: true,
    },
  });

  const onSubmit = useCallback(
    async (data: ProductFormData) => {
      try {
        setLocalError(null);
        if (productId) {
          await update(productId, data);
        } else {
          await create(data);
        }
        form.reset();
        onSuccess?.();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setLocalError(message);
      }
    },
    [create, update, productId, onSuccess, form]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {(error || localError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || localError}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name *</FormLabel>
              <FormControl>
                <Input placeholder="Web Development" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed product description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU *</FormLabel>
              <FormControl>
                <Input placeholder="WEB-DEV-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unitPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Price (in cents) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="15000 (= $150.00)"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="taxRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax Rate (basis points) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="1000 (= 10%)"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency *</FormLabel>
              <FormControl>
                <Input placeholder="USD" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Active</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {productId ? "Update Product" : "Create Product"}
        </Button>
      </form>
    </Form>
  );
}
