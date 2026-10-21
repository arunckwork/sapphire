# Collections API — Bank Transfer Details on Acceptance (v11)

> This document details the backend changes required to persist **Bank Details**
> when a collection is accepted with `payment_method = bank_transfer`.
>
> Companion to [`collections-api.md`](./collections-api.md),
> [`collections-api-v2.md`](./collections-api-v2.md),
> [`collections-api-v3.md`](./collections-api-v3.md),
> [`collections-api-v4.md`](./collections-api-v4.md),
> [`collections-api-v5.md`](./collections-api-v5.md),
> [`collections-api-v6.md`](./collections-api-v6.md),
> [`collections-api-v7.md`](./collections-api-v7.md),
> [`collections-api-v8.md`](./collections-api-v8.md),
> [`collections-api-v9.md`](./collections-api-v9.md),
> [`collections-api-v10.md`](./collections-api-v10.md), and
> [`collections-api-v12.md`](./collections-api-v12.md).

---

## 1. Motivation

When an admin or manager accepts a collection with the **Bank Transfer** payment method (`payment_method = 'bank_transfer'`), the specific bank transfer instructions / details (such as Bank Name, Account Number, Account Holder Name, or IBAN/SWIFT) must be recorded.

This field is **mandatory** when `payment_method = 'bank_transfer'`. It is ignored and stored as `NULL` when `payment_method` is `cash` or `mobile_money`.

---

## 2. Data Model Changes

### 2.1 New Column on `collections` Table

```sql
ALTER TABLE collections
  ADD COLUMN bank_details VARCHAR(500) NULL;
```

| Column         | Type           | Nullable | Default | Notes                                                                                    |
|----------------|----------------|----------|---------|------------------------------------------------------------------------------------------|
| `bank_details` | `VARCHAR(500)` | Yes      | `NULL`  | Bank transfer details (e.g. Bank name, account number, account holder name, IBAN/SWIFT) |

> Existing records will retain `bank_details = NULL`. No backfill is required.

---

## 3. Updated Endpoint — Accept / Review Collection

```
PATCH /api/v1/collections/:id/review
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Authorization:** `role = admin` or `role = manager` only.

### 3.1 Request Payload (`multipart/form-data`)

| Field                   | Type      | Required when `bank_transfer`? | Notes                                                                                    |
|-------------------------|-----------|--------------------------------|------------------------------------------------------------------------------------------|
| `finalized_price`       | `decimal` | Yes                            | Must be > 0                                                                              |
| `payment_method`        | `string`  | Yes                            | One of `cash`, `mobile_money`, `bank_transfer`                                           |
| `bank_details`          | `string`  | **Yes**                        | Bank details (Bank name, account number, beneficiary); required when `bank_transfer`     |
| `mobile_money_number`   | `string`  | No                             | Payee phone number; ignored when `bank_transfer`                                         |
| `mobile_money_provider` | `string`  | No                             | Provider name; ignored when `bank_transfer`                                              |
| `receipt`               | `File`    | No                             | Ignored when `bank_transfer`                                                             |

### 3.2 Validation Rules

1. If `payment_method === 'bank_transfer'`:
   - `bank_details` must be a non-empty string (trimmed length >= 1, max length 500).
   - If missing or empty, reject with `422 Unprocessable Entity`:
     ```json
     {
       "message": "Bank details are required when payment method is bank_transfer",
       "errors": {
         "bank_details": ["Bank details are required"]
       }
     }
     ```
   - Ignore / clear any `mobile_money_number`, `mobile_money_provider`, or `receipt` file sent in the payload.
2. If `payment_method !== 'bank_transfer'`:
   - Store `bank_details` as `NULL`.

### 3.3 Server-side Execution Flow

1. Verify authentication (`admin` or `manager` role).
2. Fetch collection record by `id`; ensure `status === 'review'` (reject with `409 Conflict` if already accepted).
3. Validate `finalized_price > 0` and `payment_method`.
4. If `payment_method === 'bank_transfer'`:
   - Validate `bank_details` is non-empty.
   - Set `bank_details = :bank_details`.
   - Ensure `mobile_money_number`, `mobile_money_provider`, and `receipt_url` are `NULL`.
5. Update collection record:
   ```sql
   UPDATE collections
   SET
     status = 'accepted',
     finalized_price = :finalized_price,
     payment_method = :payment_method,
     bank_details = :bank_details,
     approved_by = :current_user_id,
     approved_at = NOW(),
     updated_at = NOW()
   WHERE id = :id;
   ```
6. Generate barcode image (`barcode_url`) and payment voucher PDF (`voucher_url`).
7. Return `200 OK` with the updated `CollectionRecord`.

---

## 4. Response Shape

### 4.1 Example Response — Accepted with Bank Transfer

```json
{
  "id": "c1f72a44-8890-4e31-a201-112233445566",
  "serial_no": "COL-SNG-2026-001",
  "collection_type": "single_stone",
  "status": "accepted",
  "asking_price": 10000000.0,
  "finalized_price": 9500000.0,
  "payment_method": "bank_transfer",
  "bank_details": "Bank of Africa - Madagascar, Acc: 01000 123456789 01, Beneficiary: Jean Dupont",
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
  "approved_at": "2026-10-21T18:15:00.000Z",
  "created_at": "2026-10-20T10:00:00.000Z",
  "updated_at": "2026-10-21T18:15:00.000Z"
}
```

---

## 5. Summary of Frontend and Backend Contract

| Layer | Responsibility |
|---|---|
| **Frontend Form** | When `payment_method === 'bank_transfer'`, displays mandatory text input for `bank_details`. Resets `bank_details` when switching to other payment methods. |
| **API Client** | Appends `bank_details` to the `FormData` multipart payload on `PATCH /api/v1/collections/:id/review`. |
| **DB Schema** | Add column `bank_details VARCHAR(500) NULL` to `collections` table. |
| **Read Responses** | Return `bank_details` (nullable) in GET detail and list endpoints. |
| **Read View** | Display `Bank Details` under Finalization Details on the collection details page when `payment_method === 'bank_transfer'`. |
