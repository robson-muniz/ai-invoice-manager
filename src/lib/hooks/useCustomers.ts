import { useCallback, useState } from "react";

interface ApiError {
  error: string;
}

export function useCustomers(organizationId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (data: Record<string, unknown>) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, organizationId }),
        });

        if (!response.ok) {
          const errorData = (await response.json()) as ApiError;
          throw new Error(errorData.error || "Failed to create customer");
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
        `/api/customers?organizationId=${organizationId}`
      );

      if (!response.ok) {
        const errorData = (await response.json()) as ApiError;
        throw new Error(errorData.error || "Failed to fetch customers");
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
          `/api/customers/${id}?organizationId=${organizationId}`
        );

        if (!response.ok) {
          const errorData = (await response.json()) as ApiError;
          throw new Error(errorData.error || "Failed to fetch customer");
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
          `/api/customers/${id}?organizationId=${organizationId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          const errorData = (await response.json()) as ApiError;
          throw new Error(errorData.error || "Failed to update customer");
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

  const delete_ = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/customers/${id}?organizationId=${organizationId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const errorData = (await response.json()) as ApiError;
          throw new Error(errorData.error || "Failed to delete customer");
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
    delete: delete_,
    loading,
    error,
  };
}
