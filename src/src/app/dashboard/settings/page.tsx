"use client";

import { useState, useEffect } from "react";
import {
  Key,
  Eye,
  EyeOff,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface ApiKeyConfig {
  maskedKeys: Record<string, string | null>;
  configured: Record<string, boolean>;
  preferences: {
    defaultLLM: string;
    defaultImageProvider: string;
    subtitleStyle: string;
  };
}

const API_KEY_FIELDS = [
  {
    key: "openai",
    label: "OpenAI API Key",
    description: "Required for Whisper (audio analysis) and GPT (script generation)",
    placeholder: "sk-...",
    required: true,
  },
  {
    key: "anthropic",
    label: "Anthropic API Key",
    description: "Alternative LLM for script generation (Claude)",
    placeholder: "sk-ant-...",
    required: false,
  },
  {
    key: "perplexity",
    label: "Perplexity API Key",
    description: "For web research and content discovery",
    placeholder: "pplx-...",
    required: false,
  },
  {
    key: "pexels",
    label: "Pexels API Key",
    description: "For free stock photos (get free key at pexels.com/api)",
    placeholder: "",
    required: false,
  },
  {
    key: "segmind",
    label: "Segmind API Key",
    description: "For AI image generation (get credits at segmind.com)",
    placeholder: "",
    required: false,
  },
];

export default function SettingsPage() {
  const [config, setConfig] = useState<ApiKeyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [preferences, setPreferences] = useState({
    defaultLLM: "openai",
    defaultImageProvider: "pexels",
    subtitleStyle: "sentence",
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/user/api-keys");
      const data = await res.json();
      setConfig(data);
      setPreferences(data.preferences || preferences);
    } catch (error) {
      console.error("Failed to fetch config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Only send keys that have been modified
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">
          Configure your API keys and preferences
        </p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-500/20 text-green-400 border border-green-500/50"
              : "bg-red-500/20 text-red-400 border border-red-500/50"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          {message.text}
        </div>
      )}

      {/* API Keys Section */}
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
            <div key={field.key}>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white">
                  {field.label}
                  {field.required && (
                    <span className="text-red-400 ml-1">*</span>
                  )}
                </label>
                {config?.configured[field.key] && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle size={14} />
                    Configured
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-2">{field.description}</p>
              <div className="relative">
                <input
                  type={showKeys[field.key] ? "text" : "password"}
                  value={
                    apiKeys[field.key] !== undefined
                      ? apiKeys[field.key]
                      : config?.configured[field.key]
                        ? config.maskedKeys[field.key] || ""
                        : ""
                  }
                  onChange={(e) =>
                    setApiKeys({ ...apiKeys, [field.key]: e.target.value })
                  }
                  placeholder={
                    config?.configured[field.key]
                      ? "Enter new key to update"
                      : field.placeholder || "Enter API key"
                  }
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowKeys({ ...showKeys, [field.key]: !showKeys[field.key] })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showKeys[field.key] ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Preferences</h2>
        </div>

        <div className="p-4 lg:p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Default LLM Provider
            </label>
            <select
              value={preferences.defaultLLM}
              onChange={(e) =>
                setPreferences({ ...preferences, defaultLLM: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="openai">OpenAI (GPT-4)</option>
              <option value="anthropic">Anthropic (Claude)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Default Image Provider
            </label>
            <select
              value={preferences.defaultImageProvider}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  defaultImageProvider: e.target.value,
                })
              }
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="pexels">Pexels (Stock Photos)</option>
              <option value="segmind">Segmind (AI Generated)</option>
              <option value="prodia">Prodia (Free AI)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Subtitle Style
            </label>
            <select
              value={preferences.subtitleStyle}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  subtitleStyle: e.target.value,
                })
              }
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="sentence">Sentence by Sentence</option>
              <option value="word-by-word">Word by Word (TikTok Style)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold rounded-lg transition-colors"
        >
          {saving ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Save size={20} />
          )}
          Save Settings
        </button>
      </div>
    </div>
  );
}
