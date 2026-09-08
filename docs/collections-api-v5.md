# Collections API — Role-Scoped List Filtering (v5)

> This document details the backend changes required to scope the
> `GET /api/v1/collections` endpoint so that callers with `role = user`
> (i.e. sellers) only receive collections where **they are the seller**.
>
> Companion to [`collections-api.md`](./collections-api.md),
> [`collections-api-v2.md`](./collections-api-v2.md),
> [`collections-api-v3.md`](./collections-api-v3.md), and
> [`collections-api-v4.md`](./collections-api-v4.md).

---

## 1. Motivation

Currently, `GET /api/v1/collections` is available to all authenticated roles and returns
all collections (subject to the query-param filters introduced in v3). Sellers (`role = user`)
should be able to browse their own inventory via this endpoint, but must **not** see other
sellers' collections.

The desired behaviour:

| Caller role          | Visible collections                                              |
|----------------------|------------------------------------------------------------------|
| `admin` / `manager`  | All collections (no change — existing behaviour preserved)       |
| `user` (seller)      | Only collections where `seller_id = <caller's own user ID>`      |

The scoping is **server-enforced** — the caller cannot override it by passing a `seller_id`
query parameter.

---

## 2. Data Model Changes

**None.** The `seller_id` column already exists on the `collections` table (see
[`collections-api.md §Data Models`](./collections-api.md)). No schema migration is required.

---

## 3. Updated Endpoint — List Collections

```
GET /api/v1/collections
Authorization: Bearer <token>
```

### 3.1 Role-Scoping Logic

After authenticating the bearer token and resolving the caller's identity (`user_id`, `role`),
apply the following before executing the query:

```
if caller.role == "user":
    force_filter: seller_id = caller.user_id
    # ignore any seller_id query parameter sent by the client
else:
    # admin / manager — apply seller_id filter only if explicitly passed
    seller_id_filter = query_params.seller_id (optional, as before)
```

> **Security note:** A `role = user` caller must **never** be able to override this implicit
> filter, even if they craft a request with an explicit `seller_id` query parameter. The
> backend must silently discard any client-supplied `seller_id` when the caller is a seller.

### 3.2 Full Query Parameter Reference (supersedes v3 §1.1)

The table below extends the parameter set from
[`collections-api-v3.md §1.1`](./collections-api-v3.md) with the scoping notes.

| Parameter         | Type                                                                        | Required | Default        | Description                                                                                  |
|-------------------|-----------------------------------------------------------------------------|----------|----------------|----------------------------------------------------------------------------------------------|
| `page`            | `integer >= 1`                                                              | No       | `1`            | Page number                                                                                   |
| `limit`           | `10 \| 25 \| 50 \| 100`                                                     | No       | `25`           | Results per page                                                                              |
| `search`          | `string`                                                                    | No       | `""`           | Full-text search across `serial_no`, seller full name, and `certification_no`                |
| `collection_type` | `"single_stone" \| "bulk_stones" \| "jewellery" \| "industrial_stones"`     | No       | —              | Filter by collection type                                                                     |
| `status`          | `"review" \| "accepted"`                                                    | No       | —              | Filter by collection status                                                                   |
| `created_at_from` | `string (ISO 8601 date, e.g. "2026-01-01")`                                | No       | —              | Return collections created on or after this date                                              |
| `created_at_to`   | `string (ISO 8601 date, e.g. "2026-12-31")`                                | No       | —              | Return collections created on or before this date                                             |
| `created_by`      | `string (UUID)`                                                             | No       | —              | Filter by staff user who created the record (**ignored if caller is `role = user`**)          |
| `seller_id`       | `string (UUID)`                                                             | No       | —              | Filter by seller (**ignored if caller is `role = user`** — scoping is automatic)             |
| `sort_by`         | `"created_at" \| "asking_price" \| "collection_type"`                      | No       | `"created_at"` | Sort field                                                                                    |
| `sort_order`      | `"asc" \| "desc"`                                                           | No       | `"desc"`       | Sort direction                                                                                |

### 3.3 Filter Combining Logic (updated)

All active filters are applied with **AND** semantics. The role-scoped seller filter is
treated as an implicit, non-overridable condition:

```sql
WHERE
  -- Role-scoped implicit filter (always applied for role = user)
  (
    caller_role != 'user'
    OR seller_id = :caller_user_id
  )
  -- Explicit seller_id filter (admin/manager only)
  AND (
    caller_role = 'user'
    OR :seller_id_param IS NULL
    OR seller_id = :seller_id_param
  )
  -- Existing filters from v3
  AND (search IS NULL
       OR serial_no ILIKE '%search%'
       OR seller_name ILIKE '%search%'
       OR certification_no ILIKE '%search%')
  AND (collection_type IS NULL OR collection_type = :collection_type)
  AND (status IS NULL OR status = :status)
  AND (created_at_from IS NULL OR created_at >= :created_at_from)
  AND (created_at_to   IS NULL OR created_at <= :created_at_to + interval '1 day')
  AND (created_by IS NULL OR created_by = :created_by)
```

> **Tip (application-layer equivalent):** In an ORM or query builder, this is simplest to
> implement by checking the role before building the query:
>
> ```pseudo
> if caller.role == "user":
>     query.where("seller_id", "=", caller.user_id)
> elif params.seller_id:
>     query.where("seller_id", "=", params.seller_id)
> ```

### 3.4 `total` Accuracy

The `total` field in the response must always reflect the **full unpaginated count** of
records matching all active filters — including the role-scoped seller filter. A seller
should only ever see their own count, not a global total.

### 3.5 Response Shape (unchanged)

```json
{
  "data": [CollectionObject],
  "total": 7,
  "page": 1,
  "limit": 25
}
```

---

## 4. `GET /api/v1/collections/:id` — Recommended Scoping (follow-up)

The single-collection endpoint is not the primary focus of this spec, but for consistency
the backend **should** ensure that a `role = user` caller can only retrieve a collection
where they are the seller. Return `403 Forbidden` or `404 Not Found` if
`seller_id != caller.user_id`. This is a separate concern and may be addressed in a
follow-up if not already in place.

---

## 5. Authorization Matrix (full picture)

| Endpoint                              | `admin` / `manager`                          | `user` (seller)                                           |
|---------------------------------------|----------------------------------------------|-----------------------------------------------------------|
| `GET /api/v1/collections`             | All collections, `seller_id` filter optional | Own collections only (`seller_id` auto-scoped, non-overridable) |
| `GET /api/v1/collections/:id`         | Any collection                               | Only if `seller_id == caller.user_id` (recommended: `403/404` otherwise) |
| `POST /api/v1/collections`            | Allowed                                      | `403 Forbidden`                                           |
| `PUT /api/v1/collections/:id`         | Allowed                                      | `403 Forbidden`                                           |
| `DELETE /api/v1/collections/:id`      | Allowed                                      | `403 Forbidden`                                           |
| `PATCH /api/v1/collections/:id/review`| Allowed                                      | `403 Forbidden`                                           |

---

## 6. BFF Route Impact

### 6.1 `GET /api/collections` (Next.js BFF route)

The current BFF route at
[`src/app/api/collections/route.ts`](../src/app/api/collections/route.ts)
forwards all query parameters and the bearer token verbatim to the backend:

```ts
const res = await fetch(
  `${BACKEND_URL}/api/v1/collections${search ? `?${search}` : ''}`,
  { headers: { Authorization: `Bearer ${token}` } }
);
```

**No BFF changes are required.** The backend derives the caller's role from the bearer token
and applies the scoping server-side. The `access_token` cookie is already forwarded as the
`Authorization` header, giving the backend everything it needs.

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

## 7. Token / Identity Contract

The backend must be able to resolve the caller's `user_id` and `role` from the bearer token
on every request. Assuming a JWT, the required claims are:

| Claim   | Type     | Description                             |
|---------|----------|-----------------------------------------|
| `sub`   | `string` | The caller's user ID (UUID)             |
| `role`  | `string` | One of `"admin"`, `"manager"`, `"user"` |

> If the token does not contain a `role` claim, the backend must look up the user record
> in the database and derive the role from there before applying the filter.

---

## 8. Validation Rules

No new query-parameter validation rules are introduced. The only change is the **implicit**,
non-validatable suppression of `seller_id` when the caller is a seller.

> If a `role = user` caller sends an explicit `seller_id` that does not match their own ID,
> the backend must silently ignore it (replace with the caller's own ID), **not** return a
> `400`. Returning an error would leak the information that the server is filtering, and
> there is no technical error in the request itself.

---

## 9. Example Requests & Expected Results

**Seller (role = user) fetches their own collections — no params needed:**
```
GET /api/v1/collections
Authorization: Bearer <seller_token>
→ Returns only collections where seller_id = <seller's own user_id>
```

**Seller tries to pass an explicit seller_id — silently scoped to own ID:**
```
GET /api/v1/collections?seller_id=<some_other_user_id>
Authorization: Bearer <seller_token>
→ Still returns only the seller's own collections (param is ignored)
```

**Admin lists all collections (unchanged behaviour):**
```
GET /api/v1/collections
Authorization: Bearer <admin_token>
→ Returns all collections
```

**Admin filters by a specific seller:**
```
GET /api/v1/collections?seller_id=<uuid>
Authorization: Bearer <admin_token>
→ Returns only collections for that seller
```

**Seller filters their own collections by status:**
```
GET /api/v1/collections?status=accepted
Authorization: Bearer <seller_token>
→ Returns the seller's accepted collections only
```

**Seller searches within their own collections:**
```
GET /api/v1/collections?search=COL-SNG&collection_type=single_stone
Authorization: Bearer <seller_token>
→ Returns matching single-stone collections owned by the seller
```

---

## 10. Summary of Changes

| Area                     | Change                                                                                            |
|--------------------------|---------------------------------------------------------------------------------------------------|
| `GET /api/v1/collections`| When `caller.role == "user"`, automatically filter to `seller_id = caller.user_id`               |
| `seller_id` param        | Silently ignored for `role = user` callers; still honoured for `admin`/`manager`                 |
| `created_by` param       | Silently ignored for `role = user` callers (they have no concept of "created by")                |
| `total` in response      | Reflects role-scoped count (seller sees their own count, not global total)                        |
| Data model               | No changes required                                                                               |
| BFF routes               | No changes required                                                                               |
| Other endpoints          | No changes to POST / PUT / DELETE / PATCH; `GET /:id` scoping recommended as a follow-up         |

---

*Related: [`collections-api.md`](./collections-api.md) · [`collections-api-v2.md`](./collections-api-v2.md) · [`collections-api-v3.md`](./collections-api-v3.md) · [`collections-api-v4.md`](./collections-api-v4.md)*
