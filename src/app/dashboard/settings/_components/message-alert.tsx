"use client";

import { CheckCircle, AlertCircle } from "lucide-react";

import { MessageState } from "@/types";

interface MessageAlertProps {
  message: MessageState | null;
}

export function MessageAlert({ message }: MessageAlertProps) {
  if (!message) return null;

  return (
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
  );
}
