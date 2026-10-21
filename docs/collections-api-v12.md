# Collections API — Seller Mobile Number in Payment Voucher (v12)

> This document details the backend instructions to include the **Seller's Mobile Number**
> in the **Payment Voucher PDF** generated during the collection **Approve & Accept** process.
>
> Companion to:
> - [`payment-voucher-api.md`](../payment-voucher-api.md) — Original Payment Voucher, Audit Trail & Approval specification
> - [`sellers-extended-fields-api.md`](../sellers-extended-fields-api.md) — Extended seller fields (`users.mobile`, `users.location`)
> - [`sellers-api-changes.md`](../sellers-api-changes.md) — Seller management API and query parameters
> - [`docs/collections-api.md`](./collections-api.md) through [`docs/collections-api-v11.md`](./collections-api-v11.md)

---

## 1. Background & Motivation

When an Admin or Manager reviews and accepts a gemstone collection (`PATCH /api/v1/collections/:id/review`), the backend triggers an automated process:
1. Updates collection status to `accepted`.
2. Persists financial details (`finalized_price`, `payment_method`, and method-specific fields: `bank_details` or `mobile_money_number` + `mobile_money_provider` + `receipt_url`).
3. Records audit metadata (`approved_by`, `approved_at`).
4. Generates a **Barcode** (`barcode_url`).
5. Generates a formal **Payment Voucher PDF** (`voucher_url`).

In the original payment voucher specification ([`payment-voucher-api.md`](../payment-voucher-api.md)), the **Seller Information** section only captured:
- **Seller Name:** `seller.first_name + ' ' + seller.last_name`
- **Seller Email:** `seller.email`

With the introduction of extended seller profile fields ([`sellers-extended-fields-api.md`](../sellers-extended-fields-api.md)), all sellers now have a primary contact mobile number stored in `users.mobile`.

### Goal
The backend PDF generation service must include the **Seller's Mobile Number** (`seller.mobile`) in the generated Payment Voucher PDF under the **Seller Information** section. Furthermore, any collection detail responses returning the embedded `seller` object must also include `seller.mobile`.

---

## 2. Data Sources & Distinctions

### 2.1 Seller Contact Mobile vs. Payment Mobile Money Number

It is critical to distinguish between two distinct mobile phone numbers present in the collection acceptance flow:

| Concept | Field & Source Table | Purpose | Where Rendered on Voucher |
|---|---|---|---|
| **Seller Contact Mobile** | `users.mobile` (via `collections.seller_id`) | Primary contact number from the seller's user account profile. | **Seller Information** section |
| **Payment Mobile Number** | `collections.mobile_money_number` | Payee mobile money account number entered during approval (when `payment_method = 'mobile_money'`). | **Financial / Payment Summary** section |

> [!IMPORTANT]
> The **Seller Information** section must render the seller's profile mobile (`users.mobile`). Do **not** substitute `collections.mobile_money_number` here, as the payment method may be `cash` or `bank_transfer`, or the payment destination number may differ from the seller's registered contact phone.

### 2.2 Database Schema Context

As defined in [`sellers-extended-fields-api.md`](../sellers-extended-fields-api.md), the `users` table contains:

```sql
-- Already present in users table schema
ALTER TABLE users
  ADD COLUMN mobile VARCHAR(30) NULL;
```

No database schema migration is required for the `collections` table. The backend simply joins `users.mobile` when querying the collection's seller.

---

## 3. Payment Voucher PDF — Content Specification

The Payment Voucher is an **A4 portrait PDF** generated server-side upon collection approval.

### 3.1 Updated "Seller Information" Section

Update the voucher template to include the **Mobile** row:

| Label | Source Field | Display Format | Fallback (if null / empty) |
|---|---|---|---|
| **Seller Name** | `seller.first_name` + `seller.last_name` | Full name string (e.g. `Kasun Perera`) | `"—"` |
| **Seller Email** | `seller.email` | Email string (e.g. `kasun.perera@example.com`) | `"N/A"` |
| **Seller Mobile** | `seller.mobile` | Phone string (e.g. `+94 77 123 4567` or `0771234567`) | `"N/A"` |

### 3.2 Visual Layout Example (A4 Portrait PDF)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [COMPANY LOGO]                                          PAYMENT VOUCHER    │
│                                                          VCH-COL-SNG-2026-001│
│                                                          Date: 22 Oct 2026  │
├─────────────────────────────────────────────────────────────────────────────┤
│  COLLECTION SUMMARY                                                         │
│  Serial No:         COL-SNG-2026-001       Collection Type: Single Stone    │
│  Certification No:  GIA-2026-8819          Certification Lab: GIA           │
├─────────────────────────────────────────────────────────────────────────────┤
│  SELLER INFORMATION                                                         │
│  Seller Name:       Kasun Perera                                            │
│  Seller Email:      kasun.perera@example.com                                │
│  Seller Mobile:     +94 77 123 4567   <── [NEW FIELD ADDED HERE]            │
├─────────────────────────────────────────────────────────────────────────────┤
│  FINANCIAL SUMMARY                                                          │
│  Asking Price:      $10,000.00                                              │
│  Finalized Price:   $9,500.00  (BOLD)                                       │
│  Payment Method:    Mobile Money (MVola)                                    │
│  Payment Mobile:    +261 34 12 345 67       (if mobile_money)               │
│  Bank Details:      N/A                     (if bank_transfer)              │
├─────────────────────────────────────────────────────────────────────────────┤
│  APPROVAL & AUDIT                                                           │
│  Approved By:       John Manager (Manager)                                  │
│  Approved On:       22 Oct 2026 at 14:30 UTC                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  This is a system-generated voucher. No signature required.     Page 1 of 1 │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Fallback & Formatting Rules
1. **Null/Empty Handling:** If `seller.mobile` is `null`, `""`, or contains only whitespace, render `"N/A"`. Never render Python `None`, JavaScript `undefined`, or `"null"`.
2. **Trimming:** Trim leading and trailing whitespace from `seller.mobile`.
3. **Format Preservation:** Preserve international dial codes and formatting as stored (e.g., `+94 77 123 4567`, `+261 34 12 345 67`, `0771234567`).

---

## 4. Backend Implementation Workflow

### 4.1 Endpoint: `PATCH /api/v1/collections/:id/review`

When handling collection approval:

```
PATCH /api/v1/collections/:id/review
Authorization: Bearer <token>
Content-Type: multipart/form-data (or application/json)
```

#### Step-by-Step Server Flow:
1. **Authorize:** Ensure caller role is `admin` or `manager`.
2. **Fetch Collection & Seller:** Query collection record along with its seller relationship:
   ```sql
   SELECT
     c.*,
     s.id AS seller_id,
     s.first_name AS seller_first_name,
     s.last_name AS seller_last_name,
     s.email AS seller_email,
     s.mobile AS seller_mobile
   FROM collections c
   INNER JOIN users s ON s.id = c.seller_id
   WHERE c.id = :id;
   ```
3. **Update Collection State:** Update status to `accepted`, set `finalized_price`, `payment_method`, `approved_by`, `approved_at`, etc.
4. **Build PDF Template Context:**
   ```python
   # Example Python / Django / FastAPI service logic
   seller_name = f"{seller.first_name} {seller.last_name or ''}".strip()
   seller_email = seller.email or "N/A"
   seller_mobile = (seller.mobile or "").strip() or "N/A"

   voucher_context = {
       "voucher_no": f"VCH-{collection.serial_no}",
       "issue_date": collection.approved_at.strftime("%d %b %Y"),
       "serial_no": collection.serial_no,
       "collection_type": format_collection_type(collection.collection_type),
       "certification_no": collection.certification_no or "N/A",
       "certification_lab": collection.certification_lab or "N/A",
       "seller_name": seller_name,
       "seller_email": seller_email,
       "seller_mobile": seller_mobile,  # <── Injected here
       "asking_price": f"${collection.asking_price:,.2f}",
       "finalized_price": f"${collection.finalized_price:,.2f}",
       "payment_method": format_payment_method(collection.payment_method),
       "approved_by_name": f"{approver.first_name} {approver.last_name or ''}".strip(),
       "approved_at_formatted": collection.approved_at.strftime("%d %b %Y at %H:%M UTC"),
   }
   ```
5. **Render & Save Voucher PDF:**
   - Render PDF template (via WeasyPrint, ReportLab, Puppeteer, or PDFKit).
   - Save PDF to storage bucket: `vouchers/<serial_no>-payment-voucher.pdf`.
   - Set `collection.voucher_url = "vouchers/<serial_no>-payment-voucher.pdf"`.
6. **Graceful Degradation (Non-blocking):**
   - If PDF generation fails for any reason, log the error server-side, set `voucher_url = NULL`, and continue. **Do not fail the approval transaction** (see §8 of `payment-voucher-api.md`).

---

## 5. API Response Shape Changes

### 5.1 Updated Embedded `seller` Object

Both `PATCH /api/v1/collections/:id/review` and `GET /api/v1/collections/:id` must include `mobile` in the embedded `seller` (`UserRef`) object:

```json
{
  "id": "c1f72a44-8890-4e31-a201-112233445566",
  "serial_no": "COL-SNG-2026-001",
  "status": "accepted",
  "asking_price": 10000000.0,
  "finalized_price": 9500000.0,
  "payment_method": "mobile_money",
  "mobile_money_provider": "MVola",
  "mobile_money_number": "+261 34 12 345 67",
  "bank_details": null,
  "barcode_url": "barcodes/COL-SNG-2026-001.png",
  "voucher_url": "vouchers/COL-SNG-2026-001-payment-voucher.pdf",
  "seller": {
    "id": "usr_94e3a890",
    "first_name": "Kasun",
    "last_name": "Perera",
    "email": "kasun.perera@example.com",
    "mobile": "+94771234567",
    "role": "user"
  },
  "created_by": {
    "id": "usr_94e3a890",
    "first_name": "Kasun",
    "last_name": "Perera",
    "email": "kasun.perera@example.com",
    "role": "user"
  },
  "approved_by": {
    "id": "usr_admin_001",
    "first_name": "John",
    "last_name": "Manager",
    "email": "john.manager@trove.com",
    "role": "manager"
  },
  "approved_at": "2026-10-22T08:30:00.000Z",
  "created_at": "2026-10-21T10:00:00.000Z",
  "updated_at": "2026-10-22T08:30:00.000Z"
}
```

### 5.2 SQL Join Example for Single Collection Fetch

```sql
SELECT
  c.*,
  row_to_json(seller_row.*) AS seller,
  row_to_json(creator_row.*) AS created_by,
  row_to_json(approver_row.*) AS approved_by
FROM collections c
LEFT JOIN (
  SELECT id, first_name, last_name, email, mobile, role
  FROM users
) seller_row ON seller_row.id = c.seller_id
LEFT JOIN (
  SELECT id, first_name, last_name, email, role
  FROM users
) creator_row ON creator_row.id = c.created_by_id
LEFT JOIN (
  SELECT id, first_name, last_name, email, role
  FROM users
) approver_row ON approver_row.id = c.approved_by_id
WHERE c.id = :collection_id;
```

---

## 6. Frontend TypeScript Interface Alignment

In the frontend codebase (`src/features/collection/types/gemstone.types.ts`), `UserRef` should reflect the optional `mobile` field:

```typescript
export interface UserRef {
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  mobile?: string | null;  // Seller contact mobile number
  role: Role;
}
```

---

## 7. Backend Implementation Checklist

- [ ] **Query Update:** Ensure collection queries on approval (`PATCH .../review`) and details (`GET .../:id`) select `users.mobile` when resolving `seller`.
- [ ] **Voucher Context:** Pass `seller.mobile` into the PDF generation context / template data.
- [ ] **Voucher Template:** Add `Seller Mobile` under the **Seller Information** section in the PDF template layout.
- [ ] **Fallback Logic:** Implement fallback to `"N/A"` if `seller.mobile` is null, empty string, or whitespace.
- [ ] **Distinct Fields:** Verify that `seller.mobile` (Seller profile contact number) and `mobile_money_number` (Mobile money payment destination number) are kept distinct and rendered in their respective sections.
- [ ] **API Response:** Confirm `mobile` is returned inside the embedded `seller` object in `PATCH /api/v1/collections/:id/review` and `GET /api/v1/collections/:id`.
- [ ] **Non-blocking Voucher Generation:** Confirm PDF rendering errors do not prevent collection approval or return HTTP 500.
