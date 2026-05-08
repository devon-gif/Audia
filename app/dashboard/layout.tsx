import { PlayerProvider } from "@/contexts/PlayerContext";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <PlayerProvider>{children}</PlayerProvider>;
}
