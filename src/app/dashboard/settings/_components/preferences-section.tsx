"use client";

import {
  LLM_OPTIONS,
  IMAGE_PROVIDER_OPTIONS,
  SUBTITLE_STYLE_OPTIONS,
} from "@/constants";
import { UserPreferences } from "@/types";

interface SelectFieldProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-white mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface PreferencesSectionProps {
  preferences: UserPreferences;
  onPreferenceChange: (key: keyof UserPreferences, value: string) => void;
}

export function PreferencesSection({
  preferences,
  onPreferenceChange,
}: PreferencesSectionProps) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-4 lg:p-6 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Preferences</h2>
      </div>

      <div className="p-4 lg:p-6 space-y-6">
        <SelectField
          label="Default LLM Provider"
          value={preferences.defaultLLM}
          options={LLM_OPTIONS}
          onChange={(value) => onPreferenceChange("defaultLLM", value)}
        />

        <SelectField
          label="Default Image Provider"
          value={preferences.defaultImageProvider}
          options={IMAGE_PROVIDER_OPTIONS}
          onChange={(value) => onPreferenceChange("defaultImageProvider", value)}
        />

        <SelectField
          label="Subtitle Style"
          value={preferences.subtitleStyle}
          options={SUBTITLE_STYLE_OPTIONS}
          onChange={(value) => onPreferenceChange("subtitleStyle", value)}
        />
      </div>
    </div>
  );
}
