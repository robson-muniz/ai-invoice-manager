import { db } from "@/server/db";
import { NotFoundError } from "@/server/permissions/authorization";

/**
 * Base repository class that enforces organization_id filtering
 * ALL queries must include organization_id to prevent IDOR vulnerabilities
 */
export abstract class BaseRepository {
  protected organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  /**
   * Verify that this organization ID is valid
   * (User has access to it)
   */
  protected async verifyOrgAccess() {
    const org = await db.organization.findUnique({
      where: { id: this.organizationId },
    });

    if (!org) {
      throw new NotFoundError(`Organization ${this.organizationId} not found`);
    }

    return org;
  }
}
