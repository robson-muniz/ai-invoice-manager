import { useSession } from "next-auth/react";

export function useOrganization() {
  const { data: session, status } = useSession();

  const organizationId = (session as any)?.organizationId as string | undefined;
  const organizationRole = (session as any)?.organizationRole as string | undefined;

  return {
    organizationId,
    organizationRole,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
