# Collections API — Mobile Money Fields on Acceptance (v6)

> This document details the backend changes required to persist an optional
> **mobile number** and **payment receipt** when a collection is accepted with
> `payment_method = mobile_money`.
>
> Companion to [`collections-api.md`](./collections-api.md),
> [`collections-api-v2.md`](./collections-api-v2.md),
> [`collections-api-v3.md`](./collections-api-v3.md),
> [`collections-api-v4.md`](./collections-api-v4.md), and
> [`collections-api-v5.md`](./collections-api-v5.md).

---

## 1. Motivation

When an admin or manager accepts a collection and selects **Mobile Money** as the payment
method, it is useful to optionally record:

- The **mobile number** used for the transfer.
- A scanned or photographed **payment receipt** (image or PDF).

Both fields are non-mandatory. They are silently ignored when `payment_method` is not
`mobile_money`. If provided, they must be stored in the database / file storage and
returned in GET responses so the details page can display them.

---

## 2. Data Model Changes

### 2.1 New Columns on `collections`

```sql
ALTER TABLE collections
  ADD COLUMN mobile_money_number VARCHAR(50)    NULL,
  ADD COLUMN receipt_url         VARCHAR(2048)  NULL;
```

| Column                | Type             | Nullable | Default | Notes                                                  |
|-----------------------|------------------|----------|---------|--------------------------------------------------------|
| `mobile_money_number` | `VARCHAR(50)`    | Yes      | `NULL`  | Phone number used for the mobile money transfer        |
| `receipt_url`         | `VARCHAR(2048)`  | Yes      | `NULL`  | URL of the uploaded receipt file (image or PDF)        |

> Both columns should remain `NULL` for all existing records and for acceptances that
> do not use `mobile_money` as the payment method. No backfill is required.

---

## 3. Updated Endpoint — Accept Collection

### 3.1 Breaking Change: JSON → `multipart/form-data`

```
PATCH /api/v1/collections/:id/review
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

> **⚠️ Breaking change from v2.** Previously, this endpoint accepted
> `application/json`. It must now accept `multipart/form-data` to support
> the optional receipt file upload. All other behaviour is identical.

**Authorization:** `role = admin` or `role = manager` only.

### 3.2 Request Body

| Field                 | Type      | Required | Notes                                                              |
|-----------------------|-----------|----------|--------------------------------------------------------------------|
| `finalized_price`     | `decimal` | Yes      | Must be > 0                                                        |
| `payment_method`      | `string`  | Yes      | One of `cash`, `mobile_money`, `bank_transfer`                     |
| `mobile_money_number` | `string`  | No       | Phone number; accepted only when `payment_method = mobile_money`; ignored otherwise |
| `receipt`             | `File`    | No       | Receipt image (JPEG, PNG, WEBP) or PDF; accepted only when `payment_method = mobile_money`; ignored otherwise |

> **Null/empty handling:**
> - If `mobile_money_number` is an empty string, store as `NULL`.
> - If `receipt` is not present in the multipart payload, leave `receipt_url` as `NULL`.
> - If `payment_method` is not `mobile_money`, discard both fields even if sent.

### 3.3 Server-side Actions (updated, extends v2 §2.3)

1. Parse the `multipart/form-data` body.
2. Validate `finalized_price > 0` and `payment_method` is a valid enum value.
3. Check that `collection.status === 'review'` — reject with `409 Conflict` if already accepted.
4. If `payment_method == 'mobile_money'`:
   a. If `mobile_money_number` is provided and non-empty, store it.
   b. If `receipt` file is provided:
      - Validate file type: accept `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
      - Validate file size: max **10 MB**.
      - Store in object storage under `receipts/<collection_id>/<uuid>.<ext>`.
      - Generate a public/signed read URL; store as `receipt_url`.
5. Update `status = 'accepted'`, `finalized_price`, `payment_method`, `mobile_money_number`,
   `receipt_url`, `updated_at`.
6. Generate barcode (Code 128, `serial_no`), store under `barcodes/<serial_no>.png`,
   set `barcode_url` (unchanged from v2).
7. Generate payment voucher PDF (unchanged from v2), set `voucher_url`.
8. Set `approved_by` and `approved_at`.
9. Return the full updated `CollectionRecord` with `200 OK`.

### 3.4 Error Responses

| Status | Condition                                                        |
|--------|------------------------------------------------------------------|
| `400`  | `finalized_price` ≤ 0 or invalid `payment_method`               |
| `400`  | `receipt` file type is not accepted                              |
| `400`  | `receipt` file exceeds 10 MB                                     |
| `401`  | Unauthenticated                                                  |
| `403`  | Caller role is not `admin` or `manager`                          |
| `404`  | Collection not found                                             |
| `409`  | Collection already accepted                                      |

---

## 4. Updated Response Shape

All `GET /api/v1/collections` and `GET /api/v1/collections/:id` responses must include
the two new fields:

```json
{
  "id": "...",
  "serial_no": "COL-SNG-2026-001",
  "collection_type": "single_stone",
  "seller_id": "...",
  "seller": { "id": "...", "first_name": "...", "last_name": null, "email": "..." },
  "status": "accepted",
  "asking_price": 5000.00,
  "finalized_price": 4800.00,
  "payment_method": "mobile_money",
  "mobile_money_number": "+94 71 234 5678",
  "receipt_url": "https://cdn.example.com/receipts/abc123/receipt.jpg",
  "barcode_url": "https://cdn.example.com/barcodes/COL-SNG-2026-001.png",
  "voucher_url": "https://cdn.example.com/vouchers/COL-SNG-2026-001.pdf",
  "approved_by": { "id": "...", "first_name": "Admin", "last_name": null, "email": "..." },
  "approved_at": "2026-09-08T17:00:00Z",
  "created_at": "2026-08-01T10:00:00Z",
  "updated_at": "2026-09-08T17:00:00Z",
  "..."
}
```

Fields when not applicable:

```json
{
  "payment_method": "cash",
  "mobile_money_number": null,
  "receipt_url": null
}
```

> Existing records accepted before v6 will have `null` for both new fields. The backend
> must return them as `null` (not omit them entirely) so the frontend can reliably
> check their presence.

---

## 5. File Storage Pattern

### Receipt Upload (on PATCH review)

1. Receive `receipt` file from `multipart/form-data`.
2. Validate content type: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
3. Validate file size ≤ 10 MB.
4. Store under `receipts/<collection_id>/<uuid>.<ext>`.
5. Generate a public or signed URL → store as `receipt_url`.

> No removal flow is needed — receipts are write-once at acceptance time.

---

## 6. BFF Route Impact

### 6.1 `PATCH /api/collections/:id/review` (Next.js BFF route)

The BFF route at `src/app/api/collections/[id]/review/route.ts` currently reads the
request body as JSON and forwards it. It must be updated to:

1. Read the body as `FormData` (`await request.formData()`).
2. Forward the `FormData` directly to the backend (drop `Content-Type: application/json`;
   let `fetch` set the multipart boundary automatically).

```ts
// NEW BFF implementation (simplified)
const formData = await request.formData();
const res = await fetch(`${BACKEND_URL}/api/v1/collections/${id}/review`, {
  method: 'PATCH',
  headers: { Authorization: `Bearer ${token}` },  // No Content-Type
  body: formData,
});
```

### 6.2 BFF Route Mapping (unchanged)

| Frontend BFF Route                    | Proxied Backend Route                      | Method |
|---------------------------------------|--------------------------------------------|--------|
| `GET /api/collections`                | `GET /api/v1/collections`                  | GET    |
| `POST /api/collections`               | `POST /api/v1/collections`                 | POST   |
| `GET /api/collections/:id`            | `GET /api/v1/collections/:id`              | GET    |
| `PUT /api/collections/:id`            | `PUT /api/v1/collections/:id`              | PUT    |
| `DELETE /api/collections/:id`         | `DELETE /api/v1/collections/:id`           | DELETE |
| `PATCH /api/collections/:id/review`   | `PATCH /api/v1/collections/:id/review`     | PATCH  |

No new routes are introduced by this feature.

---

## 7. Backward Compatibility

- Existing accepted records will have `mobile_money_number = null` and `receipt_url = null`.
  These must be returned in all GET responses (not omitted).
- Existing integrations that call `PATCH /review` with `application/json` will break.
  The backend **must** stop accepting JSON on this endpoint once it switches to
  `multipart/form-data`. Coordinate a simultaneous frontend + backend deploy.
- Cash and Bank Transfer acceptances are not affected: if `payment_method != mobile_money`,
  both fields are stored as `NULL` regardless of what the client sends.

---

## 8. Summary of Changes

| Area                     | Change                                                                                              |
|--------------------------|-----------------------------------------------------------------------------------------------------|
| DB schema                | Add `mobile_money_number VARCHAR(50) NULL` and `receipt_url VARCHAR(2048) NULL` to `collections`    |
| `PATCH /review` content-type | Changed from `application/json` → `multipart/form-data` (**breaking**)                        |
| `PATCH /review` new fields | `mobile_money_number` (string, optional) and `receipt` (file, optional)                           |
| Receipt storage          | Stored under `receipts/<collection_id>/<uuid>.<ext>`, URL saved as `receipt_url`                   |
| GET list + GET by ID     | Include `mobile_money_number` and `receipt_url` (both nullable) in all collection responses         |
| BFF review route         | Switch from `request.json()` → `request.formData()` + `FormData` pass-through                     |

---

*Related: [`collections-api.md`](./collections-api.md) · [`collections-api-v2.md`](./collections-api-v2.md) · [`collections-api-v3.md`](./collections-api-v3.md) · [`collections-api-v4.md`](./collections-api-v4.md) · [`collections-api-v5.md`](./collections-api-v5.md)*
