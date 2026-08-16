import { useCallback, useState } from "react";

interface ApiError {
  error: string;
}

export function useInvoices(organizationId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (data: Record<string, unknown>) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, organizationId }),
        });

        if (!response.ok) {
          const errorData = (await response.json()) as ApiError;
          throw new Error(errorData.error || "Failed to create invoice");
        }

        return await response.json();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [organizationId]
  );

  const list = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/invoices?organizationId=${organizationId}`
      );

      if (!response.ok) {
        const errorData = (await response.json()) as ApiError;
        throw new Error(errorData.error || "Failed to fetch invoices");
      }

      return await response.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const getById = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/invoices/${id}?organizationId=${organizationId}`
        );

        if (!response.ok) {
          const errorData = (await response.json()) as ApiError;
          throw new Error(errorData.error || "Failed to fetch invoice");
        }

        return await response.json();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [organizationId]
  );

  const update = useCallback(
    async (id: string, data: Record<string, unknown>) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/invoices/${id}?organizationId=${organizationId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          const errorData = (await response.json()) as ApiError;
          throw new Error(errorData.error || "Failed to update invoice");
        }

        return await response.json();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [organizationId]
  );

  const transitionStatus = useCallback(
    async (id: string, status: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/invoices/${id}?organizationId=${organizationId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          }
        );

        if (!response.ok) {
          const errorData = (await response.json()) as ApiError;
          throw new Error(
            errorData.error || "Failed to update invoice status"
          );
        }

        return await response.json();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [organizationId]
  );

  return {
    create,
    list,
    getById,
    update,
    transitionStatus,
    loading,
    error,
  };
}
