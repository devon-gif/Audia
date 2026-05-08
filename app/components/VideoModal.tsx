"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface VideoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Full YouTube embed URL — e.g. https://www.youtube.com/embed/VIDEO_ID?autoplay=1 */
  videoUrl?: string;
}

const PLACEHOLDER_VIDEO =
  "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0&modestbranding=1";

export default function VideoModal({
  open,
  onOpenChange,
  videoUrl = PLACEHOLDER_VIDEO,
}: VideoModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal forceMount>
        <AnimatePresence>
          {open && (
            <>
              {/* Backdrop */}
              <Dialog.Overlay asChild>
                <motion.div
                  key="overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
                />
              </Dialog.Overlay>

              {/* Modal panel */}
              <Dialog.Content asChild>
                <motion.div
                  key="content"
                  initial={{ opacity: 0, scale: 0.93, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.93, y: 16 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="fixed inset-0 z-[101] flex items-center justify-center p-4 md:p-8"
                >
                  <div className="relative w-full max-w-4xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.7)]">

                    {/* Close button */}
                    <Dialog.Close asChild>
                      <button
                        className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/20 transition-all"
                        aria-label="Close video"
                      >
                        <X size={16} />
                      </button>
                    </Dialog.Close>

                    {/* Header strip */}
                    <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#FF6600]" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-400">
                        Audia — How It Works
                      </span>
                    </div>

                    {/* 16:9 video embed */}
                    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                      <iframe
                        key={videoUrl}
                        src={videoUrl}
                        title="Audia explainer"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    </div>

                    {/* Footer strip */}
                    <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between">
                      <p className="text-xs text-zinc-600">
                        From RSS feed to audio brief in under 3 minutes.
                      </p>
                      <span className="text-[10px] text-[#FF6600]/60 font-mono uppercase tracking-widest">
                        audia.ai
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
