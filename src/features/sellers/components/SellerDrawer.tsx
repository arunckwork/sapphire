'use client';

import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { SellerFormData, SellerFormErrors } from '../types/seller.types';
import type { User } from '@/features/users';
import { useGemstoneOptions, useQuickAddMasterdata } from '@/features/masterdata';
import { AutocompleteField } from '@/components/shared/forms/AutocompleteField';
import { ImageUploadField } from '@/components/shared/forms/ImageUploadField';
import { getMediaUrl } from '@/utils/media';
import {
  Drawer,
  FormField,
  Input,
  PasswordInput,
  Button,
  AlertBanner,
} from '@/components/shared';

const EMPTY_FORM: SellerFormData = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirm_password: '',
  mobile: '',
  location: '',
  profile_photo: null,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
/** Accepts: +91-9876543210  9876543210  +1 (555) 123-4567  — 7-20 chars */
const MOBILE_RE = /^[+]?[\d\s\-().]{7,20}$/;

function validateField(
  field: keyof SellerFormData,
  value: string | File | null,
  allValues: SellerFormData,
  isEdit: boolean,
): string | undefined {
  const str = typeof value === 'string' ? value : '';
  switch (field) {
    case 'first_name':
      if (!str.trim()) return 'First name is required.';
      if (str.trim().length < 2) return 'At least 2 characters.';
      if (str.trim().length > 50) return 'Max 50 characters.';
      break;
    case 'last_name':
      if (str.trim().length > 50) return 'Max 50 characters.';
      break;
    case 'email':
      if (!str.trim()) return 'Email is required.';
      if (!EMAIL_RE.test(str)) return 'Enter a valid email address.';
      if (str.length > 100) return 'Max 100 characters.';
      break;
    case 'mobile':
      if (!str.trim()) return 'Mobile number is required.';
      if (!MOBILE_RE.test(str.trim())) return 'Enter a valid mobile number (7–20 digits, +, spaces or dashes allowed).';
      break;
    case 'location':
      if (!str.trim()) return 'Location is required.';
      break;
    case 'password':
      if (isEdit) break;
      if (!str) return 'Password is required.';
      if (!PASSWORD_RE.test(str))
        return 'Min 8 chars, 1 uppercase, 1 number, 1 special character.';
      break;
    case 'confirm_password':
      if (isEdit) break;
      if (!str) return 'Please confirm your password.';
      if (str !== allValues.password) return 'Passwords do not match.';
      break;
  }
  return undefined;
}

function validateAll(formData: SellerFormData, isEdit: boolean): SellerFormErrors {
  const errors: SellerFormErrors = {};
  (Object.keys(formData) as Array<keyof SellerFormData>).forEach((field) => {
    if (field === 'profile_photo') return; // photo is optional — no validation
    const err = validateField(field, formData[field] as string, formData, isEdit);
    if (err) errors[field as keyof SellerFormErrors] = err;
  });
  return errors;
}

interface SellerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingSeller: User | null;
  onAdd: (data: SellerFormData) => Promise<boolean>;
  onEdit: (
    id: string,
    data: Pick<SellerFormData, 'first_name' | 'last_name' | 'mobile' | 'location'>,
    photo: { file: File | null; remove: boolean },
  ) => Promise<boolean>;
  isSubmitting: boolean;
}

export function SellerDrawer({
  isOpen,
  onClose,
  onSuccess,
  editingSeller,
  onAdd,
  onEdit,
  isSubmitting,
}: SellerDrawerProps) {
  const isEdit = editingSeller !== null;
  const { options } = useGemstoneOptions();
  const { quickAdd, pendingCategory } = useQuickAddMasterdata();

  const getInitialForm = useCallback((): SellerFormData => {
    if (editingSeller) {
      return {
        first_name: editingSeller.first_name,
        last_name: editingSeller.last_name ?? '',
        email: editingSeller.email,
        password: '',
        confirm_password: '',
        mobile: editingSeller.mobile ?? '',
        location: editingSeller.location ?? '',
        profile_photo: null,
      };
    }
    return { ...EMPTY_FORM };
  }, [editingSeller]);

  const [form, setForm] = useState<SellerFormData>(getInitialForm);
  const [errors, setErrors] = useState<SellerFormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  /** Whether the user has explicitly clicked ✕ to remove the existing photo */
  const [photoRemoved, setPhotoRemoved] = useState(false);

  // Re-initialise when drawer opens or editingSeller changes
  React.useEffect(() => {
    if (isOpen) {
      setForm(getInitialForm());
      setErrors({});
      setApiError(null);
      setPhotoRemoved(false);
    }
  }, [isOpen, getInitialForm]);

  const handleChange = (field: keyof SellerFormData, value: string | File | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof SellerFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof SellerFormData) => {
    if (field === 'profile_photo') return;
    const err = validateField(field, form[field] as string, form, isEdit);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const allErrors = validateAll(form, isEdit);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      toast.error('Please fix the errors before submitting.');
      return;
    }

    let ok = false;
    if (isEdit && editingSeller) {
      ok = await onEdit(
        editingSeller.id,
        {
          first_name: form.first_name,
          last_name: form.last_name,
          mobile: form.mobile,
          location: form.location,
        },
        { file: form.profile_photo, remove: photoRemoved },
      );
    } else {
      ok = await onAdd(form);
    }

    if (ok) {
      onSuccess();
      onClose();
    } else {
      setApiError(null); // toast already shown in mutation hook
    }
  };

  /** Existing photo URL to display in edit mode */
  const existingPhotoUrl =
    isEdit && editingSeller?.profile_photo_url && !photoRemoved
      ? editingSeller.profile_photo_url
      : null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Seller' : 'Add New Seller'}
      description={
        isEdit
          ? `Editing ${editingSeller?.first_name} ${editingSeller?.last_name ?? ''}`
          : 'Fill in the details to create a new seller account.'
      }
      width="max-w-lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="seller-form"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEdit ? 'Save Changes' : 'Create Seller'}
          </Button>
        </>
      }
    >
      {apiError && (
        <AlertBanner variant="error" className="mb-4">
          {apiError}
        </AlertBanner>
      )}

      <form id="seller-form" onSubmit={handleSubmit} className="space-y-4" noValidate>

        {/* ── Profile Photo ─────────────────────────────────────── */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Profile Photo <span className="font-normal normal-case">(optional)</span>
          </p>

          {/* Existing photo in edit mode */}
          {existingPhotoUrl && (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getMediaUrl(existingPhotoUrl)}
                alt="Current profile photo"
                className="h-16 w-16 rounded-full object-cover border border-border/40"
              />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Current photo</p>
                <button
                  type="button"
                  onClick={() => setPhotoRemoved(true)}
                  className="text-[11px] font-medium text-rose-600 hover:text-rose-700 transition-colors"
                >
                  Remove photo
                </button>
              </div>
            </div>
          )}

          {/* New photo upload — shown when no existing photo, or after removal */}
          {!existingPhotoUrl && (
            <ImageUploadField
              files={form.profile_photo ? [form.profile_photo] : []}
              onChange={(files) => handleChange('profile_photo', files[0] ?? null)}
              maxFiles={1}
              label={isEdit ? 'Upload new photo' : 'Profile photo'}
            />
          )}
        </div>

        <div className="border-t border-border/30" />

        {/* ── Name ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First Name" required error={errors.first_name}>
            <Input
              id="seller-first-name"
              value={form.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              onBlur={() => handleBlur('first_name')}
              placeholder="Jane"
              autoComplete="given-name"
            />
          </FormField>
          <FormField label="Last Name" error={errors.last_name}>
            <Input
              id="seller-last-name"
              value={form.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              onBlur={() => handleBlur('last_name')}
              placeholder="Doe"
              autoComplete="family-name"
            />
          </FormField>
        </div>

        {/* ── Email ────────────────────────────────────────────── */}
        <FormField label="Email" required error={errors.email}>
          <Input
            id="seller-email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="jane@example.com"
            autoComplete="email"
            disabled={isEdit}
            className={isEdit ? 'cursor-not-allowed opacity-70' : ''}
          />
        </FormField>

        {/* ── Mobile Number ────────────────────────────────────── */}
        <FormField label="Mobile Number" required error={errors.mobile}>
          <Input
            id="seller-mobile"
            type="tel"
            value={form.mobile}
            onChange={(e) => handleChange('mobile', e.target.value)}
            onBlur={() => handleBlur('mobile')}
            placeholder="+91 98765 43210"
            autoComplete="tel"
          />
        </FormField>

        {/* ── Location ─────────────────────────────────────────── */}
        <AutocompleteField
          id="seller-location"
          label="Location"
          required
          options={options.location_options || []}
          value={form.location}
          onChange={(v) => handleChange('location', v)}
          placeholder="Select or search location…"
          categoryKey="location_options"
          onQuickAdd={quickAdd}
          isAdding={pendingCategory === 'location_options'}
          error={errors.location}
        />

        {/* ── Password — add mode only ──────────────────────────── */}
        {!isEdit && (
          <>
            <div className="border-t border-border/40 pt-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Credentials
              </p>
            </div>
            <FormField label="Password" required error={errors.password}>
              <PasswordInput
                id="seller-password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special"
                autoComplete="new-password"
              />
            </FormField>
            <FormField label="Re-enter Password" required error={errors.confirm_password}>
              <PasswordInput
                id="seller-confirm-password"
                value={form.confirm_password}
                onChange={(e) => handleChange('confirm_password', e.target.value)}
                onBlur={() => handleBlur('confirm_password')}
                placeholder="Must match password above"
                autoComplete="new-password"
              />
            </FormField>
          </>
        )}
      </form>
    </Drawer>
  );
}
