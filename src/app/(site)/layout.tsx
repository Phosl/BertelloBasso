import type {ReactNode} from "react";
import {PublicShell} from "@/components/layout/PublicShell";

export default function SiteLayout({children}: {children: ReactNode}) {
  return <PublicShell locale="it">{children}</PublicShell>;
}
