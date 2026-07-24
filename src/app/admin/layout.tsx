import type {ReactNode} from "react";
import {AdminDataProvider} from "@/components/admin/AdminDataProvider";
import {AdminFrame} from "@/components/admin/AdminFrame";

export default function AdminLayout({children}: {children: ReactNode}) {
  return (
    <AdminDataProvider>
      <AdminFrame>{children}</AdminFrame>
    </AdminDataProvider>
  );
}
