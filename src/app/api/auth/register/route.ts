import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/server/db";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
  organizationName: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(100),
});

/**
 * POST /api/auth/register
 *
 * Creates a new user + organization + owner membership in a single transaction.
 * After registration, the client should call signIn() from next-auth/react.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    // Check if email is already in use
    const existingUser = await db.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hash(validated.password, 12);

    // Generate a URL-safe slug from the organization name
    const slug = validated.organizationName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Ensure slug is unique by appending random suffix if necessary
    const existingOrg = await db.organization.findFirst({
      where: { slug },
    });

    const finalSlug = existingOrg
      ? `${slug}-${Math.random().toString(36).slice(2, 8)}`
      : slug;

    // Create user + organization + membership atomically
    await db.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          email: validated.email,
          passwordHash,
        },
      });

      const organization = await tx.organization.create({
        data: {
          name: validated.organizationName,
          slug: finalSlug,
        },
      });

      await tx.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: "OWNER",
        },
      });

      // Create a free subscription for the new organization
      await tx.subscription.create({
        data: {
          organizationId: organization.id,
          plan: "FREE",
          status: "ACTIVE",
        },
      });

      return user;
    });

    return NextResponse.json(
      { message: "Account created successfully" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message ?? "Validation failed" },
        { status: 422 }
      );
    }

    if (error instanceof Error) {
      console.error("[register]", error.message);
    }

    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
