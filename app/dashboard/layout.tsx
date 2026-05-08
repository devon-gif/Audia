import { PlayerProvider } from "@/contexts/PlayerContext";
import StereoPlayer from "@/app/components/dashboard/GlobalPlayer";
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
// Note: Next.js layouts may only export `default` plus a small set of route
// metadata exports (metadata, generateMetadata, dynamic, revalidate, etc.).
// Any other named export raises a build error, so don't re-export from here.
