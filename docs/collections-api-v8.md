# Collections API — Jewellery Type Field & Masterdata (v8)

> This document details the backend changes required to support the new optional
> **Jewellery Type** field for jewellery collection items, backed by the new
> `jewellery_types` masterdata category.
>
> Companion to [`collections-api.md`](./collections-api.md),
> [`collections-api-v2.md`](./collections-api-v2.md),
> [`collections-api-v3.md`](./collections-api-v3.md),
> [`collections-api-v4.md`](./collections-api-v4.md),
> [`collections-api-v5.md`](./collections-api-v5.md),
> [`collections-api-v6.md`](./collections-api-v6.md), and
> [`collections-api-v7.md`](./collections-api-v7.md).

---

## 1. Overview & Motivation

Jewellery collections represent finished jewellery pieces (e.g. rings, necklaces, bracelets, earrings).
Previously, jewellery records only captured total weight, carat weight, description, and images/certificates.
Operators and buyers need a clear categorization of the piece.

This update introduces:
1. A new masterdata category: `jewellery_types`.
2. A new column `jewellery_type` on the `collections` table.
3. Support for `jewellery_type` in collection creation, updating, and querying endpoints.
4. Masterdata management (CRUD + Quick Add) for `jewellery_types`.

---

## 2. Database Schema Changes

### 2.1 Add Column to `collections` Table

```sql
ALTER TABLE collections
  ADD COLUMN jewellery_type VARCHAR(100) NULL;
```

| Column           | Type           | Nullable | Default | Description |
|------------------|----------------|----------|---------|-------------|
| `jewellery_type` | `VARCHAR(100)` | Yes      | `NULL`  | Value from `jewellery_types` masterdata (e.g., `hand_ring`, `necklace`). Only applicable when `collection_type = 'jewellery'`. `NULL` for other types. |

> **Migration Notes:**
> - No data backfill is required.
> - Existing jewellery records will have `NULL`.
> - For non-jewellery collection types (`single_stone`, `bulk_stones`, `industrial_stones`), this column remains `NULL`.

---

## 3. Masterdata Changes

### 3.1 New Category: `jewellery_types`

A new category key `"jewellery_types"` is registered in the masterdata subsystem.

#### Recommended Seed Data

| Label | Value | Description |
|---|---|---|
| Hand Ring | `hand_ring` | Rings worn on fingers |
| Necklace | `necklace` | Chains or strings worn around the neck |
| Bracelet | `bracelet` | Bands or chains worn on the wrist |
| Earrings | `earrings` | Jewellery worn on the ears |
| Pendant | `pendant` | Hanging ornament on a chain |
| Bangle | `bangle` | Rigid bracelet |
| Brooch | `brooch` | Decorative pin |
| Anklet | `anklet` | Chain worn on the ankle |
| Chain | `chain` | Plain or ornate chain |
| Cufflinks | `cufflinks` | Shirt cuff fasteners |

### 3.2 Masterdata Retrieval: `GET /api/v1/masterdata`

The response object must include the new `jewellery_types` array:

```http
GET /api/v1/masterdata
Authorization: Bearer <token>
```

**Response (`200 OK`):**
```jsonc
{
  "gemstone_types": [ ... ],
  "gemstone_varieties": [ ... ],
  "treatment_options": [ ... ],
  "origin_options": [ ... ],
  "shape_options": [ ... ],
  "cut_options": [ ... ],
  "color_options": [ ... ],
  "clarity_options": [ ... ],
  "certification_labs": [ ... ],
  "industrial_stone_types": [ ... ],
  "jewellery_types": [
    { "id": 1, "label": "Hand Ring", "value": "hand_ring" },
    { "id": 2, "label": "Necklace",  "value": "necklace" },
    { "id": 3, "label": "Bracelet",  "value": "bracelet" },
    { "id": 4, "label": "Earrings",  "value": "earrings" },
    { "id": 5, "label": "Pendant",   "value": "pendant" },
    { "id": 6, "label": "Bangle",    "value": "bangle" },
    { "id": 7, "label": "Brooch",    "value": "brooch" },
    { "id": 8, "label": "Anklet",    "value": "anklet" },
    { "id": 9, "label": "Chain",     "value": "chain" },
    { "id": 10, "label": "Cufflinks", "value": "cufflinks" }
  ]
}
```

### 3.3 Masterdata Admin CRUD & Quick-Add Endpoints

The masterdata admin subsystem uses a unified viewset (`MasterDataAdminViewSet`) mapped to `/api/v1/masterdata/admin/`.

#### 3.3.1 Model Update (`masterdata/models.py`)

Add `JEWELLERY_TYPES` to the `MasterDataCategory` enum:

```python
class MasterDataCategory(models.TextChoices):
    GEMSTONE_TYPES         = "gemstone_types",         "Gemstone Types"
    GEMSTONE_VARIETIES     = "gemstone_varieties",     "Gemstone Varieties"
    TREATMENT_OPTIONS      = "treatment_options",      "Treatment Options"
    ORIGIN_OPTIONS         = "origin_options",         "Origin Options"
    SHAPE_OPTIONS          = "shape_options",          "Shape Options"
    CUT_OPTIONS            = "cut_options",            "Cut Options"
    COLOR_OPTIONS          = "color_options",          "Color Options"
    CLARITY_OPTIONS        = "clarity_options",        "Clarity Options"
    CERTIFICATION_LABS     = "certification_labs",     "Certification Labs"
    INDUSTRIAL_STONE_TYPES = "industrial_stone_types", "Industrial Stone Types"
    LOCATION_OPTIONS       = "location_options",       "Location Options"
    JEWELLERY_TYPES        = "jewellery_types",        "Jewellery Types"  # ← new choice
```

#### 3.3.2 Admin CRUD Endpoints

The existing unified admin routes support `category=jewellery_types`:

| Action | HTTP Method & Path | Payload / Query | Notes |
|---|---|---|---|
| **List** | `GET /api/v1/masterdata/admin/?category=jewellery_types&page=1&limit=100` | Query params | Returns paginated items (including inactive) |
| **Create** | `POST /api/v1/masterdata/admin/` | `{"category": "jewellery_types", "label": "Tiara", "value": "tiara", "sort_order": 0}` | Used by Admin Drawer & Quick-Add |
| **Update** | `PATCH /api/v1/masterdata/admin/:id/` | `{"label": "Tiara Crown", "sort_order": 1}` | Update label or sort order |
| **Soft Delete** | `PATCH /api/v1/masterdata/admin/:id/` | `{"is_active": false}` | Deactivate (hides from dropdowns) |
| **Reactivate** | `PATCH /api/v1/masterdata/admin/:id/` | `{"is_active": true}` | Reactivate (restores to dropdowns) |
| **Hard Delete** | `DELETE /api/v1/masterdata/admin/:id/` | — | Hard delete (admin only) |

---

## 4. Collections API Endpoints

### 4.1 Create Collection: `POST /api/v1/collections`

**Content-Type:** `multipart/form-data`

#### Fields for `collection_type = 'jewellery'`

| Field | Type | Required | Description |
|---|---|---|---|
| `collection_type` | `string` | **Yes** | Must be `'jewellery'` |
| `name` | `string` | **Yes** | Name of the collection / item |
| `owner_id` | `string` | **Yes** | Seller / Owner user ID |
| `status` | `string` | **Yes** | e.g. `'pending'`, `'available'` |
| `jewellery_type` | `string` | **No** | Masterdata value (e.g. `'hand_ring'`). Omit or leave empty if not specified. |
| `weight` | `number` | **Yes** | Total weight (decimal) |
| `weight_unit` | `string` | **Yes** | Weight unit (`'g'`, `'kg'`, `'ct'`, etc.) |
| `weight_in_carat`| `number` | **No** | Weight in carat (decimal) |
| `description` | `string` | **No** | Narrative notes |
| `images` | `file[]` | **No** | Uploaded image files |
| `certificates` | `file[]` | **No** | Uploaded certificate files |

#### Multipart Example Payload

```http
POST /api/v1/collections
Authorization: Bearer <token>
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryX

------WebKitFormBoundaryX
Content-Disposition: form-data; name="collection_type"

jewellery
------WebKitFormBoundaryX
Content-Disposition: form-data; name="name"

Vintage Sapphire Engagement Ring
------WebKitFormBoundaryX
Content-Disposition: form-data; name="owner_id"

seller_123
------WebKitFormBoundaryX
Content-Disposition: form-data; name="jewellery_type"

hand_ring
------WebKitFormBoundaryX
Content-Disposition: form-data; name="weight"

4.85
------WebKitFormBoundaryX
Content-Disposition: form-data; name="weight_unit"

g
------WebKitFormBoundaryX
Content-Disposition: form-data; name="weight_in_carat"

24.25
------WebKitFormBoundaryX
Content-Disposition: form-data; name="description"

18k White Gold ring set with a natural Ceylon Blue Sapphire.
------WebKitFormBoundaryX--
```

---

### 4.2 Update Collection: `PATCH /api/v1/collections/:id` or `PUT /api/v1/collections/:id`

Accepts `jewellery_type` (optional string or `null` to clear) in `multipart/form-data`.

---

### 4.3 Get Collection Details: `GET /api/v1/collections/:id`

**Response (`200 OK`):**

```json
{
  "id": "col_jwl_98234",
  "name": "Vintage Sapphire Engagement Ring",
  "collection_type": "jewellery",
  "owner_id": "seller_123",
  "status": "available",
  "jewellery_type": "hand_ring",
  "weight": 4.85,
  "weight_unit": "g",
  "weight_in_carat": 24.25,
  "description": "18k White Gold ring set with a natural Ceylon Blue Sapphire.",
  "images": [
    { "id": "img_1", "url": "/uploads/ring1.jpg" }
  ],
  "certificates": [],
  "created_at": "2026-10-11T07:15:00.000Z",
  "updated_at": "2026-10-11T07:15:00.000Z"
}
```

---

### 4.4 List Collections: `GET /api/v1/collections`

For records with `collection_type = 'jewellery'`, include `jewellery_type` (string or `null`) in each item in the results list:

```json
{
  "data": [
    {
      "id": "col_jwl_98234",
      "name": "Vintage Sapphire Engagement Ring",
      "collection_type": "jewellery",
      "jewellery_type": "hand_ring",
      "weight": 4.85,
      "weight_unit": "g",
      "weight_in_carat": 24.25,
      "status": "available"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

---

## 5. Summary Checklist for Backend Engineers

- [ ] Execute database migration to add `jewellery_type VARCHAR(100) NULL` to `collections`.
- [ ] Add `jewellery_types` category and seed default values in masterdata table/service.
- [ ] Ensure `GET /api/v1/masterdata` returns `jewellery_types` array.
- [ ] Allow CRUD operations on `jewellery_types` via `/api/v1/masterdata/jewellery_types`.
- [ ] Update `POST /api/v1/collections` and `PATCH /api/v1/collections/:id` validators to allow `jewellery_type` for jewellery items.
- [ ] Update collection serializer to return `jewellery_type` on `GET /api/v1/collections` and `GET /api/v1/collections/:id`.
