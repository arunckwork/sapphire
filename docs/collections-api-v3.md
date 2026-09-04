# Collections API — Server-Side Filtering (v3)

> This document details the backend changes required to support server-side filtering of the
> collections list, including new query parameters for `status`, `created_at_from`,
> `created_at_to`, and `created_by`.
>
> Companion to [`collections-api.md`](./collections-api.md) and
> [`collections-api-v2.md`](./collections-api-v2.md).

---

## 1. Updated Endpoint — List Collections

```
GET /api/v1/collections
```

### 1.1 Full Query Parameter Reference

The table below supersedes the one in [`collections-api.md §1`](./collections-api.md).

| Parameter         | Type                                                                | Required | Default        | Description                                                                       |
|-------------------|---------------------------------------------------------------------|----------|----------------|-----------------------------------------------------------------------------------|
| `page`            | `integer ≥ 1`                                                       | No       | `1`            | Page number                                                                        |
| `limit`           | `10 \| 25 \| 50 \| 100`                                             | No       | `25`           | Results per page. **Changed default from `10` → `25`.**                           |
| `search`          | `string`                                                            | No       | `""`           | Full-text search across `serial_no`, seller full name, and `certification_no`     |
| `collection_type` | `"single_stone" \| "bulk_stones" \| "jewellery" \| "industrial_stones"` | No   | —              | Filter by collection type; omit or pass empty string to return all types          |
| `status`          | `"review" \| "accepted"`                                            | No       | —              | Filter by collection status; omit or pass empty string to return all statuses     |
| `created_at_from` | `string (ISO 8601 date, e.g. "2026-01-01")`                        | No       | —              | Return only collections created **on or after** this date (inclusive)             |
| `created_at_to`   | `string (ISO 8601 date, e.g. "2026-12-31")`                        | No       | —              | Return only collections created **on or before** this date (inclusive)            |
| `created_by`      | `string (UUID)`                                                     | No       | —              | Filter by the user ID of the staff member who created the collection record       |
| `sort_by`         | `"created_at" \| "asking_price" \| "collection_type"`              | No       | `"created_at"` | Sort field                                                                         |
| `sort_order`      | `"asc" \| "desc"`                                                   | No       | `"desc"`       | Sort direction                                                                     |

### 1.2 New Parameters — Detail

#### `status`

- **Type:** `string enum`
- **Valid values:** `"review"`, `"accepted"`
- **Behaviour:** When provided, the response is filtered to collections whose `status` field equals the given value. When omitted or sent as an empty string, all statuses are returned.
- **Frontend usage:** Wired to the Status filter dropdown in `GemstoneGrid`.

#### `created_at_from` / `created_at_to`

- **Type:** `string` — ISO 8601 date (`YYYY-MM-DD`). Time component is optional; if omitted the server should normalise to the start/end of the given day in UTC.
- **Behaviour:** Applied as an inclusive range filter on the `created_at` column. Either bound can be supplied independently:
  - Only `created_at_from` → records from that date onward
  - Only `created_at_to` → records up to and including that date
  - Both → records within the range
- **Frontend usage:** **Not implemented in the UI yet.** The backend must accept and respect these params. A date-range picker UI is deferred to a later iteration.

#### `created_by`

- **Type:** `string (UUID)`
- **Behaviour:** Filters collections by the `created_by` user ID — i.e., the admin or manager account that created the collection record (as opposed to `seller_id` which identifies the seller). When omitted, no filter is applied.
- **Frontend usage:** **Not implemented in the UI yet.** The backend must accept and respect this param. A "Created by" user picker UI is deferred to a later iteration.

> Note: `created_by` refers to the **staff user** (admin or manager) who registered the collection,
> not the seller. This maps to the `created_by` field on the `CollectionBase` type.
> Do not confuse with `seller_id`.

### 1.3 Filter Combining Logic

All active filters are applied with **AND** semantics:

```sql
WHERE
  (search IS NULL OR serial_no ILIKE '%search%' OR seller_name ILIKE '%search%' OR certification_no ILIKE '%search%')
  AND (collection_type IS NULL OR collection_type = :collection_type)
  AND (status IS NULL OR status = :status)
  AND (created_at_from IS NULL OR created_at >= :created_at_from)
  AND (created_at_to IS NULL OR created_at <= :created_at_to + interval '1 day')
  AND (created_by IS NULL OR created_by = :created_by)
```

### 1.4 `search` Field Scope

The `search` parameter performs a case-insensitive substring match across:

| Field                           | Notes                                     |
|---------------------------------|-------------------------------------------|
| `serial_no`                     | e.g. `COL-SNG-2026-001`                   |
| `seller.first_name + last_name` | Concatenated with a space                 |
| `certification_no`              | Optional; skip if NULL                    |
### 1.5 Pagination

- The `page` parameter is 1-indexed. The first page is `page=1`.
- The `limit` parameter controls how many records are returned per page. Valid values: `10`, `25`, `50`, `100`. Default: `25`.
- Requests with `limit` values outside this set should return `400 Bad Request`.
- `total` in the response must always reflect the **full unpaginated count** of records matching all active filters — not just the count of records returned on the current page. The frontend uses this to render `"Showing 25 of 87 entries"` and to compute `totalPages = ceil(total / limit)`.

```
totalPages = ceil(total / limit)
hasNextPage = page < totalPages
hasPrevPage = page > 1
```

---

```json
{
  "data": [CollectionObject],
  "total": 42,
  "page": 1,
  "limit": 10
}
```

`total` must reflect the **unpaginated count** matching all active filters — used by the frontend
to display "Showing X of Y entries" and to compute page counts.

---

## 3. BFF Route Mapping (Updated)

The Next.js BFF route `GET /api/collections` already passes through all query string parameters
verbatim to the backend (`request.nextUrl.searchParams.toString()`). **No BFF changes are required**
for the new query params — they are forwarded automatically.

| Frontend BFF Route                            | Proxied Backend Route                          | Method |
|-----------------------------------------------|------------------------------------------------|--------|
| `GET /api/collections`                        | `GET /api/v1/collections`                      | GET    |
| `POST /api/collections`                       | `POST /api/v1/collections`                     | POST   |
| `GET /api/collections/:id`                    | `GET /api/v1/collections/:id`                  | GET    |
| `PUT /api/collections/:id`                    | `PUT /api/v1/collections/:id`                  | PUT    |
| `DELETE /api/collections/:id`                 | `DELETE /api/v1/collections/:id`               | DELETE |
| `PATCH /api/collections/:id/review`           | `PATCH /api/v1/collections/:id/review`         | PATCH  |
| `GET /api/users/sellers`                      | `GET /api/v1/users?role=user`                  | GET    |

---

## 4. Validation Rules

| Parameter         | Validation                                                                 | On error          |
|-------------------|----------------------------------------------------------------------------|-------------------|
| `status`          | Must be `"review"` or `"accepted"` if provided; return `400` for unknown values | `400 Bad Request` |
| `collection_type` | Must be one of the four valid `CollectionType` values if provided          | `400 Bad Request` |
| `created_at_from` | Must be parseable as a valid date (`YYYY-MM-DD`)                           | `400 Bad Request` |
| `created_at_to`   | Must be parseable as a valid date; must not be before `created_at_from`    | `400 Bad Request` |
| `created_by`      | Must be a valid UUID if provided; return `400` for malformed UUIDs         | `400 Bad Request` |
| `page`            | Must be `>= 1`                                                             | `400 Bad Request` |
| `limit`           | Must be one of `10`, `25`, `50`, `100`                                     | `400 Bad Request` |

---

## 5. Example Requests

**Filter by status:**
```
GET /api/v1/collections?status=review&sort_by=created_at&sort_order=desc&page=1&limit=10
```

**Filter by type and search:**
```
GET /api/v1/collections?collection_type=single_stone&search=COL-SNG&page=1&limit=25
```

**Date range filter (backend-only for now):**
```
GET /api/v1/collections?created_at_from=2026-01-01&created_at_to=2026-06-30
```

**Filter by creator (backend-only for now):**
```
GET /api/v1/collections?created_by=3fa85f64-5717-4562-b3fc-2c963f66afa6
```

**Combined:**
```
GET /api/v1/collections?status=accepted&collection_type=jewellery&created_at_from=2026-01-01&created_by=3fa85f64-5717-4562-b3fc-2c963f66afa6&sort_by=asking_price&sort_order=desc&page=1&limit=10
```

---

*Related: [`collections-api.md`](./collections-api.md) · [`collections-api-v2.md`](./collections-api-v2.md)*
