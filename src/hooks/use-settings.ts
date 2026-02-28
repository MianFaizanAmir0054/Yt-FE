"use client";

import { useState, useCallback, useEffect } from "react";
import { ApiKeyConfig, MessageState, UserPreferences } from "@/types";
import { DEFAULT_PREFERENCES } from "@/constants";
import { useGetApiKeysQuery, useUpdateApiKeysMutation } from "@/lib/store/api/userApi";

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
  const [message, setMessage] = useState<MessageState | null>(null);

  const {
    data: apiKeysData,
    isLoading: isLoadingConfig,
    refetch,
  } = useGetApiKeysQuery();

  const [updateApiKeys, { isLoading: isSaving }] = useUpdateApiKeysMutation();

  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    if (apiKeysData) {
      setConfig(apiKeysData);
      setPreferences(apiKeysData.preferences || DEFAULT_PREFERENCES);
    }
  }, [apiKeysData]);

  const fetchConfig = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleSave = useCallback(async () => {
    setMessage(null);

    try {
      const keysToSave: Record<string, string> = {};
      for (const [key, value] of Object.entries(apiKeys)) {
        if (value !== undefined && value !== "") {
          keysToSave[key] = value;
        }
      }

      await updateApiKeys({
        apiKeys: Object.keys(keysToSave).length > 0 ? keysToSave : undefined,
        preferences,
      }).unwrap();

      setMessage({ type: "success", text: "Settings saved successfully!" });
      setApiKeys({});
      await fetchConfig();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save",
      });
    }
  }, [apiKeys, preferences, updateApiKeys, fetchConfig]);

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
    loading: isLoadingConfig,
    saving: isSaving,
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
