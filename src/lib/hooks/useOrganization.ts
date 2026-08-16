import { useSession } from "next-auth/react";

export function useOrganization() {
  const { data: session, status } = useSession();

  const organizationId = session?.organizationId;
  const organizationRole = session?.organizationRole;

  return {
    organizationId,
    organizationRole,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
