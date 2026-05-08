import { PlayerProvider } from "@/contexts/PlayerContext";
import StereoPlayer from "@/app/components/dashboard/GlobalPlayer";
import Link from "next/link";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <PlayerProvider>
      {children}
      {/* StereoPlayer manages its own fixed positioning — must NOT be inside
          any positioned ancestor or it will anchor to that element, not the viewport */}
      <StereoPlayer />
    </PlayerProvider>
  );
}

// Re-export Link so sub-pages can use the logo anchor if needed
export { Link };
