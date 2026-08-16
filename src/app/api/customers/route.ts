import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/server/auth/helpers";
import { requireOrganizationAccess } from "@/server/permissions/authorization";
import { CustomerService } from "@/server/services/CustomerService";

export async function POST(req: NextRequest) {
  try {
    await getCurrentUserOrThrow();
    const body = await req.json();

    // Verify user has access to this organization
    const { organizationId } = body;
    await requireOrganizationAccess(organizationId);

    const service = new CustomerService(organizationId);
    const customer = await service.create(body);

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await getCurrentUserOrThrow();
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    await requireOrganizationAccess(organizationId);

    const service = new CustomerService(organizationId);
    const customers = await service.list();

    return NextResponse.json(customers);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
