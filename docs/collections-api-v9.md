# Collections API — Latest Counter-Offer Price in Collection Detail (v9)

> This document specifies the backend enhancement to embed the latest negotiation
> counter-offer price directly in the `GET /api/v1/collections/:id` response.
>
> This eliminates the need for the frontend to make a separate call to
> `GET /api/v1/collections/:id/negotiation/` solely to pre-populate the
> **Finalized Price** field on the collection review page.
>
> Companion to [`collections-api.md`](./collections-api.md),
> [`collections-api-v2.md`](./collections-api-v2.md),
> [`collections-api-v3.md`](./collections-api-v3.md),
> [`collections-api-v4.md`](./collections-api-v4.md),
> [`collections-api-v5.md`](./collections-api-v5.md),
> [`collections-api-v6.md`](./collections-api-v6.md),
> [`collections-api-v7.md`](./collections-api-v7.md), and
> [`collections-api-v8.md`](./collections-api-v8.md).

---

## 1. Motivation

When a manager or admin opens the review page for an in-review collection, the
**Finalized Price** input must be pre-populated with the most commercially meaningful
price available:

1. **Latest `counter_offer_price`** from `gem_collections_negotiation_log`, if any
   negotiation records exist with a non-null `counter_offer_price`.
2. **`asking_price`** from the collection record itself, as a fallback.

Currently, the frontend achieves this with two sequential API calls:

```
GET /api/collections/:id            → collection details (asking_price)
GET /api/collections/:id/negotiation → full negotiation log
```

The second call is made **only to extract a single price value**. Embedding a
computed `latest_counter_offer_price` field directly in the collection detail
response removes the redundant round-trip.

---

## 2. Database Changes

**None.** The `gem_collections_negotiation_log` table (defined in
[`trove-negotiation-architecture-v2.md`](./trove-negotiation-architecture-v2.md))
already stores all counter-offer prices. The new field is computed at query time
via a SQL subquery or ORM annotation — no schema migration is required.

---

## 3. Updated Endpoint — Get Collection Detail

```
GET /api/v1/collections/:id
Authorization: Bearer <token>
```

### 3.1 New Computed Field

| Field | Type | Nullable | Description |
|---|---|---|---|
| `latest_counter_offer_price` | `decimal(15,2)` | Yes | The `counter_offer_price` from the **most recently created** `gem_collections_negotiation_log` entry for this collection that has a non-null `counter_offer_price`. `null` if no such entry exists. |

### 3.2 Computation Logic

```sql
-- Subquery to attach to the collection detail query
SELECT counter_offer_price
FROM gem_collections_negotiation_log
WHERE collection_id = :collection_id
  AND counter_offer_price IS NOT NULL
ORDER BY created_at DESC
LIMIT 1
```

In Django ORM (example):

```python
from django.db.models import OuterRef, Subquery
from .models import Collection, CollectionNegotiationLog

latest_counter_offer = CollectionNegotiationLog.objects.filter(
    collection=OuterRef('pk'),
    counter_offer_price__isnull=False
).order_by('-created_at').values('counter_offer_price')[:1]

collection = Collection.objects.annotate(
    latest_counter_offer_price=Subquery(latest_counter_offer)
).get(pk=collection_id)
```

### 3.3 Updated Response Shape

**Before (v8):**
```json
{
  "id": "c1f72a44-8890-4e31-a201-112233445566",
  "serial_no": "COL-SNG-2026-001",
  "collection_type": "single_stone",
  "status": "review",
  "asking_price": 5000.00,
  "finalized_price": null,
  "..."
}
```

**After (v9):**
```json
{
  "id": "c1f72a44-8890-4e31-a201-112233445566",
  "serial_no": "COL-SNG-2026-001",
  "collection_type": "single_stone",
  "status": "review",
  "asking_price": 5000.00,
  "finalized_price": null,
  "latest_counter_offer_price": "4600.00",
  "..."
}
```

When no negotiation records with a counter-offer exist:
```json
{
  "latest_counter_offer_price": null
}
```

When collection is accepted (finalized):
```json
{
  "status": "accepted",
  "finalized_price": 4600.00,
  "latest_counter_offer_price": "4600.00"
}
```

> `latest_counter_offer_price` must **always** be included in the response
> (as `null` when absent), never omitted, so the frontend can reliably read it.

---

## 4. Scope

### 4.1 Affected Endpoints

| Endpoint | Change |
|---|---|
| `GET /api/v1/collections/:id` | **Add** `latest_counter_offer_price` (nullable decimal) |
| `GET /api/v1/collections` (list) | **No change** — list view does not need this field |
| All other endpoints | **No change** |

> The list endpoint (`GET /api/v1/collections`) intentionally excludes this field
> to avoid an N+1 query on paginated results. The frontend only needs this value
> on the single-collection review page.

### 4.2 Authorization

`latest_counter_offer_price` is returned for all authorized callers of
`GET /api/v1/collections/:id`, subject to existing role-scoping rules
(see [`collections-api-v5.md §4`](./collections-api-v5.md)).

---

## 5. Frontend Integration

Once this endpoint change is deployed, the frontend can simplify the review page:

1. Read `collection.latest_counter_offer_price` from the collection detail response.
2. Pre-populate **Finalized Price** with:
   - `latest_counter_offer_price` if non-null, **or**
   - `asking_price` as fallback.
3. Remove the standalone `GET /api/collections/:id/negotiation/` call made on
   mount just for price pre-population. (The negotiation endpoint is still used
   by the Negotiation Drawer — that call remains unchanged.)

**TypeScript type update** (`src/features/collection/types/gemstone.types.ts`):

```ts
interface CollectionBase {
  // ... existing fields ...

  /**
   * The most recent non-null counter_offer_price from the negotiation log.
   * Computed by the backend — never persisted as a column.
   * null if no negotiation records carry a counter-offer price.
   */
  latest_counter_offer_price?: number | string | null;
}
```

---

## 6. Performance Notes

The subquery runs once per collection detail fetch. With the existing index on
`gem_collections_negotiation_log (collection_id)`, the subquery performs an
index scan and retrieves at most one row — constant-time per collection regardless
of negotiation log size.

```sql
-- Verify the index exists (from trove-negotiation-architecture-v2.md)
CREATE INDEX gem_collections_negotiation_log_collection_id_idx
    ON public.gem_collections_negotiation_log USING btree (collection_id);
```

If the backend uses an ORM annotation (`Subquery`), the full query is emitted as
a single SQL statement — no extra round-trip to the database.

---

## 7. Error Responses

No new error conditions. Existing error responses for `GET /api/v1/collections/:id`
are unchanged:

| Status | Condition |
|---|---|
| `401` | Unauthenticated |
| `403` | Caller cannot access this collection (role scoping) |
| `404` | Collection not found |

---

## 8. Backward Compatibility

- **Frontend (interim):** Until the backend ships this change, the frontend
  pre-populates using a separate `GET /api/collections/:id/negotiation/` call on
  mount (see the frontend-only implementation in the companion plan). Both
  approaches produce the same UX.
- **Frontend (post-deploy):** After backend ships v9, the frontend can remove the
  `useNegotiationSummary` hook and read directly from `collection.latest_counter_offer_price`.
- **Existing integrations:** No breaking changes. `latest_counter_offer_price` is
  an additive field. Clients that do not use it are unaffected.

---

## 9. Summary of Changes

| Area | Change |
|---|---|
| DB schema | **None** — computed from existing `gem_collections_negotiation_log` |
| `GET /api/v1/collections/:id` | Add `latest_counter_offer_price` (nullable decimal) to response |
| `GET /api/v1/collections` (list) | **No change** |
| All write endpoints | **No change** |
| Django model | Add ORM `Subquery` annotation in the collection detail view/serializer |
| Frontend type | Add `latest_counter_offer_price?: number | string | null` to `CollectionBase` |
| BFF routes | **No change** — JSON pass-through already forwards all fields |

---

*Related: [`collections-api.md`](./collections-api.md) · [`trove-negotiation-architecture-v2.md`](./trove-negotiation-architecture-v2.md)*
