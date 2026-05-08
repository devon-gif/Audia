import { PlayerProvider } from "@/contexts/PlayerContext";
import StereoPlayer from "@/app/components/dashboard/GlobalPlayer";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <PlayerProvider>
      {children}
      <StereoPlayer />
    </PlayerProvider>
  );
}
