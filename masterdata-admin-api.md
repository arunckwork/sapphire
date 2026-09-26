# Masterdata Admin CRUD — Backend API Changes

This document describes all backend changes required to expose CRUD operations
for the masterdata module, with transparent audit logging. The frontend has zero
knowledge of audit logs — they are written entirely server-side.

---

## 1. Enhanced Data Model

### 1.1 Update `MasterData` model

Add `created_by` and `updated_by` FK references (populated transparently via request context — no frontend input required):

```python
# masterdata/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


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


class MasterData(models.Model):
    category   = models.CharField(
        max_length=50,
        choices=MasterDataCategory.choices,
        db_index=True,
    )
    label      = models.CharField(max_length=255)
    value      = models.CharField(max_length=255)
    sort_order = models.PositiveIntegerField(default=0)
    is_active  = models.BooleanField(default=True, db_index=True)

    # Transparent tracking — written by the service layer, never by the frontend
    created_by = models.ForeignKey(
        User, null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='masterdata_created',
    )
    updated_by = models.ForeignKey(
        User, null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='masterdata_updated',
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering        = ["category", "sort_order", "label"]
        unique_together = [("category", "value")]
        verbose_name         = "Master Data"
        verbose_name_plural  = "Master Data"

    def __str__(self):
        return f"[{self.category}] {self.label}"
```

Migration:

```bash
python manage.py makemigrations masterdata --name add_tracking_fields
python manage.py migrate
```

---

## 2. Audit Log Model (Separate Table)

The audit log is stored in its own table — completely decoupled from MasterData.
It is written automatically by a Django **post-save / post-delete signal** on `MasterData`.
The frontend never calls, reads, or posts to any audit endpoint.

```python
# masterdata/models.py  (add below MasterData)

class MasterDataAuditAction(models.TextChoices):
    CREATE     = "create",     "Created"
    UPDATE     = "update",     "Updated"
    DEACTIVATE = "deactivate", "Deactivated"
    REACTIVATE = "reactivate", "Reactivated"


class MasterDataAuditLog(models.Model):
    """
    Immutable audit trail for every change to MasterData records.
    Written automatically by signals — no API endpoint exposes this to the frontend.
    """
    masterdata   = models.ForeignKey(
        MasterData, null=True, blank=True,
        on_delete=models.SET_NULL,   # keep log even if item is deleted
        related_name='audit_logs',
    )
    action       = models.CharField(max_length=20, choices=MasterDataAuditAction.choices)
    actor        = models.ForeignKey(
        User, null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='masterdata_audit_actions',
    )
    # Snapshot of values at time of change
    category     = models.CharField(max_length=50)
    label_before = models.CharField(max_length=255, blank=True, null=True)
    label_after  = models.CharField(max_length=255, blank=True, null=True)
    value_before = models.CharField(max_length=255, blank=True, null=True)
    value_after  = models.CharField(max_length=255, blank=True, null=True)
    sort_before  = models.IntegerField(null=True, blank=True)
    sort_after   = models.IntegerField(null=True, blank=True)
    is_active_before = models.BooleanField(null=True, blank=True)
    is_active_after  = models.BooleanField(null=True, blank=True)
    timestamp    = models.DateTimeField(auto_now_add=True, db_index=True)
    ip_address   = models.GenericIPAddressField(null=True, blank=True)
    user_agent   = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["-timestamp"]
        verbose_name = "Masterdata Audit Log"

    def __str__(self):
        actor = self.actor.get_full_name() if self.actor else "System"
        return f"[{self.timestamp:%Y-%m-%d %H:%M}] {actor} {self.action} [{self.category}] {self.label_after or self.label_before}"
```

Migration:

```bash
python manage.py makemigrations masterdata --name add_audit_log
python manage.py migrate
```

---

## 3. Audit Signal

Write audit logs automatically using Django signals.
Place this in `masterdata/signals.py`:

```python
# masterdata/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import MasterData, MasterDataAuditLog, MasterDataAuditAction

# Thread-local storage to carry request context into the signal
import threading
_audit_context = threading.local()


def set_audit_context(user=None, ip_address=None, user_agent=None):
    """Call this in the view/service layer before saving a MasterData instance."""
    _audit_context.user       = user
    _audit_context.ip_address = ip_address
    _audit_context.user_agent = user_agent
    _audit_context.previous   = {}  # populated by pre_save


def clear_audit_context():
    _audit_context.user       = None
    _audit_context.ip_address = None
    _audit_context.user_agent = None
    _audit_context.previous   = {}


from django.db.models.signals import pre_save

@receiver(pre_save, sender=MasterData)
def capture_previous_state(sender, instance, **kwargs):
    """Capture the before-state before the save occurs."""
    if instance.pk:
        try:
            old = MasterData.objects.get(pk=instance.pk)
            _audit_context.previous = {
                'label':     old.label,
                'value':     old.value,
                'sort_order': old.sort_order,
                'is_active': old.is_active,
            }
        except MasterData.DoesNotExist:
            _audit_context.previous = {}
    else:
        _audit_context.previous = {}


@receiver(post_save, sender=MasterData)
def write_audit_log(sender, instance, created, **kwargs):
    prev = getattr(_audit_context, 'previous', {})
    actor = getattr(_audit_context, 'user', None)
    ip    = getattr(_audit_context, 'ip_address', None)
    ua    = getattr(_audit_context, 'user_agent', None)

    if created:
        action = MasterDataAuditAction.CREATE
    elif not instance.is_active and prev.get('is_active', True):
        action = MasterDataAuditAction.DEACTIVATE
    elif instance.is_active and not prev.get('is_active', True):
        action = MasterDataAuditAction.REACTIVATE
    else:
        action = MasterDataAuditAction.UPDATE

    MasterDataAuditLog.objects.create(
        masterdata       = instance,
        action           = action,
        actor            = actor,
        category         = instance.category,
        label_before     = prev.get('label'),
        label_after      = instance.label,
        value_before     = prev.get('value'),
        value_after      = instance.value,
        sort_before      = prev.get('sort_order'),
        sort_after       = instance.sort_order,
        is_active_before = prev.get('is_active'),
        is_active_after  = instance.is_active,
        ip_address       = ip,
        user_agent       = ua,
    )
```

Register in `masterdata/apps.py`:

```python
class MasterdataConfig(AppConfig):
    name = 'masterdata'

    def ready(self):
        import masterdata.signals  # noqa: F401
```

---

## 4. Serializers

```python
# masterdata/serializers.py
from rest_framework import serializers
from .models import MasterData


# ── Public read-only serializer (used by existing GET /api/v1/masterdata) ──
class MasterDataOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MasterData
        fields = ["label", "value"]


# ── Admin serializer (used by CRUD endpoints) ──
class MasterDataAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MasterData
        fields = [
            "id", "category", "label", "value",
            "sort_order", "is_active",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class MasterDataCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MasterData
        fields = ["category", "label", "value", "sort_order"]

    def validate(self, attrs):
        # Enforce uniqueness: (category, value) pair
        if MasterData.objects.filter(
            category=attrs['category'],
            value=attrs['value'],
        ).exists():
            raise serializers.ValidationError(
                {"value": "A duplicate value already exists in this category."}
            )
        return attrs

    def to_internal_value(self, data):
        # Auto-normalise value to lowercase if not supplied
        if 'label' in data and 'value' not in data:
            data = dict(data)
            data['value'] = data['label'].strip().lower()
        return super().to_internal_value(data)


class MasterDataUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = MasterData
        fields = ["label", "sort_order", "is_active"]
        # value is intentionally excluded from updates — it would break
        # existing collection records that store the value string
```

---

## 5. Views (DRF ViewSets)

```python
# masterdata/views.py
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework import status

from .models import MasterData, MasterDataCategory
from .serializers import (
    MasterDataOptionSerializer,
    MasterDataAdminSerializer,
    MasterDataCreateSerializer,
    MasterDataUpdateSerializer,
)
from .signals import set_audit_context, clear_audit_context
from .permissions import IsAdminOrManager   # see Section 6


# ── Existing public read endpoint (unchanged) ──────────────────────────────
class MasterDataView(APIView):
    permission_classes = [IsAuthenticated]

    @method_decorator(cache_page(60 * 5))
    def get(self, request):
        qs = MasterData.objects.filter(is_active=True)
        result = {}
        for category in MasterDataCategory.values:
            items = qs.filter(category=category)
            result[category] = MasterDataOptionSerializer(items, many=True).data
        response = Response(result)
        response["Cache-Control"] = "public, max-age=300"
        return response


# ── New admin CRUD viewset ─────────────────────────────────────────────────
class MasterDataAdminViewSet(ModelViewSet):
    """
    Admin CRUD for MasterData items.
    GET    /api/v1/masterdata/admin/?category=...  — list (paginated)
    POST   /api/v1/masterdata/admin/               — create
    PATCH  /api/v1/masterdata/admin/:id/           — partial update
    DELETE /api/v1/masterdata/admin/:id/           — hard delete (admin only)
    """
    permission_classes = [IsAdminOrManager]
    http_method_names  = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        qs = MasterData.objects.all()
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)
        return qs.order_by('sort_order', 'label')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MasterDataCreateSerializer
        if self.request.method == 'PATCH':
            return MasterDataUpdateSerializer
        return MasterDataAdminSerializer

    def _set_context(self, request):
        """Populate audit context with actor info from the request."""
        set_audit_context(
            user       = request.user,
            ip_address = request.META.get('REMOTE_ADDR'),
            user_agent = request.META.get('HTTP_USER_AGENT', ''),
        )

    def create(self, request, *args, **kwargs):
        self._set_context(request)
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            instance = serializer.save(created_by=request.user, updated_by=request.user)
            return Response(
                MasterDataAdminSerializer(instance).data,
                status=status.HTTP_201_CREATED,
            )
        finally:
            clear_audit_context()

    def partial_update(self, request, *args, **kwargs):
        self._set_context(request)
        try:
            instance   = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save(updated_by=request.user)
            return Response(MasterDataAdminSerializer(instance).data)
        finally:
            clear_audit_context()

    def destroy(self, request, *args, **kwargs):
        """Hard delete — restricted to admin role only."""
        if request.user.role != 'admin':
            return Response(
                {'detail': 'Only admins can permanently delete masterdata.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        self._set_context(request)
        try:
            return super().destroy(request, *args, **kwargs)
        finally:
            clear_audit_context()

    def list(self, request, *args, **kwargs):
        """Paginated list — returns { data, total, page, limit }."""
        qs    = self.get_queryset()
        page  = int(request.query_params.get('page',  1))
        limit = int(request.query_params.get('limit', 50))
        total = qs.count()
        start = (page - 1) * limit
        items = qs[start:start + limit]
        return Response({
            'data':  MasterDataAdminSerializer(items, many=True).data,
            'total': total,
            'page':  page,
            'limit': limit,
        })
```

---

## 6. Permissions

```python
# masterdata/permissions.py
from rest_framework.permissions import BasePermission

class IsAdminOrManager(BasePermission):
    """Grants access only to users with role 'admin' or 'manager'."""
    message = "Only admins and managers can manage masterdata."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and getattr(request.user, 'role', None) in ('admin', 'manager')
        )
```

---

## 7. URL Routing

```python
# masterdata/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MasterDataView, MasterDataAdminViewSet

router = DefaultRouter()
router.register(r'masterdata/admin', MasterDataAdminViewSet, basename='masterdata-admin')

urlpatterns = [
    path('masterdata',  MasterDataView.as_view(), name='masterdata-public'),
    path('',            include(router.urls)),
]
```

Include in main `urls.py`:

```python
path('api/v1/', include('masterdata.urls')),
```

### Resulting endpoint table

| Method | URL | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/masterdata` | Authenticated | All active options (cached 5 min) |
| `GET` | `/api/v1/masterdata/admin/?category=...` | Admin/Manager | Paginated list (incl. inactive) |
| `POST` | `/api/v1/masterdata/admin/` | Admin/Manager | Create item |
| `PATCH` | `/api/v1/masterdata/admin/:id/` | Admin/Manager | Update label/sort_order/is_active |
| `DELETE` | `/api/v1/masterdata/admin/:id/` | Admin only | Hard delete |

---

## 8. Admin Registration (Django Admin Panel)

```python
# masterdata/admin.py
from django.contrib import admin
from .models import MasterData, MasterDataAuditLog


@admin.register(MasterData)
class MasterDataAdmin(admin.ModelAdmin):
    list_display   = ["category", "label", "value", "sort_order", "is_active",
                       "created_by", "updated_by", "updated_at"]
    list_filter    = ["category", "is_active"]
    search_fields  = ["label", "value"]
    list_editable  = ["sort_order", "is_active"]
    ordering       = ["category", "sort_order"]
    readonly_fields = ["created_by", "updated_by", "created_at", "updated_at"]


@admin.register(MasterDataAuditLog)
class MasterDataAuditLogAdmin(admin.ModelAdmin):
    list_display  = ["timestamp", "action", "actor", "category",
                      "label_before", "label_after",
                      "is_active_before", "is_active_after", "ip_address"]
    list_filter   = ["action", "category"]
    search_fields = ["actor__email", "label_after", "label_before"]
    readonly_fields = [f.name for f in MasterDataAuditLog._meta.get_fields()]
    ordering      = ["-timestamp"]

    def has_add_permission(self, request):
        return False   # Audit log is read-only even in admin

    def has_change_permission(self, request, obj=None):
        return False   # Audit log is read-only even in admin

    def has_delete_permission(self, request, obj=None):
        return False   # Never delete audit logs
```

---

## 9. What the Audit Log Captures

| Action | Triggered by | Fields recorded |
|---|---|---|
| `create` | POST to admin endpoint | category, label_after, value_after, sort_after, is_active_after, actor, IP, UA |
| `update` | PATCH (label / sort_order) | label_before/after, sort_before/after, is_active_before/after, actor, IP, UA |
| `deactivate` | PATCH with `is_active=false` | is_active_before=true → is_active_after=false, actor, IP, UA |
| `reactivate` | PATCH with `is_active=true` | is_active_before=false → is_active_after=true, actor, IP, UA |
| `delete` (hard) | DELETE (admin only) | uses SET_NULL on masterdata FK — category/label snapshot preserved |

The **frontend sends zero audit fields** — actor is taken from `request.user`, IP from `request.META['REMOTE_ADDR']`, and UA from `request.META['HTTP_USER_AGENT']`.

---

## 10. Deployment Checklist

- [ ] `python manage.py makemigrations masterdata --name add_tracking_fields`
- [ ] `python manage.py makemigrations masterdata --name add_audit_log`
- [ ] `python manage.py migrate`
- [ ] Verify signals fire correctly in Django shell: create/patch a `MasterData` instance and check `MasterDataAuditLog.objects.last()`
- [ ] Smoke-test all 5 endpoints via curl / Postman with admin token
- [ ] Verify `GET /api/v1/masterdata` still returns only `is_active=True` items
- [ ] Verify manager role can list/create/patch but NOT hard-delete
- [ ] Verify admin role can hard-delete

---

## 11. Future Considerations

- **Audit log retention**: Add a periodic Celery task to archive/prune logs older than N months to a cold-storage table or object store
- **Category-level locking**: Add a `locked` flag to prevent any changes to a category (e.g. if a category is used in a regulatory report)
- **Bulk import**: Add a `POST /api/v1/masterdata/admin/import/` endpoint that accepts a CSV — each row is created/updated, all writes still trigger signals
- **Drag-to-reorder**: A `PATCH /api/v1/masterdata/admin/reorder/` endpoint accepting `[{ id, sort_order }]` array would support future drag-and-drop UI
- **Per-category value filtering in forms**: Add a `parent_value` FK to self so varieties can be filtered by selected gemstone type (schema-ready, no data loss)
