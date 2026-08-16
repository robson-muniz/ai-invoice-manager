import { db } from "@/server/db";
import { getCurrentUserOrThrow } from "@/server/auth/helpers";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

/**
 * Verify that a user has access to an organization
 * This is the foundation of multi-tenant security
 */
export async function requireOrganizationAccess(
  organizationId: string
): Promise<{ userId: string; organizationId: string; role: string }> {
  const user = await getCurrentUserOrThrow();

  const membership = await db.organizationMember.findFirst({
    where: {
      organizationId,
      userId: user.id,
    },
  });

  if (!membership) {
    throw new UnauthorizedError(
      `User ${user.id} does not have access to organization ${organizationId}`
    );
  }

  return {
    userId: user.id,
    organizationId,
    role: membership.role,
  };
}

/**
 * Verify that a user has a specific role in an organization
 */
export async function requireOrganizationRole(
  organizationId: string,
  requiredRole: "OWNER" | "ADMIN" | "MEMBER"
): Promise<{ userId: string; organizationId: string; role: string }> {
  const auth = await requireOrganizationAccess(organizationId);

  const roleHierarchy: Record<string, number> = {
    OWNER: 3,
    ADMIN: 2,
    MEMBER: 1,
  };

  const userRoleLevel = roleHierarchy[auth.role] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole];

  if (!requiredRoleLevel || userRoleLevel < requiredRoleLevel) {
    throw new UnauthorizedError(
      `User ${auth.userId} does not have required role ${requiredRole} in organization ${organizationId}`
    );
  }

  return auth;
}

/**
 * Verify that a resource belongs to an organization
 * Prevents IDOR vulnerabilities
 */
export async function verifyResourceOwnership(
  organizationId: string,
  resourceId: string,
  table: "customer" | "invoice" | "product" | "payment" | "subscription"
): Promise<boolean> {
  // First verify user has access to organization
  await requireOrganizationAccess(organizationId);

  // Then verify resource belongs to that organization
  const where = { id: resourceId, organizationId };
  const resource = await {
    customer: () => db.customer.findFirst({ where }),
    invoice: () => db.invoice.findFirst({ where }),
    product: () => db.product.findFirst({ where }),
    payment: () => db.payment.findFirst({ where }),
    subscription: () => db.subscription.findFirst({ where }),
  }[table]();

  if (!resource) {
    throw new NotFoundError(
      `${table} ${resourceId} not found in organization ${organizationId}`
    );
  }

  return true;
}

/**
 * Get user's organizations with membership details
 */
export async function getUserOrganizations() {
  const user = await getCurrentUserOrThrow();

  const memberships = await db.organizationMember.findMany({
    where: {
      userId: user.id,
    },
    include: {
      organization: true,
    },
  });

  return memberships;
}

/**
 * Get user's primary organization (first one they're a member of)
 */
export async function getUserPrimaryOrganization() {
  const memberships = await getUserOrganizations();

  if (memberships.length === 0) {
    throw new UnauthorizedError("User does not belong to any organization");
  }

  return memberships[0]!;
}
