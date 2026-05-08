import { PlayerProvider } from "@/contexts/PlayerContext";
import StereoPlayer from "@/app/components/dashboard/GlobalPlayer";
import Link from "next/link";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <PlayerProvider>
      <div className="relative min-h-screen">
        {children}
      </div>
      {/* StereoPlayer floats above all content globally */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] w-full pointer-events-none">
        <div className="pointer-events-auto">
          <StereoPlayer />
        </div>
      </div>
    </PlayerProvider>
  );
}

// Re-export Link so sub-pages can use the logo anchor if needed
export { Link };
