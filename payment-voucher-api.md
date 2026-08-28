# Payment Voucher, Audit Trail & Approval — Backend API Changes

This document describes all backend changes required to support:
1. **Payment voucher PDF** generated on collection acceptance
2. **`created_by`** — the user who created the collection record
3. **`approved_by`** + **`approved_at`** — the admin/manager who accepted it and when

---

## 1. Database

### 1a. New columns on `collections` table

```sql
ALTER TABLE collections
  ADD COLUMN voucher_url       TEXT          NULL DEFAULT NULL,
  ADD COLUMN created_by_id     UUID          NULL REFERENCES users(id),
  ADD COLUMN approved_by_id    UUID          NULL REFERENCES users(id),
  ADD COLUMN approved_at       TIMESTAMPTZ   NULL DEFAULT NULL;
```

> **Storage pattern for URLs:** Store relative paths (e.g. `vouchers/abc123.pdf`),
> not full URLs — the frontend prepends `NEXT_PUBLIC_MEDIA_BASE_URL` via `getMediaUrl()`.

### 1b. Populate `created_by_id` on existing rows (migration)

```sql
-- If the creator is always the seller, map seller_id as a starting point.
-- Only run this if your users and sellers share the same table.
UPDATE collections SET created_by_id = seller_id WHERE created_by_id IS NULL;
```

---

## 2. `PATCH /api/collections/:id/review` — Accept Collection

### Current behaviour
- Sets `status = 'accepted'`
- Sets `finalized_price` + `payment_method`
- Generates a barcode image → stores path in `barcode_url`

### New behaviour (additions only — no breaking changes)

In addition to the above, the backend must:

1. **Record the approver:**
   ```
   approved_by_id = <authenticated user's ID>
   approved_at    = NOW()
   ```

2. **Generate a payment voucher PDF:**
   - Generate a PDF using the collection data (see §3 for layout spec)
   - Save the PDF to storage at e.g. `vouchers/<collection-id>-<serial_no>.pdf`
   - Store the relative path in `voucher_url`

3. **Return the full updated `CollectionRecord`** including:
   - `voucher_url`
   - `approved_by` (embedded user object — see §4)
   - `approved_at`

### Request (unchanged)
```http
PATCH /api/collections/:id/review
Content-Type: application/json
Authorization: Bearer <token>

{
  "finalized_price": 4500.00,
  "payment_method": "bank_transfer"
}
```

### Response (updated)
```json
{
  "id": "...",
  "serial_no": "SAP-0042",
  "status": "accepted",
  "finalized_price": 4500.00,
  "payment_method": "bank_transfer",
  "barcode_url": "barcodes/SAP-0042.png",
  "voucher_url": "vouchers/SAP-0042-payment-voucher.pdf",
  "created_by": {
    "id": "...",
    "first_name": "Alice",
    "last_name": "Doe",
    "email": "alice@example.com",
    "role": "seller"
  },
  "approved_by": {
    "id": "...",
    "first_name": "John",
    "last_name": "Manager",
    "email": "john@company.com",
    "role": "manager"
  },
  "approved_at": "2026-08-28T00:49:00Z",
  "...": "all other existing fields"
}
```

---

## 3. Payment Voucher PDF — Content Specification

The voucher must be a **A4 portrait PDF** containing the following sections:

### Header
| Element | Content |
|---|---|
| Company logo | Top-left (if available) |
| Document title | `PAYMENT VOUCHER` — large, bold |
| Voucher number | `VCH-<serial_no>` (e.g. `VCH-SAP-0042`) |
| Issue date | Date of acceptance (from `approved_at`) |

### Collection Summary
| Label | Value |
|---|---|
| Collection Serial No. | `serial_no` |
| Collection Type | Human-readable type label |
| Certification No. | `certification_no` (or "N/A") |
| Certification Lab | `certification_lab` (or "N/A") |

### Seller Information
| Label | Value |
|---|---|
| Seller Name | `seller.first_name + seller.last_name` |
| Seller Email | `seller.email` |

### Financial Summary
| Label | Value |
|---|---|
| Original Asking Price | `$asking_price` formatted to 2dp |
| **Finalized Price** | `$finalized_price` formatted to 2dp — **bold** |
| Payment Method | Human-readable label (Cash / Mobile Money / Bank Transfer) |

### Approval Section
| Label | Value |
|---|---|
| Approved By | `approved_by.first_name + approved_by.last_name` |
| Approved On | Date + time formatted as `28 Aug 2026 at 00:49` |

### Footer
- Page number
- "This is a system-generated voucher. No signature required."

---

## 4. `GET /api/collections/:id` — Get Single Collection

### Updated response shape

The response must include the new fields whenever they exist:

```json
{
  "voucher_url": "vouchers/SAP-0042-payment-voucher.pdf",
  "created_by": {
    "id": "...",
    "first_name": "...",
    "last_name": "...",
    "email": "...",
    "role": "..."
  },
  "approved_by": {
    "id": "...",
    "first_name": "...",
    "last_name": "...",
    "email": "...",
    "role": "..."
  },
  "approved_at": "2026-08-28T00:49:00Z"
}
```

Use `null` for any field that has no value yet (e.g. `approved_by: null` on a `review`-status collection).

### SQL join (example)
```sql
SELECT
  c.*,
  row_to_json(cb.*) AS created_by,
  row_to_json(ab.*) AS approved_by
FROM collections c
LEFT JOIN users cb ON cb.id = c.created_by_id
LEFT JOIN users ab ON ab.id = c.approved_by_id
WHERE c.id = $1;
```

---

## 5. `GET /api/collections` — List Collections

The list endpoint **does not need to embed `created_by` / `approved_by` objects** (it's not consumed by the frontend list view). However, if you embed them for completeness, use the same shape as above.

`voucher_url` may also be omitted from the list response.

---

## 6. `POST /api/collections` — Create Collection

When a collection is created, record the authenticated user as the creator:

```
created_by_id = <authenticated user's ID>
```

No other changes to the create endpoint.

---

## 7. `DELETE /api/collections/:id` — Delete Collection

When a collection is deleted, also delete the associated voucher PDF from storage (in addition to images and certificate), if present.

---

## 8. Error Handling — Voucher Generation Failure

The voucher PDF is a **non-blocking** operation: if PDF generation fails, the acceptance itself must **still succeed** and return the record. In that case:
- `voucher_url` is `null`
- Log the generation error server-side
- Do **not** return a 500 to the client

This ensures the approval workflow is never blocked by a PDF rendering issue.

---

## 9. File Storage Convention

| Asset | Directory | Naming |
|---|---|---|
| Images | `images/` | UUID-based |
| Barcode | `barcodes/` | `<serial_no>.png` |
| Certificate | `certificates/` | UUID-based |
| **Voucher** | `vouchers/` | `<serial_no>-payment-voucher.pdf` |

---

## 10. Summary Checklist

- [ ] Add `voucher_url`, `created_by_id`, `approved_by_id`, `approved_at` columns to `collections` (+ migration)
- [ ] Populate `created_by_id` on existing rows (migration)
- [ ] On `POST /api/collections` → set `created_by_id = authenticated_user.id`
- [ ] On `PATCH /api/collections/:id/review` → set `approved_by_id`, `approved_at`, generate + save voucher PDF, set `voucher_url`
- [ ] `GET /api/collections/:id` → JOIN `users` for `created_by` + `approved_by`, return all new fields
- [ ] `DELETE /api/collections/:id` → delete voucher PDF from storage
- [ ] Handle voucher generation errors gracefully (non-blocking — acceptance still succeeds)
- [ ] Voucher PDF contains all required sections (see §3)
