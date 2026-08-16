'use client';

import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { UserFormData, UserFormErrors, User } from '../types/user.types';
import { ROLES } from '@/constants/roles';
import {
  Drawer,
  FormField,
  Input,
  PasswordInput,
  Select,
  Button,
  AlertBanner,
} from '@/components/shared';

const EMPTY_FORM: UserFormData = {
  first_name: '',
  last_name: '',
  email: '',
  role: '',
  password: '',
  confirm_password: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

function validateField(
  field: keyof UserFormData,
  value: string,
  allValues: UserFormData,
  isEdit: boolean,
): string | undefined {
  switch (field) {
    case 'first_name':
      if (!value.trim()) return 'First name is required.';
      if (value.trim().length < 2) return 'At least 2 characters.';
      if (value.trim().length > 50) return 'Max 50 characters.';
      break;
    case 'last_name':
      if (value.trim().length > 50) return 'Max 50 characters.';
      break;
    case 'email':
      if (!value.trim()) return 'Email is required.';
      if (!EMAIL_RE.test(value)) return 'Enter a valid email address.';
      if (value.length > 100) return 'Max 100 characters.';
      break;
    case 'role':
      if (!value) return 'Role is required.';
      break;
    case 'password':
      if (isEdit) break;
      if (!value) return 'Password is required.';
      if (!PASSWORD_RE.test(value))
        return 'Min 8 chars, 1 uppercase, 1 number, 1 special character.';
      break;
    case 'confirm_password':
      if (isEdit) break;
      if (!value) return 'Please confirm your password.';
      if (value !== allValues.password) return 'Passwords do not match.';
      break;
  }
  return undefined;
}

function validateAll(formData: UserFormData, isEdit: boolean): UserFormErrors {
  const errors: UserFormErrors = {};
  (Object.keys(formData) as Array<keyof UserFormData>).forEach((field) => {
    const err = validateField(field, formData[field], formData, isEdit);
    if (err) errors[field] = err;
  });
  return errors;
}

interface UserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingUser: User | null;
  onAdd: (data: UserFormData) => Promise<boolean>;
  onEdit: (id: string, data: Pick<UserFormData, 'first_name' | 'last_name' | 'role'>) => Promise<boolean>;
  isSubmitting: boolean;
}

const ROLE_OPTIONS = [
  { value: ROLES.ADMIN, label: 'Admin' },
  { value: ROLES.MANAGER, label: 'Manager' },
  { value: ROLES.USER, label: 'User' },
];

export function UserDrawer({
  isOpen,
  onClose,
  onSuccess,
  editingUser,
  onAdd,
  onEdit,
  isSubmitting,
}: UserDrawerProps) {
  const isEdit = editingUser !== null;

  const getInitialForm = useCallback((): UserFormData => {
    if (editingUser) {
      return {
        first_name: editingUser.first_name,
        last_name: editingUser.last_name ?? '',
        email: editingUser.email,
        role: editingUser.role,
        password: '',
        confirm_password: '',
      };
    }
    return { ...EMPTY_FORM };
  }, [editingUser]);

  const [form, setForm] = useState<UserFormData>(getInitialForm);
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);

  // Re-initialise when drawer opens or editingUser changes
  React.useEffect(() => {
    if (isOpen) {
      setForm(getInitialForm());
      setErrors({});
      setApiError(null);
    }
  }, [isOpen, getInitialForm]);

  const handleChange = (field: keyof UserFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error on keystroke
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleBlur = (field: keyof UserFormData) => {
    const err = validateField(field, form[field], form, isEdit);
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
    if (isEdit && editingUser) {
      ok = await onEdit(editingUser.id, {
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role,
      });
    } else {
      ok = await onAdd(form);
    }

    if (ok) {
      onSuccess();
      onClose();
    } else {
      // If it's a duplicate email conflict show inline error
      setApiError(null); // toast already shown in mutation hook
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit User' : 'Add New User'}
      description={
        isEdit
          ? `Editing ${editingUser?.first_name} ${editingUser?.last_name ?? ''}`
          : 'Fill in the details to create a new system user.'
      }
      width="max-w-lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="user-form"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEdit ? 'Save Changes' : 'Create User'}
          </Button>
        </>
      }
    >
      {apiError && (
        <AlertBanner variant="error" className="mb-4">
          {apiError}
        </AlertBanner>
      )}

      <form id="user-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* First Name + Last Name */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="First Name" required error={errors.first_name}>
            <Input
              id="user-first-name"
              value={form.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              onBlur={() => handleBlur('first_name')}
              placeholder="Jane"
              autoComplete="given-name"
            />
          </FormField>
          <FormField label="Last Name" error={errors.last_name}>
            <Input
              id="user-last-name"
              value={form.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              onBlur={() => handleBlur('last_name')}
              placeholder="Doe"
              autoComplete="family-name"
            />
          </FormField>
        </div>

        {/* Email */}
        <FormField label="Email" required error={errors.email}>
          <Input
            id="user-email"
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

        {/* Role */}
        <FormField label="Role" required error={errors.role}>
          <Select
            id="user-role"
            value={form.role}
            onChange={(e) => handleChange('role', e.target.value)}
            onBlur={() => handleBlur('role')}
          >
            <option value="" disabled>Select a role</option>
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </FormField>

        {/* Password fields — add mode only */}
        {!isEdit && (
          <>
            <div className="border-t border-border/40 pt-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Credentials
              </p>
            </div>
            <FormField label="Password" required error={errors.password}>
              <PasswordInput
                id="user-password"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special"
                autoComplete="new-password"
              />
            </FormField>
            <FormField label="Re-enter Password" required error={errors.confirm_password}>
              <PasswordInput
                id="user-confirm-password"
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
