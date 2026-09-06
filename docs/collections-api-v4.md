# Collections API — Per-Stone Price Support (v4)

> This document details the backend changes required to persist an optional `price` field
> on each `BulkStoneRow`, introduced by the frontend's per-stone price input feature.
>
> Companion to [`collections-api.md`](./collections-api.md),
> [`collections-api-v2.md`](./collections-api-v2.md), and
> [`collections-api-v3.md`](./collections-api-v3.md).

---

## 1. Motivation

The frontend `BulkStonesForm` now allows users to optionally enter a price per stone row when
creating a new Bulk Stones collection. These per-row prices:

- Are **optional** (non-mandatory).
- Drive the auto-population of the collection-level `asking_price` on the frontend (sum of all
  row prices).
- Must be **persisted** in the database so they can be displayed/audited later.
- Are **not used in edit mode** to change `asking_price` — the collection-level price is the
  canonical source of truth after creation.

---

## 2. Data Model Changes

### 2.1 Update `BulkStoneRow` Schema

The `stones` column stores a JSON array of `BulkStoneRow` objects. Add an optional `price` field:

**Before:**
```json
{
  "gemstone_type": "sapphire",
  "variety": "blue sapphire",
  "quantity": 5,
  "weight": 2.35,
  "weight_unit": "ct"
}
```

**After (v4):**
```json
{
  "gemstone_type": "sapphire",
  "variety": "blue sapphire",
  "quantity": 5,
  "weight": 2.35,
  "weight_unit": "ct",
  "price": 1250.00
}
```

| Field   | Type             | Required | Notes                                       |
|---------|------------------|----------|---------------------------------------------|
| `price` | `decimal(15, 2)` | No       | Per-row asking price; `null` or omitted = no price set |

> **No database migration required** if `stones` is stored as a `JSONB` / `JSON` column — the
> new field is simply part of the JSON payload. If individual stone rows are stored in a
> relational table (`bulk_stone_rows`), add a nullable `price DECIMAL(15, 2)` column.

### 2.2 Relational Table Option (if applicable)

If the backend stores stone rows in a dedicated table rather than a JSON column:

```sql
ALTER TABLE bulk_stone_rows
  ADD COLUMN price DECIMAL(15, 2) NULL;
```

---

## 3. Updated Endpoints

### 3.1 POST `/api/v1/collections` — Create (Bulk Stones)

**No change to the URL, method, or Content-Type.**

The `stones` field is already sent as a JSON-encoded string in `multipart/form-data`. The
backend must now accept the optional `price` key within each row object when parsing the JSON:

```
stones = JSON.stringify([
  { gemstone_type: "sapphire", variety: "blue sapphire", quantity: 5, weight: 2.35, weight_unit: "ct", price: 1250.00 },
  { gemstone_type: "ruby",     variety: "",               quantity: 2, weight: 1.10, weight_unit: "ct" }
])
```

- If `price` is absent or `null` for a row, store as `NULL` / omit from JSONB.
- If `price` is `0`, treat as "no price provided" (store as `NULL`).
- The backend **must not** recompute or override `asking_price` from the row prices — the
  frontend sends the already-computed `asking_price` as the canonical value.

**Updated BulkStoneRow validation:**

| Field          | Validation                        |
|----------------|-----------------------------------|
| `gemstone_type`| Required, non-empty string        |
| `variety`      | Optional string                   |
| `quantity`     | Required integer ≥ 1              |
| `weight`       | Optional decimal ≥ 0              |
| `weight_unit`  | Optional string                   |
| `price`        | Optional decimal ≥ 0; `null` OK   |

### 3.2 PUT `/api/v1/collections/:id` — Update (Bulk Stones)

Same as Create — the `stones` JSON string may include `price` per row. The backend persists
whatever is sent. In edit mode the frontend does **not** render per-row price inputs, so existing
`price` values will be preserved in the JSON as-is (the frontend passes through the `stones`
array from the record, which already contains the stored prices).

> **Important:** When the frontend sends the updated `stones` in edit mode, the `price` field
> from the original record is preserved on each row (since the frontend reads from
> `record.stones` which includes the persisted prices). The backend must not strip this field.

---

## 4. Updated Response Shape

All `GET /api/v1/collections` and `GET /api/v1/collections/:id` responses for `bulk_stones`
collections must include `price` within each stone row:

```json
{
  "id": "...",
  "collection_type": "bulk_stones",
  "stones": [
    {
      "gemstone_type": "sapphire",
      "variety": "blue sapphire",
      "quantity": 5,
      "weight": 2.35,
      "weight_unit": "ct",
      "price": 1250.00
    },
    {
      "gemstone_type": "ruby",
      "variety": "",
      "quantity": 2,
      "weight": 1.10,
      "weight_unit": "ct",
      "price": null
    }
  ],
  "asking_price": 1250.00,
  ...
}
```

Rows where price was not provided should return `"price": null`.

---

## 5. BFF Route Impact

The Next.js BFF routes at `POST /api/collections` and `PUT /api/collections/:id` already
forward the raw `multipart/form-data` body verbatim to the backend. **No BFF changes are
required** for this feature — the `stones` JSON string (which now optionally contains `price`)
is forwarded as-is.

---

## 6. Backward Compatibility

- Existing `bulk_stones` records created before v4 will not have `price` in their stone rows.
  The backend must handle `price` being absent gracefully (return as `null`).
- The frontend renders per-row price inputs only in **Add New** mode, so existing records are
  never affected by this UI change.
- `asking_price` validation (`> 0`, required) is unchanged.

---

## 7. BFF Route Mapping (unchanged)

| Frontend BFF Route               | Proxied Backend Route          | Method |
|----------------------------------|--------------------------------|--------|
| `GET /api/collections`           | `GET /api/v1/collections`      | GET    |
| `POST /api/collections`          | `POST /api/v1/collections`     | POST   |
| `GET /api/collections/:id`       | `GET /api/v1/collections/:id`  | GET    |
| `PUT /api/collections/:id`       | `PUT /api/v1/collections/:id`  | PUT    |
| `DELETE /api/collections/:id`    | `DELETE /api/v1/collections/:id`| DELETE|
| `PATCH /api/collections/:id/review` | `PATCH /api/v1/collections/:id/review` | PATCH |

No new routes are introduced by this feature.

---

## 8. Summary of Changes

| Area                  | Change                                                                 |
|-----------------------|------------------------------------------------------------------------|
| `BulkStoneRow` schema | Add optional `price: decimal(15,2)` field                              |
| DB (JSONB)            | No migration needed — new key added to existing JSON column            |
| DB (relational)       | `ALTER TABLE bulk_stone_rows ADD COLUMN price DECIMAL(15,2) NULL`      |
| POST Create           | Parse and persist `price` from each row in the stones JSON string      |
| PUT Update            | Persist `price` per row; preserve existing prices when not resent      |
| GET responses         | Include `price` (or `null`) in each `BulkStoneRow` in the response     |
| BFF routes            | No changes required                                                    |
| `asking_price`        | Unchanged — backend never computes from stone prices                   |

---

*Related: [`collections-api.md`](./collections-api.md) · [`collections-api-v2.md`](./collections-api-v2.md) · [`collections-api-v3.md`](./collections-api-v3.md)*
