import type {ReactNode} from "react";
import {PublicShell} from "@/components/layout/PublicShell";

export default function EnglishSiteLayout({children}: {children: ReactNode}) {
  return <PublicShell locale="en">{children}</PublicShell>;
}
