# Backend API Changes Required — Sellers Feature

> This document describes the backend (`/api/v1/users`) changes needed to
> support the Sellers module and the updated Users listing in the BFF layer.

---

## Context

The frontend BFF now routes **seller management** through a dedicated set of
Next.js proxy routes (`/api/sellers/*`) that all call the same upstream
`/api/v1/users` endpoint. Two new query parameters are required on that
endpoint to make the split work cleanly.

---

## 1. `GET /api/v1/users` — Two New Query Parameters

### 1a. `role` — Filter by exact role (already partially supported)

Used by: **`GET /api/v1/users?role=user`** (Sellers listing BFF)

The existing `/api/users/sellers` autocomplete route already relied on `?role=user`,
so this param should already be implemented. **Confirm it works for pagination too** —
the sellers listing passes the full set of pagination params alongside it:

```
GET /api/v1/users?role=user&search=&sort_by=createdAt&sort_order=desc&page=1&limit=25
```

**Expected behaviour:** Return only users whose `role` exactly matches the
given value. All other pagination, sort, and search params apply normally on
top of this filter.

---

### 1b. `exclude_role` — **New parameter required** ⚠️

Used by: **`GET /api/v1/users?exclude_role=user`** (Users listing BFF)

The Users listing BFF now injects `exclude_role=user` into every request so
that users with `role=user` are never shown in the admin Users table (they are
managed through the Sellers module instead).

```
GET /api/v1/users?exclude_role=user&search=&sort_by=createdAt&sort_order=desc&page=1&limit=25
```

**Expected behaviour:** Return all users **except** those whose `role` matches
the given value. Pagination totals and counts must also reflect the exclusion
(i.e. `total` in the response body should not count excluded records).

#### BFF code reference

```ts
// src/app/api/users/route.ts  (line 26)
searchParams.set('exclude_role', 'user');
```

#### Suggested backend implementation (pseudo-code)

```python
# Example — adapt to your ORM / query builder
if exclude_role := request.query_params.get("exclude_role"):
    queryset = queryset.exclude(role=exclude_role)

if role := request.query_params.get("role"):
    queryset = queryset.filter(role=role)
```

> [!IMPORTANT]
> `role` and `exclude_role` are mutually exclusive in practice — the BFF
> will never send both at the same time. However, if both arrive, `role`
> (positive filter) should take precedence and `exclude_role` should be
> ignored to avoid a zero-result conflict.

---

## 2. `POST /api/v1/users/register` — Seller Registration

Used by: **`POST /api/sellers/register`** BFF

**No new backend change required.** The BFF already forces `role: "USER"` in
the request body before forwarding:

```ts
// src/app/api/sellers/register/route.ts  (line 25)
body: JSON.stringify({ ...body, role: 'USER' }),
```

**Confirm:** The register endpoint must accept `role` as a body field and
persist it. If it currently ignores `role` on registration (defaulting to
`user`), that is also acceptable — the result is the same.

---

## 3. `PUT /api/v1/users/:id` — Seller Update (Role Protection)

Used by: **`PUT /api/sellers/[id]`** BFF

**No new backend change required.** The BFF strips the `role` field before
forwarding the update body, so the backend will never receive a `role` field
via the sellers update route:

```ts
// src/app/api/sellers/[id]/route.ts  (line 24)
const { role: _role, ...safe } = body;
```

> [!NOTE]
> As an additional safety layer, the backend may choose to ignore `role` on
> PUT updates entirely (or require a separate dedicated role-change endpoint),
> since role changes for sellers should never be needed through this flow.

---

## 4. `POST /api/v1/users/:id/suspend` and `POST /api/v1/users/:id/activate`

Used by: **`POST /api/sellers/[id]/suspend`** and **`POST /api/sellers/[id]/activate`**

**No backend change required.** These endpoints are reused as-is. The BFF
simply calls the same upstream suspend/activate endpoints using the seller's
user ID.

---

## Summary Table

| Backend Endpoint | Change Required | Details |
|---|---|---|
| `GET /api/v1/users` | ✅ **New param: `exclude_role`** | Exclude users matching this role from results + totals |
| `GET /api/v1/users` | 🔍 **Confirm: `role` with pagination** | Ensure `?role=user` works with all pagination/sort params |
| `POST /api/v1/users/register` | ✔ No change | BFF injects `role: USER` in body |
| `PUT /api/v1/users/:id` | ✔ No change | BFF strips `role` before forwarding |
| `POST /api/v1/users/:id/suspend` | ✔ No change | Reused as-is |
| `POST /api/v1/users/:id/activate` | ✔ No change | Reused as-is |

---

## Response Shape

Both the Users listing and the Sellers listing expect the same paginated
response shape from `GET /api/v1/users`:

```json
{
  "data": [
    {
      "id": "string",
      "first_name": "string",
      "last_name": "string | null",
      "email": "string",
      "role": "admin | manager | staff | user",
      "status": "active | suspended",
      "createdAt": "ISO 8601 string"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 25
}
```

> [!WARNING]
> The `total` field **must** reflect the filtered count. If `exclude_role=user`
> is sent and there are 100 users total but 30 have `role=user`, the response
> must return `"total": 70` — not `100`. Incorrect totals will break
> pagination in the Users table.

---

## Testing Checklist

- [ ] `GET /api/v1/users?exclude_role=user` — returns no `role=user` records; `total` excludes them
- [ ] `GET /api/v1/users?role=user` — returns only `role=user` records; `total` counts only them
- [ ] `GET /api/v1/users?role=user&search=jane&sort_by=first_name&sort_order=asc&page=1&limit=10` — pagination works with role filter
- [ ] `GET /api/v1/users?exclude_role=user&search=admin&page=2` — pagination works with exclusion
- [ ] `POST /api/v1/users/register` with `{ ..., role: "USER" }` — creates user with role=user
- [ ] `PUT /api/v1/users/:id` without `role` field — updates name only, role unchanged
