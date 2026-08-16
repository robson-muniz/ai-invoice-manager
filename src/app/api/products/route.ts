import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/server/auth/helpers";
import { requireOrganizationAccess } from "@/server/permissions/authorization";
import { ProductService } from "@/server/services/ProductService";

export async function POST(req: NextRequest) {
  try {
    await getCurrentUserOrThrow();
    const body = await req.json();

    const { organizationId } = body;
    await requireOrganizationAccess(organizationId);

    const service = new ProductService(organizationId);
    const product = await service.create(body);

    return NextResponse.json(product, { status: 201 });
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

    const service = new ProductService(organizationId);
    const products = await service.list();

    return NextResponse.json(products);
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
