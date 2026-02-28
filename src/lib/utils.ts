import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function buildFileUrl(filePath: string, baseDir: "uploads" | "outputs") {
  const normalized = filePath.replace(/\\/g, "/");
  const marker = `/${baseDir}/`;
  const markerIndex = normalized.lastIndexOf(marker);
  const relative = markerIndex >= 0
    ? normalized.slice(markerIndex + marker.length)
    : normalized;
  const encoded = relative.split("/").map(encodeURIComponent).join("/");
  return `${API_URL}/api/files/${baseDir}/${encoded}`;
}

export function buildUploadsUrl(filePath?: string) {
  if (!filePath) return "";
  return buildFileUrl(filePath, "uploads");
}

export function buildOutputsUrl(filePath?: string) {
  if (!filePath) return "";
  return buildFileUrl(filePath, "outputs");
}
