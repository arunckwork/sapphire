# Collections API — Mobile Money Provider on Acceptance (v10)

> This document details the backend changes required to persist the **Mobile Money Provider**
> alongside the **Mobile Number** and **Payment Receipt** when a collection is accepted with
> `payment_method = mobile_money`.
>
> Companion to [`collections-api.md`](./collections-api.md),
> [`collections-api-v2.md`](./collections-api-v2.md),
> [`collections-api-v3.md`](./collections-api-v3.md),
> [`collections-api-v4.md`](./collections-api-v4.md),
> [`collections-api-v5.md`](./collections-api-v5.md),
> [`collections-api-v6.md`](./collections-api-v6.md),
> [`collections-api-v7.md`](./collections-api-v7.md),
> [`collections-api-v9.md`](./collections-api-v9.md), and
> [`collections-api-v11.md`](./collections-api-v11.md).

---

## 1. Motivation

When an admin or manager accepts a collection with **Mobile Money** (`payment_method = mobile_money`),
the system must record:

1. **`mobile_money_provider`**: The service provider used for the transaction (e.g., MVola, Orange Money, Airtel Money, or a custom manual provider name).
2. **`mobile_money_number`**: The mobile phone number of the payee/transfer.
3. **`receipt`**: Uploaded receipt file (image/PDF proof of transfer).

All three fields are **mandatory** when `payment_method = 'mobile_money'`. They are ignored/stored as `NULL` when `payment_method` is `cash` or `bank_transfer`.

---

## 2. Data Model Changes

### 2.1 New Column on `collections` Table

```sql
ALTER TABLE collections
  ADD COLUMN mobile_money_provider VARCHAR(100) NULL;
```

| Column                  | Type            | Nullable | Default | Notes                                                               |
|-------------------------|-----------------|----------|---------|---------------------------------------------------------------------|
| `mobile_money_provider` | `VARCHAR(100)`  | Yes      | `NULL`  | Mobile money provider name (e.g. `MVola`, `Orange Money`, `Airtel Money`, or custom text) |

> Existing records will retain `mobile_money_provider = NULL`. No backfill is required.

---

## 3. Updated Endpoint — Accept / Review Collection

```
PATCH /api/v1/collections/:id/review
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Authorization:** `role = admin` or `role = manager` only.

### 3.1 Request Payload (`multipart/form-data`)

| Field                   | Type      | Required when `mobile_money`? | Notes                                                                                    |
|-------------------------|-----------|-------------------------------|------------------------------------------------------------------------------------------|
| `finalized_price`       | `decimal` | Yes                           | Must be > 0                                                                              |
| `payment_method`        | `string`  | Yes                           | One of `cash`, `mobile_money`, `bank_transfer`                                           |
| `mobile_money_number`   | `string`  | **Yes**                       | Payee phone number; required when `payment_method = mobile_money`                        |
| `mobile_money_provider` | `string`  | **Yes**                       | Provider name; required when `payment_method = mobile_money`                              |
| `receipt`               | `File`    | **Yes**                       | Payment receipt (JPEG, PNG, WEBP, or PDF up to 10 MB); required when `mobile_money`       |

> **Non-mobile-money transactions:**
> When `payment_method` is `cash` or `bank_transfer`, `mobile_money_number`, `mobile_money_provider`, and `receipt` are ignored and stored as `NULL`.

### 3.2 Validation Rules

1. If `payment_method === 'mobile_money'`:
   - `mobile_money_number` must be non-empty string (trimmed length >= 1). Reject with `422 Unprocessable Entity` if missing.
   - `mobile_money_provider` must be non-empty string (trimmed length >= 1, max length 100). Reject with `422 Unprocessable Entity` if missing.
   - `receipt` must be an uploaded file (`image/*` or `application/pdf`, max 10MB). Reject with `422 Unprocessable Entity` if missing.
2. If `payment_method !== 'mobile_money'`:
   - Discard `mobile_money_number`, `mobile_money_provider`, and any uploaded receipt.

### 3.3 Server-side Execution Flow

1. Authenticate user; ensure role is `admin` or `manager`.
2. Fetch collection by `id`; ensure `status === 'review'`.
3. Validate `finalized_price > 0` and `payment_method`.
4. Validate mobile money fields if `payment_method === 'mobile_money'`.
5. If receipt file is uploaded:
   - Store in bucket storage: `receipts/<collection_id>/<uuid>.<ext>`.
   - Set `receipt_url = <public_or_signed_url>`.
6. Update collection record:
   ```sql
   UPDATE collections
   SET
     status = 'accepted',
     finalized_price = :finalized_price,
     payment_method = :payment_method,
     mobile_money_number = :mobile_money_number,
     mobile_money_provider = :mobile_money_provider,
     receipt_url = :receipt_url,
     approved_by = :current_user_id,
     approved_at = NOW(),
     updated_at = NOW()
   WHERE id = :id;
   ```
7. Generate Barcode image (`barcode_url`) and Payment Voucher PDF (`voucher_url`).
8. Return `200 OK` with the updated `CollectionRecord`.

---

## 4. Response Shape

### 4.1 Example Response — Accepted with Mobile Money

```json
{
  "id": "c1f72a44-8890-4e31-a201-112233445566",
  "serial_no": "COL-SNG-2026-001",
  "collection_type": "single_stone",
  "status": "accepted",
  "asking_price": 5000000.0,
  "finalized_price": 4800000.0,
  "payment_method": "mobile_money",
  "mobile_money_provider": "MVola",
  "mobile_money_number": "+261 34 12 345 67",
  "receipt_url": "https://storage.trove.com/receipts/c1f72a44/receipt-xyz.jpg",
  "barcode_url": "https://storage.trove.com/barcodes/COL-SNG-2026-001.png",
  "voucher_url": "https://storage.trove.com/vouchers/COL-SNG-2026-001.pdf",
  "approved_by": {
    "id": "u-admin-1",
    "first_name": "Admin",
    "last_name": "User",
    "email": "admin@sapphire.io",
    "role": "admin"
  },
  "approved_at": "2026-10-21T18:05:00.000Z",
  "created_at": "2026-10-20T10:00:00.000Z",
  "updated_at": "2026-10-21T18:05:00.000Z"
}
```

### 4.2 Example Response — Accepted with Other Payment Method (e.g. Cash)

```json
{
  "id": "c1f72a44-8890-4e31-a201-112233445566",
  "serial_no": "COL-SNG-2026-001",
  "collection_type": "single_stone",
  "status": "accepted",
  "asking_price": 5000000.0,
  "finalized_price": 4800000.0,
  "payment_method": "cash",
  "mobile_money_provider": null,
  "mobile_money_number": null,
  "receipt_url": null,
  "barcode_url": "https://storage.trove.com/barcodes/COL-SNG-2026-001.png",
  "voucher_url": "https://storage.trove.com/vouchers/COL-SNG-2026-001.pdf",
  "approved_by": {
    "id": "u-admin-1",
    "first_name": "Admin",
    "last_name": "User",
    "email": "admin@sapphire.io",
    "role": "admin"
  },
  "approved_at": "2026-10-21T18:05:00.000Z",
  "created_at": "2026-10-20T10:00:00.000Z",
  "updated_at": "2026-10-21T18:05:00.000Z"
}
```

---

## 5. Summary of Frontend and Backend Contract

| Layer | Responsibility |
|---|---|
| **Constants** | `MOBILE_MONEY_PROVIDER_OPTIONS` defines popular Madagascar providers (`MVola`, `Orange Money`, `Airtel Money`, plus `Other`). |
| **Frontend Form** | Renders provider `<select>` beside mobile number. If `Other` is chosen, provides custom text input. Validates provider, mobile number, and receipt before submission. |
| **API Client** | Serializes `mobile_money_provider`, `mobile_money_number`, and `receipt` into `multipart/form-data` payload on `PATCH /api/v1/collections/:id/review`. |
| **DB Schema** | Add column `mobile_money_provider VARCHAR(100) NULL` to `collections` table. |
| **Read Responses** | Return `mobile_money_provider` alongside `mobile_money_number` and `receipt_url` in collection details and listings. |
