'use client';

import React, { useState, useEffect } from 'react';
import type { MasterDataItem, MasterDataCreateDto, MasterDataUpdateDto } from '../types/masterdata.types';
import { Drawer, FormField, Input, Button, AlertBanner } from '@/components/shared';

/* ── Props ────────────────────────────────────────────────────────────────── */

interface MasterdataItemDrawerProps {
  isOpen:       boolean;
  onClose:      () => void;
  /** If set the drawer is in edit mode; otherwise create mode */
  editingItem?: MasterDataItem | null;
  /** Active category for creating — ignored on edit */
  category:     string;
  onSave:       (dto: MasterDataCreateDto | MasterDataUpdateDto) => Promise<boolean>;
  isSubmitting: boolean;
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function labelToValue(label: string): string {
  return label.toLowerCase().trim().replace(/\s{2,}/g, ' ');
}

interface FormState {
  label:      string;
  value:      string;
  sort_order: string;
}

interface FormErrors {
  label?:      string;
  value?:      string;
  sort_order?: string;
}

function validate(form: FormState, isEdit: boolean): FormErrors {
  const errs: FormErrors = {};
  if (!form.label.trim()) errs.label = 'Label is required.';
  else if (form.label.trim().length < 2) errs.label = 'At least 2 characters.';
  else if (form.label.trim().length > 255) errs.label = 'Max 255 characters.';
  if (!isEdit) {
    if (!form.value.trim()) errs.value = 'Value is required.';
    else if (form.value.trim().length > 255) errs.value = 'Max 255 characters.';
  }
  if (form.sort_order !== '') {
    const n = Number(form.sort_order);
    if (!Number.isInteger(n) || n < 0) errs.sort_order = 'Must be a non-negative integer.';
  }
  return errs;
}

/* ── Component ────────────────────────────────────────────────────────────── */

export function MasterdataItemDrawer({
  isOpen,
  onClose,
  editingItem,
  category,
  onSave,
  isSubmitting,
}: MasterdataItemDrawerProps) {
  const isEdit = !!editingItem;

  const emptyForm: FormState = { label: '', value: '', sort_order: '' };

  const [form,   setForm]   = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  /* Reset form whenever the drawer opens / editing target changes */
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setForm({
          label:      editingItem.label,
          value:      editingItem.value,
          sort_order: String(editingItem.sort_order),
        });
      } else {
        setForm(emptyForm);
      }
      setErrors({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingItem]);

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-fill value from label in create mode
      if (!isEdit && field === 'label') next.value = labelToValue(value);
      return next;
    });
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleSubmit = async () => {
    const errs = validate(form, isEdit);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    let ok: boolean;
    if (isEdit) {
      const dto: MasterDataUpdateDto = {
        label: form.label.trim(),
        ...(form.sort_order !== '' ? { sort_order: Number(form.sort_order) } : {}),
      };
      ok = await onSave(dto);
    } else {
      const dto: MasterDataCreateDto = {
        category:  category as MasterDataCreateDto['category'],
        label:     form.label.trim(),
        value:     form.value.trim(),
        ...(form.sort_order !== '' ? { sort_order: Number(form.sort_order) } : {}),
      };
      ok = await onSave(dto);
    }
    if (ok) onClose();
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Item' : 'Add New Item'}
      description={
        isEdit
          ? `Editing "${editingItem?.label}" in ${category.replace(/_/g, ' ')}`
          : `Add a new option to ${category.replace(/_/g, ' ')}`
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            {isEdit ? 'Save Changes' : 'Add Item'}
          </Button>
        </>
      }
    >
      <div className="space-y-5 py-1">
        {hasErrors && (
          <AlertBanner variant="error" title="Please fix the errors below">
            {Object.values(errors).join(' · ')}
          </AlertBanner>
        )}

        {/* Label */}
        <FormField id="md-label" label="Label" required error={errors.label}>
          <Input
            id="md-label"
            value={form.label}
            onChange={(e) => setField('label', e.target.value)}
            placeholder="e.g. Blue Sapphire"
            autoFocus
          />
        </FormField>

        {/* Value — auto-generated on create; read-only on edit */}
        <FormField
          id="md-value"
          label="Value"
          required={!isEdit}
          error={errors.value}
          helperText={
            isEdit
              ? 'Value cannot be changed — it would break existing collection records.'
              : 'Auto-generated from label. Lowercase, space-separated.'
          }
        >
          <Input
            id="md-value"
            value={form.value}
            onChange={(e) => !isEdit && setField('value', e.target.value)}
            placeholder="e.g. blue sapphire"
            readOnly={isEdit}
            className={isEdit ? 'font-mono opacity-60 cursor-not-allowed select-none' : 'font-mono'}
          />
        </FormField>

        {/* Sort Order */}
        <FormField
          id="md-sort"
          label="Sort Order"
          error={errors.sort_order}
          helperText="Lower numbers appear first. Leave blank to append at the end."
        >
          <Input
            id="md-sort"
            type="number"
            min="0"
            step="1"
            value={form.sort_order}
            onChange={(e) => setField('sort_order', e.target.value)}
            placeholder="e.g. 0"
          />
        </FormField>
      </div>
    </Drawer>
  );
}
