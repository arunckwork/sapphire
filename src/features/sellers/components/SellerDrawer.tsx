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
  Button,
  AlertBanner,
} from '@/components/shared';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
/** Accepts: +91-9876543210  9876543210  +1 (555) 123-4567  — 7-20 chars */
const MOBILE_RE = /^[+]?[\d\s\-().]{7,20}$/;

/**
 * Generates a cryptographically strong, random unique password that satisfies
 * PASSWORD_RE (at least 8 chars, 1 uppercase, 1 number, 1 special character).
 */
function generateSecureSellerPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%^&*()_+-=[]{}';
  const allChars = upper + lower + digits + symbols;

  const getRandomChar = (charset: string) => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const arr = new Uint32Array(1);
      window.crypto.getRandomValues(arr);
      return charset[arr[0] % charset.length];
    }
    return charset[Math.floor(Math.random() * charset.length)];
  };

  // Ensure at least one character from each required set
  const chars = [
    getRandomChar(upper),
    getRandomChar(lower),
    getRandomChar(digits),
    getRandomChar(symbols),
  ];

  // Fill up to 16 characters for extra entropy
  for (let i = chars.length; i < 16; i++) {
    chars.push(getRandomChar(allChars));
  }

  // Shuffle array using Fisher-Yates
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  const result = chars.join('');
  if (PASSWORD_RE.test(result)) {
    return result;
  }
  return `Sel${Date.now()}!Aa1`;
}

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

function validateField(
  field: keyof SellerFormData,
  value: string | File | null,
  _allValues: SellerFormData,
  _isEdit: boolean,
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
    case 'confirm_password':
      // Credentials are auto-populated in the background and hidden from UI
      break;
  }
  return undefined;
}

function validateAll(formData: SellerFormData, isEdit: boolean): SellerFormErrors {
  const errors: SellerFormErrors = {};
  (Object.keys(formData) as Array<keyof SellerFormData>).forEach((field) => {
    if (field === 'profile_photo' || field === 'password' || field === 'confirm_password') return;
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
    const autoPassword = generateSecureSellerPassword();
    return {
      ...EMPTY_FORM,
      password: autoPassword,
      confirm_password: autoPassword,
    };
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
    if (field === 'profile_photo' || field === 'password' || field === 'confirm_password') return;
    const err = validateField(field, form[field] as string, form, isEdit);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    // Safeguard: Ensure random unique credentials exist when adding a new seller
    let submitForm = { ...form };
    if (!isEdit) {
      if (!submitForm.password || !PASSWORD_RE.test(submitForm.password)) {
        const autoPass = generateSecureSellerPassword();
        submitForm.password = autoPass;
        submitForm.confirm_password = autoPass;
      } else if (!submitForm.confirm_password || submitForm.confirm_password !== submitForm.password) {
        submitForm.confirm_password = submitForm.password;
      }
    }

    const allErrors = validateAll(submitForm, isEdit);
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
          first_name: submitForm.first_name,
          last_name: submitForm.last_name,
          mobile: submitForm.mobile,
          location: submitForm.location,
        },
        { file: submitForm.profile_photo, remove: photoRemoved },
      );
    } else {
      ok = await onAdd(submitForm);
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
                className="h-16 w-16 rounded-full object-cover border border-border"
              />
              <button
                type="button"
                onClick={() => setPhotoRemoved(true)}
                className="text-xs text-rose-500 hover:text-rose-600 underline"
              >
                Remove photo
              </button>
            </div>
          )}

          {/* Upload / camera capture */}
          {(!existingPhotoUrl || photoRemoved) && (
            <ImageUploadField
              files={form.profile_photo ? [form.profile_photo] : []}
              onChange={(files) => handleChange('profile_photo', files[0] ?? null)}
              maxFiles={1}
              label="Profile Photo"
            />
          )}
        </div>

        {/* ── Name Fields ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First Name" required error={errors.first_name}>
            <Input
              id="seller-first-name"
              value={form.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              onBlur={() => handleBlur('first_name')}
              placeholder="Kasun"
              autoComplete="given-name"
            />
          </FormField>

          <FormField label="Last Name" error={errors.last_name}>
            <Input
              id="seller-last-name"
              value={form.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              onBlur={() => handleBlur('last_name')}
              placeholder="Perera (optional)"
              autoComplete="family-name"
            />
          </FormField>
        </div>

        {/* ── Email ─────────────────────────────────────────────── */}
        <FormField
          label="Email Address"
          required
          error={errors.email}
          helperText={isEdit ? 'Email cannot be changed after creation.' : undefined}
        >
          <Input
            id="seller-email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="seller@example.com"
            disabled={isEdit}
            autoComplete="email"
          />
        </FormField>

        {/* ── Mobile ────────────────────────────────────────────── */}
        <FormField
          label="Mobile Number"
          required
          error={errors.mobile}
          helperText="With or without country code (e.g. +91 98765 43210 or 0771234567)"
        >
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
      </form>
    </Drawer>
  );
}
