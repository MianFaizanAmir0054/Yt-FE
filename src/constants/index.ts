// Export all constants from a single entry point
export * from "./status";
export * from "./navigation";
export * from "./api-keys";
export * from "./roles";

// Common animation variants for framer-motion
export const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  item: {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
      },
    },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideIn: {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  },
};

// Aspect ratio options
export const ASPECT_RATIO_OPTIONS = [
  { value: "9:16", label: "9:16", description: "Reels/TikTok" },
  { value: "16:9", label: "16:9", description: "YouTube" },
  { value: "1:1", label: "1:1", description: "Square" },
] as const;

// Project creation idea suggestions
export const IDEA_SUGGESTIONS = [
  "Human rights and their importance in modern society",
  "5 habits of highly successful people",
  "The science behind climate change",
  "Ancient civilizations and their mysteries",
  "Mental health awareness and self-care tips",
  "The future of artificial intelligence",
];

// API URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
