import { db } from "@/server/db";
import { hash } from "bcryptjs";

const seed = async () => {
  console.log("🌱 Starting seed...");

  // Keep the credentials advertised on the login page valid even when this
  // script is run against a database that already contains the demo user.
  const demoPasswordHash = await hash("demo123456", 10);

  // Create test user
  const user = await db.user.upsert({
    where: { email: "demo@example.com" },
    update: { passwordHash: demoPasswordHash },
    create: {
      email: "demo@example.com",
      passwordHash: demoPasswordHash,
    },
  });

  console.log("✓ Created test user:", user.email);

  // Create test organization
  const org = await db.organization.upsert({
    where: { slug: "demo-company" },
    update: {},
    create: {
      name: "Demo Company",
      slug: "demo-company",
    },
  });

  console.log("✓ Created test organization:", org.name);

  // Add user as owner to organization
  await db.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      userId: user.id,
      role: "OWNER",
    },
  });

  console.log("✓ Created organization membership (OWNER)");

  // Create a test customer
  const customer = await db.customer.upsert({
    where: { organizationId_email: { organizationId: org.id, email: "client@example.com" } },
    update: {},
    create: {
      organizationId: org.id,
      name: "Acme Corporation",
      email: "client@example.com",
      company: "Acme Corp",
      country: "USA",
    },
  });

  console.log("✓ Created test customer:", customer.name);

  // Create test products
  await db.product.upsert({
    where: {
      organizationId_sku: { organizationId: org.id, sku: "WEB-DEV-001" },
    },
    update: {
      name: "Web Development",
      description: "Professional web development services",
      unitPrice: 15000,
      taxRate: 1000,
      currency: "USD",
    },
    create: {
      organizationId: org.id,
      name: "Web Development",
      description: "Professional web development services",
      sku: "WEB-DEV-001",
      unitPrice: 15000, // $150.00
      taxRate: 1000, // 10%
      currency: "USD",
    },
  });

  await db.product.upsert({
    where: {
      organizationId_sku: { organizationId: org.id, sku: "MAINT-001" },
    },
    update: {
      name: "Maintenance",
      description: "Monthly maintenance services",
      unitPrice: 5000,
      taxRate: 1000,
      currency: "USD",
    },
    create: {
      organizationId: org.id,
      name: "Maintenance",
      description: "Monthly maintenance services",
      sku: "MAINT-001",
      unitPrice: 5000, // $50.00
      taxRate: 1000, // 10%
      currency: "USD",
    },
  });

  console.log("✓ Created test products");

  // Create test subscription (Free plan)
  await db.subscription.upsert({
    where: { organizationId: org.id },
    update: { plan: "FREE", status: "ACTIVE" },
    create: {
      organizationId: org.id,
      plan: "FREE",
      status: "ACTIVE",
    },
  });

  console.log("✓ Created test subscription (FREE plan)");

  console.log("✅ Seed completed successfully!");
};

seed()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
