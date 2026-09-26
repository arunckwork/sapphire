# Quick-Add to Masterdata — Backend API Changes

This document describes the only backend change required to support the
**Quick-Add to Masterdata** feature that was implemented on the frontend.

The existing `POST /api/v1/masterdata/admin` endpoint already handles item creation.
The only change needed is a **role-based permission split** on the admin endpoint
so that regular users (staff/user role) can create new items without gaining access
to update or deactivate them.

---

## Current Behaviour

```
/api/v1/masterdata/admin   (all HTTP methods)
  └─ Allowed roles: admin, manager ONLY
  └─ Staff / user → 403 Forbidden
```

## Required Behaviour After This Change

```
GET    /api/v1/masterdata/admin        → admin, manager only (unchanged)
POST   /api/v1/masterdata/admin        → ALL authenticated users  ← new
PATCH  /api/v1/masterdata/admin/:id    → admin, manager only (unchanged)
DELETE /api/v1/masterdata/admin/:id    → admin only (unchanged)
```

---

## Django Implementation

### Option A — Split permissions in the ViewSet (recommended)

```python
# apps/masterdata/views.py

from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdminOrManager   # existing permission class
from .models import MasterdataItem
from .serializers import MasterdataItemSerializer

class MasterdataAdminViewSet(ModelViewSet):
    queryset = MasterdataItem.objects.all()
    serializer_class = MasterdataItemSerializer

    def get_permissions(self):
        """
        POST (create) → any authenticated user.
        All other actions → admin or manager only.
        """
        if self.action == 'create':
            return [IsAuthenticated()]
        return [IsAdminOrManager()]
```

### Option B — Dedicated `create` endpoint (if ViewSet is not used)

If the admin endpoint is a plain APIView:

```python
class MasterdataAdminView(APIView):

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [IsAdminOrManager()]
```

---

## Audit Log Behaviour (no change required)

The transparent audit log already captures the `created_by` user regardless of role.
A quick-add from a staff/user will appear in the audit log with their identity, IP,
and user-agent — the same as an admin creating an item from the management page.

---

## Duplicate Handling (no change required)

The endpoint already returns `HTTP 409 Conflict` when a duplicate `(category, value)`
pair is detected. The frontend hook handles 409 gracefully by committing the existing
value and showing an informational toast instead of an error.

---

## Input Validation (no change required)

The existing serializer already validates:
- `category` must be one of the 10 known `MasterDataCategoryKey` values
- `label` is required, max 255 chars
- `value` is required, max 255 chars
- `(category, value)` is unique

No new validation rules are needed.

---

## Sort Order on Quick-Add

When a user quick-adds an item, `sort_order` is **not sent** by the frontend.
The backend should default it to `0` or `null` (end of list). Confirm the current
default in the serializer:

```python
class MasterdataItemSerializer(serializers.ModelSerializer):
    sort_order = serializers.IntegerField(default=0, required=False)
```

If `sort_order` currently has no default, add `default=0` or `allow_null=True` so
that quick-add requests without a sort_order field do not fail validation.

---

## Summary of Changes

| Area | Change Required |
|---|---|
| `MasterdataAdminViewSet.get_permissions` | Allow `POST` (create) for all authenticated users |
| Audit log | No change — already captures all roles transparently |
| Duplicate handling | No change — 409 already returned |
| Input validation | No change — existing serializer is sufficient |
| `sort_order` default | Confirm `default=0` or `required=False` in serializer |
| BFF route (`/api/masterdata/admin`) | No change — passes auth cookie through as-is |
