'use client';

import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { Button, FormField, Select, Checkbox, Card } from '@/components/shared';
import { WEIGHT_UNITS, ORIGIN_OPTIONS } from '@/features/collection';

export function SettingsForm() {
  const { settings, isSaving, updateSettings } = useSettings();
  const [formData, setFormData] = useState(settings);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formData);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Appearance & Interface */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
            Appearance & Defaults
          </h3>

          <FormField label="Theme Mode">
            <Select
              value={formData.theme}
              onChange={(e) => setFormData((prev) => ({ ...prev, theme: e.target.value as any }))}
              options={[
                { label: 'Dark Mode (Recommended)', value: 'dark' },
                { label: 'Light Mode', value: 'light' },
                { label: 'System Default', value: 'system' },
              ]}
            />
          </FormField>

          <FormField label="Default Gemstone Origin">
            <Select
              value={formData.defaultOrigin}
              onChange={(e) => setFormData((prev) => ({ ...prev, defaultOrigin: e.target.value }))}
              options={ORIGIN_OPTIONS.map((o) => ({ label: o, value: o }))}
            />
          </FormField>

          <FormField label="Default Weight Unit">
            <Select
              value={formData.defaultWeightUnit}
              onChange={(e) => setFormData((prev) => ({ ...prev, defaultWeightUnit: e.target.value as any }))}
              options={WEIGHT_UNITS.map((u) => ({ label: u.toUpperCase(), value: u }))}
            />
          </FormField>
        </Card>

        {/* Notifications & Security */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
            Notifications & Alerts
          </h3>

          <Checkbox
            label="Email Notifications"
            description="Receive email updates when gemstones are added or modified."
            checked={formData.emailNotifications}
            onChange={(e) => setFormData((prev) => ({ ...prev, emailNotifications: e.target.checked }))}
          />

          <Checkbox
            label="Security Alerts"
            description="Receive instant alerts on sensitive actions and login events."
            checked={formData.securityAlerts}
            onChange={(e) => setFormData((prev) => ({ ...prev, securityAlerts: e.target.checked }))}
          />
        </Card>

        <div className="flex justify-end">
          <Button type="submit" isLoading={isSaving} variant="primary">
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}
