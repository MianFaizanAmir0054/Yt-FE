export interface ApiKeyField {
  key: string;
  label: string;
  description: string;
  placeholder: string;
  required: boolean;
}

export const API_KEY_FIELDS: ApiKeyField[] = [
  {
    key: "openai",
    label: "OpenAI API Key",
    description: "Required for GPT-based script generation",
    placeholder: "sk-...",
    required: true,
  },
  {
    key: "assemblyai",
    label: "AssemblyAI API Key",
    description: "Required for voice transcription and timestamp analysis",
    placeholder: "Enter AssemblyAI key",
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

export const DEFAULT_PREFERENCES = {
  defaultLLM: "openai",
  defaultImageProvider: "pexels",
  subtitleStyle: "sentence",
};

export const LLM_OPTIONS = [
  { value: "openai", label: "OpenAI (GPT-4)" },
  { value: "anthropic", label: "Anthropic (Claude)" },
];

export const IMAGE_PROVIDER_OPTIONS = [
  { value: "pexels", label: "Pexels (Stock Photos)" },
  { value: "segmind", label: "Segmind (AI Generated)" },
  { value: "prodia", label: "Prodia (Free AI)" },
];

export const SUBTITLE_STYLE_OPTIONS = [
  { value: "sentence", label: "Sentence by Sentence" },
  { value: "word-by-word", label: "Word by Word (TikTok Style)" },
];
