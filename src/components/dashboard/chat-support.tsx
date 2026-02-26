"use client";

import { useState } from "react";
import { X, MessageCircle } from "lucide-react";

export function ChatSupport() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-lg border border-border-light px-5 py-3 flex items-center gap-3 animate-in slide-in-from-bottom-2">
          <span className="text-sm text-text-primary">何かお困りごとはありませんか？</span>
          <button
            onClick={() => setIsOpen(false)}
            className="text-text-tertiary hover:text-text-secondary transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-accent rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity shrink-0"
      >
        <MessageCircle size={24} className="text-white" />
      </button>
    </div>
  );
}
