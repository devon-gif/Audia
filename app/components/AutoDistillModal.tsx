"use client";

import { useState } from "react";
import { X, Bell } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (settings: { emailEnabled: boolean; notionEnabled: boolean; summaryLength: "short" | "deep" }) => void;
  onUnsubscribe?: () => void;
}

export default function AutoDistillModal({ isOpen, onClose, onSave, onUnsubscribe }: Props) {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [notionEnabled, setNotionEnabled] = useState(false);
  const [summaryLength, setSummaryLength] = useState<"short" | "deep">("short");

  if (!isOpen) return null;

  const handleSave = () => {
    onSave?.({ emailEnabled, notionEnabled, summaryLength });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[#0A0A0A] border border-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center mb-4">
            <Bell size={20} className="text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Automatic Summaries</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            We&apos;ll automatically summarize new episodes the moment they drop. Choose where to send them.
          </p>
        </div>

        {/* Delivery Methods */}
        <div className="space-y-3 mb-6">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Delivery Methods</p>

          {/* Email row */}
          <div
            className="flex items-center justify-between p-3 border border-gray-800 rounded-xl cursor-pointer hover:border-gray-700 transition-colors select-none"
            onClick={() => setEmailEnabled((v) => !v)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Email Notifications</p>
                <p className="text-xs text-gray-500">Send directly to my inbox.</p>
              </div>
            </div>
            <div className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors shrink-0 ${emailEnabled ? "bg-orange-500" : "bg-gray-700"}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${emailEnabled ? "translate-x-5" : "translate-x-0"}`} />
            </div>
          </div>

          {/* Notion row */}
          <div
            className="flex items-center justify-between p-3 border border-gray-800 rounded-xl cursor-pointer hover:border-gray-700 transition-colors select-none"
            onClick={() => setNotionEnabled((v) => !v)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Sync to Notion</p>
                <p className="text-xs text-gray-500">Push directly to your workspace.</p>
              </div>
            </div>
            <div className={`w-11 h-6 rounded-full flex items-center px-1 transition-colors shrink-0 ${notionEnabled ? "bg-orange-500" : "bg-gray-700"}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notionEnabled ? "translate-x-5" : "translate-x-0"}`} />
            </div>
          </div>
        </div>

        {/* Summary Length */}
        <div className="mb-6">
          <p className="text-sm font-medium text-white mb-3">Summary Length</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSummaryLength("short")}
              className={`p-2.5 rounded-lg border text-sm font-medium transition-colors ${
                summaryLength === "short"
                  ? "border-orange-500 text-orange-500 bg-orange-500/10"
                  : "border-gray-800 text-gray-400 hover:border-gray-600"
              }`}
            >
              Short
            </button>
            <button
              type="button"
              onClick={() => setSummaryLength("deep")}
              className={`p-2.5 rounded-lg border text-sm font-medium transition-colors ${
                summaryLength === "deep"
                  ? "border-orange-500 text-orange-500 bg-orange-500/10"
                  : "border-gray-800 text-gray-400 hover:border-gray-600"
              }`}
            >
              Deep Dive
            </button>
          </div>
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors mb-3 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
        >
          Save Settings
        </button>

        {/* Unsubscribe */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => { onUnsubscribe?.(); onClose(); }}
            className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
          >
            Stop automatic summaries for this show
          </button>
        </div>
      </div>
    </div>
  );
}
