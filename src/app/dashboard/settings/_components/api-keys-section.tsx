"use client";

import { Key, Eye, EyeOff, CheckCircle } from "lucide-react";

import { API_KEY_FIELDS, ApiKeyField } from "@/constants";
import { ApiKeyConfig } from "@/types";

interface ApiKeyInputProps {
  field: ApiKeyField;
  value: string;
  showKey: boolean;
  isConfigured: boolean;
  maskedKey: string | null;
  onChange: (value: string) => void;
  onToggleShow: () => void;
}

function ApiKeyInput({
  field,
  value,
  showKey,
  isConfigured,
  maskedKey,
  onChange,
  onToggleShow,
}: ApiKeyInputProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-white">
          {field.label}
          {field.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        {isConfigured && (
          <span className="flex items-center gap-1 text-xs text-green-400">
            <CheckCircle size={14} />
            Configured
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400 mb-2">{field.description}</p>
      <div className="relative">
        <input
          type={showKey ? "text" : "password"}
          value={value !== undefined ? value : isConfigured ? maskedKey || "" : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            isConfigured
              ? "Enter new key to update"
              : field.placeholder || "Enter API key"
          }
          className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
        >
          {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
}

interface ApiKeysSectionProps {
  config: ApiKeyConfig | null;
  apiKeys: Record<string, string>;
  showKeys: Record<string, boolean>;
  onApiKeyChange: (key: string, value: string) => void;
  onToggleShowKey: (key: string) => void;
}

export function ApiKeysSection({
  config,
  apiKeys,
  showKeys,
  onApiKeyChange,
  onToggleShowKey,
}: ApiKeysSectionProps) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="p-4 lg:p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Key className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">API Keys</h2>
            <p className="text-sm text-gray-400">
              Your API keys are encrypted and stored securely
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-6">
        {API_KEY_FIELDS.map((field) => (
          <ApiKeyInput
            key={field.key}
            field={field}
            value={apiKeys[field.key] || ""}
            showKey={showKeys[field.key] || false}
            isConfigured={config?.configured[field.key] || false}
            maskedKey={config?.maskedKeys[field.key] || null}
            onChange={(value) => onApiKeyChange(field.key, value)}
            onToggleShow={() => onToggleShowKey(field.key)}
          />
        ))}
      </div>
    </div>
  );
}
