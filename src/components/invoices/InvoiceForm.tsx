"use client";

import { useCallback, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInvoiceSchema } from "@/server/validators/invoiceSchemas";
import { useInvoices, useCustomers, useProducts } from "@/lib/hooks";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Trash2, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import type { z } from "zod";

type InvoiceFormData = z.infer<typeof createInvoiceSchema>;

interface Customer {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  unitPrice: number;
  taxRate: number;
}

interface InvoiceFormProps {
  organizationId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  invoiceId?: string;
  initialData?: Partial<InvoiceFormData>;
}

export function InvoiceForm({
  organizationId,
  onSuccess,
  onCancel,
  invoiceId,
  initialData,
}: InvoiceFormProps) {
  const { create, update, loading, error } = useInvoices(organizationId);
  const { list: listCustomers } = useCustomers(organizationId);
  const { list: listProducts } = useProducts(organizationId);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [customersData, productsData] = await Promise.all([
          listCustomers(),
          listProducts(),
        ]);
        setCustomers(customersData || []);
        setProducts(productsData || []);
      } catch (err) {
        console.error("Failed to load customers/products:", err);
      }
    };
    load();
  }, [listCustomers, listProducts]);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(createInvoiceSchema) as any,
    defaultValues: (initialData as any) || {
      organizationId,
      customerId: "",
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: [{ productId: "", description: "", quantity: 1, unitPrice: 0, taxRate: 1000 }],
      discountType: "PERCENTAGE",
      discountValue: 0,
      currency: "USD",
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = useCallback(
    async (data: InvoiceFormData) => {
      try {
        setLocalError(null);
        if (invoiceId) {
          await update(invoiceId, data);
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
    [create, update, invoiceId, onSuccess, form]
  );

  const handleAddProduct = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.unitPrice`, product.unitPrice);
      form.setValue(`items.${index}.taxRate`, product.taxRate);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {(error || localError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || localError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    <SelectItem value="CHECK">Check</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Invoice Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  productId: "",
                  description: "",
                  quantity: 1,
                  unitPrice: 0,
                  taxRate: 1000,
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-3 rounded-lg border p-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleAddProduct(index, value);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Item description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
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
                    name={`items.${index}.unitPrice`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit Price (cents)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
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
                    name={`items.${index}.taxRate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Rate (bp)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Discount Value {form.watch("discountType") === "PERCENTAGE" ? "(bp)" : "(cents)"}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Thank you for your business!" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="w-1/2">
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading} className={onCancel ? "w-1/2 bg-blue-600 hover:bg-blue-700" : "w-full bg-blue-600 hover:bg-blue-700"}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {invoiceId ? "Update Invoice" : "Create Invoice"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
