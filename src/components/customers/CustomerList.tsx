"use client";

import { useEffect, useState } from "react";
import { useCustomers } from "@/lib/hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, Loader2 } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  city: string;
  country: string;
}

interface CustomerListProps {
  organizationId: string;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customerId: string) => void;
}

export function CustomerList({
  organizationId,
  onEdit,
  onDelete,
}: CustomerListProps) {
  const { list, delete: deleteCustomer, error } =
    useCustomers(organizationId);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setIsLoading(true);
        const data = await list();
        setCustomers(data || []);
      } catch (err) {
        console.error("Failed to load customers:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomers();
  }, [list]);

  const handleDelete = async (customerId: string) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    try {
      setDeleting(customerId);
      await deleteCustomer(customerId);
      setCustomers((prev) => prev.filter((c) => c.id !== customerId));
      onDelete?.(customerId);
    } catch (err) {
      console.error("Failed to delete customer:", err);
    } finally {
      setDeleting(null);
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

  if (customers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-gray-500">No customers yet. Create one to get started.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>City</TableHead>
          <TableHead>Country</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell className="font-medium">{customer.name}</TableCell>
            <TableCell>{customer.email}</TableCell>
            <TableCell>{customer.company}</TableCell>
            <TableCell>{customer.city}</TableCell>
            <TableCell>{customer.country}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit?.(customer)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={deleting === customer.id}
                  onClick={() => handleDelete(customer.id)}
                >
                  {deleting === customer.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
