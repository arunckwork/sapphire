# Collections API — Backend Implementation Guide (v2)

> This document details all backend changes required to support:
> 1. Image upload with selective removal
> 2. Collection status lifecycle (`review` → `accepted`)
> 3. Finalized price + payment method fields
> 4. Barcode generation on acceptance
> 5. A new review/accept endpoint

Companion to [`collections-api.md`](./collections-api.md).

---

## 1. Data Model Changes

### Add fields to `collections` table

| Column              | Type                                          | Nullable | Default    | Notes                                              |
|---------------------|-----------------------------------------------|----------|------------|----------------------------------------------------|
| `status`            | `ENUM('review', 'accepted')`                  | No       | `'review'` | Set on creation; updated to `'accepted'` on review |
| `finalized_price`   | `DECIMAL(15, 2)`                              | Yes      | `NULL`     | Set only on acceptance                             |
| `payment_method`    | `ENUM('cash', 'mobile_money', 'bank_transfer')`| Yes     | `NULL`     | Set only on acceptance                             |
| `barcode_url`       | `VARCHAR(2048)`                               | Yes      | `NULL`     | URL of generated barcode image; set on acceptance  |

**Migration SQL (example):**

```sql
ALTER TABLE collections
  ADD COLUMN status ENUM('review', 'accepted') NOT NULL DEFAULT 'review',
  ADD COLUMN finalized_price DECIMAL(15, 2) NULL,
  ADD COLUMN payment_method ENUM('cash', 'mobile_money', 'bank_transfer') NULL,
  ADD COLUMN barcode_url VARCHAR(2048) NULL;
```

---

## 2. Updated Endpoints

### 2.1 POST `/api/v1/collections` — Create Collection

**No change to URL or method.**

- Accepts `multipart/form-data` (already specified in v1 API)
- On creation, set `status = 'review'` automatically — the frontend does not send this field

### 2.2 PUT `/api/v1/collections/:id` — Update Collection

**No change to URL or method.**

- Accepts `multipart/form-data`
- **New field**: `removed_image_urls[]` — a list of existing image URLs to delete from storage
  - For each URL in this list:
    1. Delete the file from the object storage bucket
    2. Remove the URL from the record's `image_urls` array
  - Remaining `image_urls` (not in `removed_image_urls`) are kept as-is
  - Any new `images` files in the multipart payload are uploaded and appended to `image_urls`
- `collection_type` and `serial_no` remain immutable — ignore or reject changes

**Request Body additions:**

| Field                  | Type       | Required | Notes                                                     |
|------------------------|------------|----------|-----------------------------------------------------------|
| `removed_image_urls`   | `string[]` | No       | Existing image URLs to delete. Each sent as a repeated form field. |

### 2.3 NEW: `PATCH /api/v1/collections/:id/review` — Accept Collection

```
PATCH /api/v1/collections/:id/review
Content-Type: application/json
Authorization: Bearer <token>
```

**Authorization:** `role = admin` or `role = manager` only.

#### Request Body

```json
{
  "finalized_price": 12500.00,
  "payment_method": "bank_transfer"
}
```

| Field             | Type     | Required | Notes                                                     |
|-------------------|----------|----------|-----------------------------------------------------------|
| `finalized_price` | `decimal`| Yes      | Must be > 0                                               |
| `payment_method`  | `string` | Yes      | One of `cash`, `mobile_money`, `bank_transfer`            |

#### Server-side Actions (in order)

1. Validate `finalized_price > 0` and `payment_method` is a valid enum value
2. Check that `collection.status === 'review'` — reject with `409 Conflict` if already accepted
3. Update `status = 'accepted'`, `finalized_price`, `payment_method`, `updated_at`
4. **Generate barcode:**
   - Generate a barcode encoding the collection's `serial_no` (Code 128 or EAN-13 recommended)
   - Save as PNG to the object storage bucket under `barcodes/<serial_no>.png`
   - Set `barcode_url` to the public/signed URL of the stored barcode
5. Return the full updated `CollectionRecord` with `200 OK`

#### Response `200 OK`

Returns the full updated `CollectionRecord` (same shape as GET single).

#### Error Responses

| Status | Condition                                            |
|--------|------------------------------------------------------|
| `400`  | `finalized_price` <= 0 or invalid `payment_method`   |
| `401`  | Unauthenticated                                       |
| `403`  | Caller role is not `admin` or `manager`               |
| `404`  | Collection not found                                  |
| `409`  | Collection already accepted                           |

---

## 3. Updated Response Shape

All `GET /api/v1/collections` and `GET /api/v1/collections/:id` responses must include the new fields:

```json
{
  "id": "...",
  "serial_no": "COL-SNG-2026-001",
  "collection_type": "single_stone",
  "seller_id": "...",
  "seller": { "id": "...", "first_name": "...", "last_name": null, "email": "..." },
  "status": "review",
  "certification_no": "",
  "certification_lab": "",
  "asking_price": 5000.00,
  "image_urls": ["https://cdn.example.com/images/abc.jpg"],
  "finalized_price": null,
  "payment_method": null,
  "barcode_url": null,
  "created_at": "2026-08-01T10:00:00Z",
  "updated_at": "2026-08-01T10:00:00Z",
  "gemstone_type": "sapphire",
  "..."
}
```

---

## 4. Image Storage Pattern

### Upload Flow (on POST/PUT)

1. Receive `images` files from `multipart/form-data`
2. Validate file types: accept `image/jpeg`, `image/png`, `image/webp`; reject others with `400`
3. Validate file sizes: max 10 MB per file
4. Store files in object storage under `collections/<collection_id>/<uuid>.<ext>`
5. Generate public or signed read URLs
6. Append new URLs to the record's `image_urls` array

### Removal Flow (on PUT)

1. Receive `removed_image_urls[]` form fields
2. For each URL:
   - Validate it belongs to this collection's `image_urls` (ignore unknown URLs silently)
   - Delete the object from storage
   - Remove the URL from the record's `image_urls` array
3. Proceed with adding any new `images` files

---

## 5. Barcode Generation (Recommended Libraries)

| Language | Library                   | Notes                                               |
|----------|---------------------------|-----------------------------------------------------|
| Go       | `github.com/boombuler/barcode` | Code 128 / QR support; output as PNG          |
| Node.js  | `bwip-js`                 | Server-side barcode rendering; many formats         |
| Python   | `python-barcode`          | Code 128; outputs EPS or PNG via `Pillow`           |

**Recommended format:** Code 128 encoding the `serial_no` string. Output: PNG, minimum 300 px wide.

---

## 6. Frontend BFF Route Mapping (Updated)

| Frontend BFF Route                           | Proxied Backend Route                          | Method  |
|----------------------------------------------|------------------------------------------------|---------|
| `GET /api/collections`                       | `GET /api/v1/collections`                      | GET     |
| `POST /api/collections`                      | `POST /api/v1/collections`                     | POST    |
| `GET /api/collections/:id`                   | `GET /api/v1/collections/:id`                  | GET     |
| `PUT /api/collections/:id`                   | `PUT /api/v1/collections/:id`                  | PUT     |
| `DELETE /api/collections/:id`                | `DELETE /api/v1/collections/:id`               | DELETE  |
| **`PATCH /api/collections/:id/review`** (NEW)| **`PATCH /api/v1/collections/:id/review`**     | PATCH   |
| `GET /api/users/sellers`                     | `GET /api/v1/users?role=user`                  | GET     |

---

*Related: [`collections-api.md`](./collections-api.md)*
