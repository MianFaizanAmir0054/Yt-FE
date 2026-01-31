"use client";

import { useState, useCallback } from "react";
import { ApiKeyConfig, MessageState, UserPreferences } from "@/types";
import { DEFAULT_PREFERENCES } from "@/constants";

interface UseSettingsReturn {
  config: ApiKeyConfig | null;
  loading: boolean;
  saving: boolean;
  message: MessageState | null;
  apiKeys: Record<string, string>;
  showKeys: Record<string, boolean>;
  preferences: UserPreferences;
  fetchConfig: () => Promise<void>;
  handleSave: () => Promise<void>;
  setApiKey: (key: string, value: string) => void;
  toggleShowKey: (key: string) => void;
  setPreference: (key: keyof UserPreferences, value: string) => void;
  setMessage: (message: MessageState | null) => void;
}

export function useSettings(): UseSettingsReturn {
  const [config, setConfig] = useState<ApiKeyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);

  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/user/api-keys");
      const data = await res.json();
      setConfig(data);
      setPreferences(data.preferences || DEFAULT_PREFERENCES);
    } catch (error) {
      console.error("Failed to fetch config:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setMessage(null);

    try {
      const keysToSave: Record<string, string> = {};
      for (const [key, value] of Object.entries(apiKeys)) {
        if (value !== undefined && value !== "") {
          keysToSave[key] = value;
        }
      }

      const res = await fetch("/api/user/api-keys", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKeys: Object.keys(keysToSave).length > 0 ? keysToSave : undefined,
          preferences,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setMessage({ type: "success", text: "Settings saved successfully!" });
      setApiKeys({});
      fetchConfig();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save",
      });
    } finally {
      setSaving(false);
    }
  }, [apiKeys, preferences, fetchConfig]);

  const setApiKey = useCallback((key: string, value: string) => {
    setApiKeys((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleShowKey = useCallback((key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const setPreference = useCallback((key: keyof UserPreferences, value: string) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  }, []);

  return {
    config,
    loading,
    saving,
    message,
    apiKeys,
    showKeys,
    preferences,
    fetchConfig,
    handleSave,
    setApiKey,
    toggleShowKey,
    setPreference,
    setMessage,
  };
}
