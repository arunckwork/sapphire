# Collections API — Weight in Carat Field (v7)

> This document details the backend changes required to persist an optional
> **weight in carat** field for all collection types that carry a weight measurement.
>
> Companion to [`collections-api.md`](./collections-api.md),
> [`collections-api-v2.md`](./collections-api-v2.md),
> [`collections-api-v3.md`](./collections-api-v3.md),
> [`collections-api-v4.md`](./collections-api-v4.md),
> [`collections-api-v5.md`](./collections-api-v5.md), and
> [`collections-api-v6.md`](./collections-api-v6.md).

---

## 1. Motivation

All gemstone and jewellery collections record a `weight` in an operator-chosen unit
(`weight_unit`: `g`, `kg`, etc.). The international gem trade universally prices stones
by **carat** (1 ct = 0.2 g). Recording the carat weight at entry time:

- Allows price-per-carat calculations without runtime unit conversion.
- Provides an independent cross-check when `weight_unit` is not carat.
- Enables future sorting and filtering by carat weight server-side.

The field is **optional** — operators who weigh in carats directly may leave it blank.

### Affected collection types

| Collection type      | Has `weight` / `weight_unit`? | Gets `weight_in_carat`? |
|----------------------|-------------------------------|--------------------------|
| `single_stone`       | Yes                           | Yes                      |
| `bulk_stones`        | Yes (per-row `stones[]`)      | Yes (per-row)            |
| `jewellery`          | Yes                           | Yes                      |
| `industrial_stones`  | Yes                           | No (industrial use — carat weight not applicable) |

---

## 2. Data Model Changes

### 2.1 New Column on `collections` (top-level types)

For `single_stone`, `jewellery`, and `industrial_stones`, `weight_in_carat` is a
top-level column on the `collections` table (or the type-specific detail table):

```sql
ALTER TABLE collections
  ADD COLUMN weight_in_carat DECIMAL(12, 4) NULL;
```

| Column            | Type             | Nullable | Default | Notes                                                        |
|-------------------|------------------|----------|---------|--------------------------------------------------------------|
| `weight_in_carat` | `DECIMAL(12, 4)` | Yes      | `NULL`  | Weight expressed in carat (1 ct = 0.2 g). Operator-entered. |

> No backfill is required. Existing records will have `NULL` for this field.

### 2.2 New Field on `bulk_stone_rows` (per-row, `bulk_stones` type)

`bulk_stones` collections store weight per stone row. The carat equivalent must
live on each row in the `stones` JSON array (or the normalised `bulk_stone_rows` table):

```sql
-- If rows are stored in a separate table:
ALTER TABLE bulk_stone_rows
  ADD COLUMN weight_in_carat DECIMAL(12, 4) NULL;

-- If rows are stored as a JSON column, no schema change is needed;
-- the JSON structure is extended to include "weight_in_carat" per element.
```

The `BulkStoneRow` JSON element shape becomes:

```json
{
  "gemstone_type": "Ruby",
  "variety": "Pigeon Blood",
  "quantity": 5,
  "weight": 2.50,
  "weight_unit": "g",
  "weight_in_carat": 12.50
}
```

---

## 3. API Changes — Create and Update

### 3.1 `POST /api/v1/collections`

**Content-Type:** `multipart/form-data` (unchanged)

**New optional fields:**

| Field             | Applies to types                                 | Type      | Notes                                              |
|-------------------|--------------------------------------------------|-----------|----------------------------------------------------|
| `weight_in_carat` | `single_stone`, `jewellery`, `industrial_stones` | `decimal` | Optional. Omit or send empty string to store NULL. |
| `stones`          | `bulk_stones`                                    | `string`  | JSON array; each row may now include `weight_in_carat` (decimal, optional). |

**Example — single_stone with carat weight:**

```
POST /api/v1/collections
Content-Type: multipart/form-data

collection_type   = single_stone
seller_id         = abc-123
weight            = 1.00
weight_unit       = g
weight_in_carat   = 5.00
...
```

**Example — bulk_stones with per-row carat weight:**

```
POST /api/v1/collections
Content-Type: multipart/form-data

collection_type = bulk_stones
stones          = [{"gemstone_type":"Ruby","variety":"","quantity":3,"weight":0.60,"weight_unit":"g","weight_in_carat":3.00}]
...
```

### 3.2 `PUT /api/v1/collections/:id`

Same new optional fields as POST. `weight_in_carat` may be updated on edit.
Sending an empty string or omitting the field stores `NULL`.

### 3.3 Server-side Validation

- `weight_in_carat`, if provided and non-empty, must be a positive decimal number.
- No cross-validation against `weight` or `weight_unit` is required — the operator
  is responsible for entering the correct carat equivalent.
- If `weight_in_carat` is an empty string or absent, store `NULL`.

---

## 4. Updated Response Shape

### 4.1 `single_stone`, `jewellery`, `industrial_stones`

All `GET /api/v1/collections` and `GET /api/v1/collections/:id` responses for these
types must include the new top-level field:

```json
{
  "id": "...",
  "collection_type": "single_stone",
  "weight": 1.00,
  "weight_unit": "g",
  "weight_in_carat": 5.00,
  "..."
}
```

When not set:

```json
{
  "weight_in_carat": null
}
```

### 4.2 `bulk_stones`

Each element in the `stones` array gains `weight_in_carat`:

```json
{
  "id": "...",
  "collection_type": "bulk_stones",
  "stones": [
    {
      "gemstone_type": "Ruby",
      "variety": "Pigeon Blood",
      "quantity": 3,
      "weight": 0.60,
      "weight_unit": "g",
      "weight_in_carat": 3.00
    }
  ],
  "..."
}
```

> The backend must always include `weight_in_carat` in responses (as `null` when unset),
> never omit it, so the frontend can reliably check its presence.

---

## 5. BFF Route Impact

### 5.1 `POST /api/collections` and `PUT /api/collections/:id`

The BFF routes already forward `FormData` pass-through to the backend. No BFF code
change is needed — the new `weight_in_carat` field is transparently forwarded as long
as the frontend service appends it to the `FormData` object.

### 5.2 `GET /api/collections` and `GET /api/collections/:id`

The BFF routes already proxy the full JSON response from the backend. No code change
is needed — `weight_in_carat` will be included in the proxied response automatically.

### 5.3 BFF Route Mapping (unchanged)

| Frontend BFF Route                    | Proxied Backend Route                    | Method |
|---------------------------------------|------------------------------------------|--------|
| `GET /api/collections`                | `GET /api/v1/collections`                | GET    |
| `POST /api/collections`               | `POST /api/v1/collections`               | POST   |
| `GET /api/collections/:id`            | `GET /api/v1/collections/:id`            | GET    |
| `PUT /api/collections/:id`            | `PUT /api/v1/collections/:id`            | PUT    |
| `DELETE /api/collections/:id`         | `DELETE /api/v1/collections/:id`         | DELETE |
| `PATCH /api/collections/:id/review`   | `PATCH /api/v1/collections/:id/review`   | PATCH  |

No new routes are introduced by this feature.

---

## 6. Error Responses

No new error codes. The existing `400 Bad Request` covers invalid `weight_in_carat` values.

| Status | Condition                                                         |
|--------|-------------------------------------------------------------------|
| `400`  | `weight_in_carat` provided but is not a valid positive decimal    |
| `401`  | Unauthenticated                                                   |
| `403`  | Insufficient role                                                 |
| `404`  | Collection not found                                              |

---

## 7. Backward Compatibility

- Existing records will have `weight_in_carat = null`. The backend must return
  `null` in all GET responses (never omit the field) so the frontend can safely render `—`.
- Requests that omit `weight_in_carat` are valid — the field is always optional.
- No breaking changes to existing field names, request shapes, or response structures.

---

## 8. Summary of Changes

| Area                   | Change                                                                                             |
|------------------------|----------------------------------------------------------------------------------------------------|
| DB schema              | Add `weight_in_carat DECIMAL(12,4) NULL` to `collections` (and `bulk_stone_rows` if normalised)   |
| `POST /collections`    | Accept optional `weight_in_carat` multipart field; per-row for `bulk_stones` inside `stones` JSON |
| `PUT /collections/:id` | Accept optional `weight_in_carat` multipart field on update                                        |
| GET list + GET by ID   | Include `weight_in_carat` (nullable) in all collection response shapes                             |
| `bulk_stones` rows     | Each row in `stones[]` gains optional `weight_in_carat` decimal field                             |
| BFF routes             | No changes required — FormData and JSON pass-through already handle the new field                  |

---

*Related: [`collections-api.md`](./collections-api.md) · [`collections-api-v2.md`](./collections-api-v2.md) · [`collections-api-v3.md`](./collections-api-v3.md) · [`collections-api-v4.md`](./collections-api-v4.md) · [`collections-api-v5.md`](./collections-api-v5.md) · [`collections-api-v6.md`](./collections-api-v6.md)*
