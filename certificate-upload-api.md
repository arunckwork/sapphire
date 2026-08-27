# Certificate Upload — Backend API Changes

This document describes the changes required on the backend to support
optional certificate file uploads on collections.

---

## 1. Database

Add a nullable column to the `collections` table:

```sql
ALTER TABLE collections
  ADD COLUMN certificate_url TEXT NULL DEFAULT NULL;
```

> **Storage pattern:** Store the relative path (e.g. `certificates/abc123.pdf`),
> not the full URL — the frontend prepends `NEXT_PUBLIC_MEDIA_BASE_URL` via
> `getMediaUrl()` before displaying.

---

## 2. File Storage

The certificate must be stored the same way as collection images.

| Detail | Value |
|---|---|
| FormData field name | `certificate` |
| Accepted MIME types | `image/*`, `application/pdf` |
| Max file size | 10 MB (recommended) |
| Storage location | `<media-root>/certificates/` or equivalent |
| Naming | UUID-based to avoid collisions |

---

## 3. API Changes

### 3a. `POST /api/collections` — Create Collection

**Request** — `multipart/form-data`

| New field | Type | Required | Description |
|---|---|---|---|
| `certificate` | `File` | No | Single certificate file (image or PDF) |

**Response** — `CollectionRecord` JSON

Add the new field to the response:

```json
{
  "certificate_url": "certificates/uuid-filename.pdf"
}
```

> Return `null` when no certificate was uploaded.

---

### 3b. `PUT /api/collections/:id` — Update Collection

**Request** — `multipart/form-data`

| New field | Type | Required | Description |
|---|---|---|---|
| `certificate` | `File` | No | Replaces the existing certificate |
| `remove_certificate` | `"true"` (string) | No | When present and `"true"`, delete the existing certificate and set `certificate_url = null` |

**Logic:**

```
if "certificate" file is present:
    delete old file from storage (if any)
    upload new file
    set certificate_url = new relative path
elif remove_certificate == "true":
    delete old file from storage (if any)
    set certificate_url = null
else:
    leave certificate_url unchanged
```

---

### 3c. `GET /api/collections/:id` — Get Single Collection

Include `certificate_url` in the response:

```json
{
  "id": "...",
  "serial_no": "...",
  "certificate_url": "certificates/uuid-filename.pdf",
  ...
}
```

---

### 3d. `GET /api/collections` — List Collections

> Certificate URL is **not** required in the list endpoint (it is only shown on
> the detail/review page). You may include it for completeness, but it is not
> consumed by the frontend list view.

---

## 4. DELETE Cascade

When a collection is deleted (`DELETE /api/collections/:id`), also delete the
associated certificate file from storage (in addition to images), if present.

---

## 5. Serializer / Response Shape

The `certificate_url` field must be included in every `CollectionRecord` response
(create, update, get). Use `null` when no certificate exists.

```typescript
// TypeScript interface already updated in the frontend:
interface CollectionBase {
  // ...existing fields...
  certificate_url?: string | null;  // relative media path or null
}
```

---

## 6. Validation

| Rule | Detail |
|---|---|
| Field is optional | Do not reject requests that omit `certificate` |
| Max file size | Reject files > 10 MB with `413 Payload Too Large` |
| Accepted types | Reject unsupported MIME types with `422 Unprocessable Entity` |
| One file only | Only the **first** `certificate` part is used; extras ignored |

---

## 7. Summary Checklist

- [ ] Add `certificate_url TEXT NULL` column to `collections` table (+ migration)
- [ ] Handle `certificate` file field in `POST /api/collections`
- [ ] Handle `certificate` + `remove_certificate` in `PUT /api/collections/:id`
- [ ] Return `certificate_url` in all `CollectionRecord` responses
- [ ] Delete certificate from storage on collection delete
- [ ] Add file size and MIME type validation
