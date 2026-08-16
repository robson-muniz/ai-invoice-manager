# API Routes Documentation

## Overview
All API routes follow a consistent pattern:
1. Authenticate user with `getCurrentUserOrThrow()`
2. Verify organization access with `requireOrganizationAccess(organizationId)`
3. Use appropriate Service class for business logic
4. Return JSON with proper error handling

## Authorization
All endpoints require:
- Valid session (authenticated user)
- User must be member of the organization
- Multi-tenant isolation enforced

## Error Handling
Standard error responses:
```json
{
  "error": "Error message describing what went wrong"
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad request (validation error, invalid organization, etc.)
- 401: Unauthorized (no session)
- 403: Forbidden (no access to organization)
- 500: Internal server error

---

## Customers API

### POST /api/customers
Create a new customer.

**Request:**
```json
{
  "organizationId": "org-123",
  "name": "Acme Corporation",
  "email": "contact@acme.com",
  "company": "Acme Inc",
  "phone": "+1-555-0100",
  "address": "123 Main St",
  "city": "Springfield",
  "postalCode": "12345",
  "country": "US",
  "taxNumber": "12-3456789",
  "notes": "Preferred customer"
}
```

**Response:** 201 Created
```json
{
  "id": "cust-abc123",
  "organizationId": "org-123",
  "name": "Acme Corporation",
  "email": "contact@acme.com",
  "company": "Acme Inc",
  "phone": "+1-555-0100",
  "address": "123 Main St",
  "city": "Springfield",
  "postalCode": "12345",
  "country": "US",
  "taxNumber": "12-3456789",
  "notes": "Preferred customer",
  "deletedAt": null,
  "createdAt": "2025-01-13T12:00:00Z",
  "updatedAt": "2025-01-13T12:00:00Z"
}
```

### GET /api/customers?organizationId=org-123
List all customers for an organization.

**Response:** 200 OK
```json
[
  {
    "id": "cust-abc123",
    "organizationId": "org-123",
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    ...
  },
  ...
]
```

### GET /api/customers/[id]?organizationId=org-123
Get a specific customer.

**Response:** 200 OK
```json
{
  "id": "cust-abc123",
  "organizationId": "org-123",
  "name": "Acme Corporation",
  ...
}
```

### PUT /api/customers/[id]?organizationId=org-123
Update a customer (any field can be updated).

**Request:**
```json
{
  "name": "Acme Corporation Updated",
  "email": "newemail@acme.com"
}
```

**Response:** 200 OK (updated customer object)

### DELETE /api/customers/[id]?organizationId=org-123
Soft delete a customer (sets deletedAt timestamp).

**Response:** 200 OK
```json
{
  "success": true
}
```

---

## Products API

### POST /api/products
Create a new product.

**Request:**
```json
{
  "organizationId": "org-123",
  "name": "Web Development",
  "description": "Professional web development services",
  "sku": "WEB-DEV-001",
  "unitPrice": 15000,
  "taxRate": 1000,
  "currency": "USD",
  "active": true
}
```

Note: unitPrice is in cents (15000 = $150.00), taxRate is in basis points (1000 = 10%)

**Response:** 201 Created

### GET /api/products?organizationId=org-123
List all active products for an organization.

**Response:** 200 OK (array of products)

### GET /api/products/[id]?organizationId=org-123
Get a specific product.

**Response:** 200 OK (product object)

### PUT /api/products/[id]?organizationId=org-123
Update a product (any field can be updated).

**Request:**
```json
{
  "name": "Web Development Services",
  "unitPrice": 20000
}
```

**Response:** 200 OK (updated product object)

---

## Invoices API

### POST /api/invoices
Create a new invoice with automatic calculations.

**Request:**
```json
{
  "organizationId": "org-123",
  "customerId": "cust-abc123",
  "issueDate": "2025-01-13T00:00:00Z",
  "dueDate": "2025-02-13T00:00:00Z",
  "items": [
    {
      "productId": "prod-123",
      "description": "Web Development",
      "quantity": 10,
      "unitPrice": 15000,
      "taxRate": 1000
    }
  ],
  "discount": {
    "type": "PERCENTAGE",
    "value": 500
  },
  "notes": "Thank you for your business",
  "paymentMethod": "BANK_TRANSFER"
}
```

Note: All prices in cents, tax rates in basis points

**Response:** 201 Created
```json
{
  "id": "inv-xyz789",
  "organizationId": "org-123",
  "customerId": "cust-abc123",
  "invoiceNumber": "INV-2025-000001",
  "status": "DRAFT",
  "issueDate": "2025-01-13T00:00:00Z",
  "dueDate": "2025-02-13T00:00:00Z",
  "items": [...],
  "subtotal": 150000,
  "discountAmount": 7500,
  "taxAmount": 14250,
  "total": 156750,
  "paidAmount": 0,
  "discount": { "type": "PERCENTAGE", "value": 500 },
  "notes": "Thank you for your business",
  "paymentMethod": "BANK_TRANSFER",
  "createdAt": "2025-01-13T12:00:00Z",
  "updatedAt": "2025-01-13T12:00:00Z",
  "sentAt": null,
  "viewedAt": null,
  "paidAt": null
}
```

### GET /api/invoices?organizationId=org-123
List all invoices for an organization.

**Response:** 200 OK (array of invoices with customer and item details)

### GET /api/invoices/[id]?organizationId=org-123
Get a specific invoice with all details.

**Response:** 200 OK (invoice object with customer, items, payments)

### PUT /api/invoices/[id]?organizationId=org-123
Update a DRAFT invoice or transition status.

**To update DRAFT invoice:**
```json
{
  "notes": "Updated notes",
  "dueDate": "2025-02-20T00:00:00Z"
}
```

**To transition status:**
```json
{
  "status": "SENT"
}
```

Valid transitions:
- DRAFT → SENT, CANCELLED
- SENT → VIEWED, PAID, PARTIALLY_PAID, OVERDUE, CANCELLED
- VIEWED → PAID, PARTIALLY_PAID, OVERDUE, CANCELLED
- PARTIALLY_PAID → PAID, OVERDUE, CANCELLED
- PAID, OVERDUE, CANCELLED → (terminal, no transitions)

**Response:** 200 OK (updated invoice object)

---

## React Hooks

### useCustomers(organizationId)
```typescript
const { create, list, getById, update, delete: deleteCustomer, loading, error } = useCustomers(organizationId);

// Create customer
await create({ name, email, company, ... });

// List customers
const customers = await list();

// Get customer details
const customer = await getById(customerId);

// Update customer
await update(customerId, { name, email, ... });

// Delete customer (soft delete)
await deleteCustomer(customerId);
```

### useProducts(organizationId)
```typescript
const { create, list, getById, update, deactivate, loading, error } = useProducts(organizationId);

// Create product
await create({ name, description, sku, unitPrice, taxRate, ... });

// List products
const products = await list();

// Get product details
const product = await getById(productId);

// Update product
await update(productId, { name, unitPrice, ... });

// Deactivate product
await deactivate(productId);
```

### useInvoices(organizationId)
```typescript
const { create, list, getById, update, transitionStatus, loading, error } = useInvoices(organizationId);

// Create invoice
await create({ customerId, items, discount, dueDate, ... });

// List invoices
const invoices = await list();

// Get invoice details
const invoice = await getById(invoiceId);

// Update invoice
await update(invoiceId, { notes, dueDate, ... });

// Transition status
await transitionStatus(invoiceId, "SENT");
```

---

## Financial Calculations

All monetary values use the following conventions:
- **Amounts:** Stored and transmitted in cents (integers)
  - $150.00 = 15000 cents
  - $0.99 = 99 cents
- **Tax/Discount rates:** Stored in basis points (integers)
  - 10% = 1000 basis points
  - 5.5% = 550 basis points
  - 0.1% = 10 basis points

### Invoice Calculation
```
subtotal = sum(item.quantity × item.unitPrice for each item)
discount = if type == PERCENTAGE: subtotal × (value / 10000)
           else if type == FIXED: value
           else: 0
tax = sum(max(0, subtotal - discount) × item.taxRate / 10000 for each item)
total = subtotal - discount + tax
```

All calculations are performed **server-side only** using Decimal.js for precision.

---

## Error Handling Examples

### Validation Error
```json
{
  "error": "Customer email 'duplicate@acme.com' already exists"
}
```

### Authorization Error
```json
{
  "error": "Unauthorized"
}
```

### Not Found
```json
{
  "error": "Customer with ID 'cust-xyz' not found"
}
```

### Invalid State Transition
```json
{
  "error": "Cannot transition from PAID to SENT"
}
```

---

## Testing the API

### With curl
```bash
# Create customer
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org-123",
    "name": "Test Customer",
    "email": "test@example.com"
  }'

# List customers
curl http://localhost:3000/api/customers?organizationId=org-123

# Get invoice details
curl http://localhost:3000/api/invoices/inv-123?organizationId=org-123
```

### With React component
```tsx
import { useInvoices } from '@/lib/hooks';

export function CreateInvoiceForm() {
  const { create, loading, error } = useInvoices(organizationId);
  
  const handleSubmit = async (data) => {
    try {
      const invoice = await create(data);
      console.log("Invoice created:", invoice);
    } catch (err) {
      console.error("Failed to create invoice:", err);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {/* form fields */}
      <button disabled={loading}>
        {loading ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```
