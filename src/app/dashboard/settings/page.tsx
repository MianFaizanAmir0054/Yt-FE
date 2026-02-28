"use client";

import { useSession } from "@/lib/auth-client";
import { Loader2, Settings, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { useDeleteApiKeyMutation, useDeleteAllApiKeysMutation } from "@/lib/store/api/userApi";
import { ApiKeysSection, MessageAlert, PreferencesSection } from "./_components";

export default function SettingsPage() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [deletingKeys, setDeletingKeys] = useState<Record<string, boolean>>({});

  const [deleteApiKey] = useDeleteApiKeyMutation();
  const [deleteAllApiKeys] = useDeleteAllApiKeysMutation();

  const {
    config,
    loading,
    saving,
    message,
    apiKeys,
    showKeys,
    preferences,
    handleSave,
    setApiKey,
    toggleShowKey,
    setPreference,
    setMessage,
    fetchConfig,
  } = useSettings();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isSessionLoading && !session) {
      router.push("/login");
    }
  }, [session, isSessionLoading, router]);

  const handleDeleteApiKey = async (key: string) => {
    if (!confirm(`Are you sure you want to delete the ${key} API key?`)) {
      return;
    }

    setDeletingKeys((prev) => ({ ...prev, [key]: true }));

    try {
      await deleteApiKey(key).unwrap();
      setMessage({ type: "success", text: `${key} API key deleted successfully` });
      await fetchConfig();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to delete API key",
      });
    } finally {
      setDeletingKeys((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleDeleteAllApiKeys = async () => {
    if (
      !confirm(
        "Are you sure you want to delete ALL API keys? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteAllApiKeys().unwrap();
      setMessage({ type: "success", text: "All API keys deleted successfully" });
      await fetchConfig();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to delete API keys",
      });
    }
  };

  if (!mounted || isSessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <Settings className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your API keys and preferences
            </p>
          </div>
        </div>
        {config && Object.values(config.configured).some((v) => v) && (
          <Button
            onClick={handleDeleteAllApiKeys}
            variant="destructive"
            size="sm"
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete All Keys
          </Button>
        )}
      </div>

      {/* Message Alert */}
      {message && <MessageAlert message={message} />}

      {/* Content */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            {/* API Keys Section */}
            <ApiKeysSection
              config={config}
              apiKeys={apiKeys}
              showKeys={showKeys}
              deletingKeys={deletingKeys}
              onApiKeyChange={setApiKey}
              onToggleShowKey={toggleShowKey}
              onDeleteApiKey={handleDeleteApiKey}
            />

            {/* Preferences Section */}
            <PreferencesSection
              preferences={preferences}
              onPreferenceChange={setPreference}
            />

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
