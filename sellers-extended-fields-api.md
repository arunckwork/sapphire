# Backend API Specification: Seller Extended Fields

> **Document Version:** 1.0  
> **Target Services:** User Service (`/api/v1/users`), Masterdata Service (`/api/v1/masterdata`, `/api/v1/admin/masterdata`)  
> **Associated Feature:** Sellers Management (with Mobile Number, Location Master Data, and Profile Photo Upload)

---

## 1. Executive Summary

To support the extended seller profile attributes across the frontend BFF and UI:
1. **User Schema Extended:** Add `mobile`, `location`, and `profile_photo_url` to the user model.
2. **Registration & Update:** `POST /api/v1/users/register` and `PUT /api/v1/users/:id` accept `mobile` and `location`.
3. **Dedicated Photo Upload/Removal:** New endpoints `POST /api/v1/users/:id/photo` (multipart) and `DELETE /api/v1/users/:id/photo`.
4. **Master Data Category Added:** Register `location_options` in the master data system so locations can be listed, selected with autocomplete, quick-added on the fly, and managed in the Master Data Admin interface.
5. **Listing & Detail Responses:** Include the new fields in `GET /api/v1/users` and `GET /api/v1/users/:id`.

---

## 2. Schema Changes (`users` table)

Add the following columns to the `users` table/entity:

| Column Name | Data Type | Nullable | Description |
|---|---|---|---|
| `mobile` | `VARCHAR(30)` | YES | Contact number. Formats allowed: e.g., `+919876543210`, `0771234567`, `+1 (555) 019-2834`. |
| `location` | `VARCHAR(120)` | YES | Location name / value selected from `location_options` master data. |
| `profile_photo_url` | `VARCHAR(255)` | YES | Relative media path or full URL to the stored avatar image (e.g., `profiles/usr_abc123.webp`). |

---

## 3. Master Data Management: `location_options`

No new endpoint paths are needed. The existing master data engine is reused.

### 3.1. Public / Cached Master Data: `GET /api/v1/masterdata`
Include the `location_options` array in the master data dictionary response:

```json
{
  "gemstone_types": [...],
  "gemstone_varieties": [...],
  "treatment_options": [...],
  "origin_options": [...],
  "shape_options": [...],
  "cut_options": [...],
  "color_options": [...],
  "clarity_options": [...],
  "certification_labs": [...],
  "industrial_stone_types": [...],
  "location_options": [
    { "label": "Ratnapura", "value": "Ratnapura" },
    { "label": "Beruwala", "value": "Beruwala" },
    { "label": "Colombo", "value": "Colombo" },
    { "label": "Galle", "value": "Galle" }
  ]
}
```

### 3.2. Admin Master Data CRUD: `/api/v1/admin/masterdata`
Support `category = "location_options"` across all admin master data operations:
- `GET /api/v1/admin/masterdata?category=location_options&page=1&limit=25`
- `POST /api/v1/admin/masterdata`
  ```json
  {
    "category": "location_options",
    "label": "Kandy",
    "value": "Kandy",
    "sort_order": 5
  }
  ```
- `PUT /api/v1/admin/masterdata/:id`
- `DELETE /api/v1/admin/masterdata/:id`

---

## 4. Endpoints Specification

### 4.1. User Registration: `POST /api/v1/users/register`

- **Auth:** Bearer Token (Admin / Manager)
- **Content-Type:** `application/json`

#### Request Body
```json
{
  "first_name": "Kasun",
  "last_name": "Perera",
  "email": "kasun.perera@example.com",
  "password": "Password123!",
  "role": "USER",
  "mobile": "+94771234567",
  "location": "Ratnapura"
}
```

#### Response: `201 Created`
```json
{
  "id": "usr_94e3a890",
  "first_name": "Kasun",
  "last_name": "Perera",
  "email": "kasun.perera@example.com",
  "role": "user",
  "status": "active",
  "mobile": "+94771234567",
  "location": "Ratnapura",
  "profile_photo_url": null,
  "createdAt": "2026-10-03T10:00:00Z"
}
```

---

### 4.2. Update User: `PUT /api/v1/users/:id`

- **Auth:** Bearer Token (Admin / Manager)
- **Content-Type:** `application/json`

#### Request Body
```json
{
  "first_name": "Kasun",
  "last_name": "Perera",
  "mobile": "+94779876543",
  "location": "Beruwala"
}
```

#### Response: `200 OK`
```json
{
  "id": "usr_94e3a890",
  "first_name": "Kasun",
  "last_name": "Perera",
  "email": "kasun.perera@example.com",
  "role": "user",
  "status": "active",
  "mobile": "+94779876543",
  "location": "Beruwala",
  "profile_photo_url": "profiles/usr_94e3a890.webp",
  "createdAt": "2026-10-03T10:00:00Z"
}
```

---

### 4.3. Upload Profile Photo: `POST /api/v1/users/:id/photo`

- **Auth:** Bearer Token (Admin / Manager)
- **Content-Type:** `multipart/form-data`

#### Form Data Parameters
- `profile_photo`: File (`image/jpeg`, `image/png`, `image/webp`). Max recommended size: 5MB.

#### Storage & Processing Logic:
1. Verify user exists.
2. If the user already has a profile photo, delete/replace the old file from object storage/disk.
3. Optimize/resize image if appropriate (e.g., standard avatar resolution: 400x400 or max 800px).
4. Save file path/key to `profile_photo_url` column on the user record.
5. Return the updated user object.

#### Response: `200 OK` (or `201 Created`)
```json
{
  "id": "usr_94e3a890",
  "first_name": "Kasun",
  "last_name": "Perera",
  "email": "kasun.perera@example.com",
  "role": "user",
  "status": "active",
  "mobile": "+94779876543",
  "location": "Beruwala",
  "profile_photo_url": "profiles/usr_94e3a890.webp",
  "createdAt": "2026-10-03T10:00:00Z"
}
```

---

### 4.4. Delete Profile Photo: `DELETE /api/v1/users/:id/photo`

- **Auth:** Bearer Token (Admin / Manager)

#### Logic:
1. Delete the stored file associated with `profile_photo_url`.
2. Set `profile_photo_url = NULL` for the user.
3. Return `204 No Content` or `200 OK`.

#### Response: `204 No Content`

---

### 4.5. User List: `GET /api/v1/users`

Ensure all user records in the listing array return the new fields:

```json
{
  "data": [
    {
      "id": "usr_94e3a890",
      "first_name": "Kasun",
      "last_name": "Perera",
      "email": "kasun.perera@example.com",
      "role": "user",
      "status": "active",
      "mobile": "+94771234567",
      "location": "Ratnapura",
      "profile_photo_url": "profiles/usr_94e3a890.webp",
      "createdAt": "2026-10-03T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 25
}
```

---

## 5. Security & Validation Rules

1. **Mobile Number Validation:**
   - Optional on users generally, but mandatory for sellers validated client-side.
   - Server-side recommendation: Allow digits, spaces, hyphens, parentheses, and leading `+` (length between 7 and 25 characters).
2. **Location Validation:**
   - String up to 120 characters matching a valid location or free text if custom locations are permitted.
3. **Photo MIME Types:**
   - Restrict to `image/jpeg`, `image/png`, `image/webp`. Reject executable or SVG uploads to prevent XSS.
4. **Permissions:**
   - Only `admin` and `manager` roles can upload or delete photos for users/sellers via management endpoints.
