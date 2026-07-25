import type {ReactNode} from "react";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {AdminDataProvider} from "@/components/admin/AdminDataProvider";
import {AdminFrame} from "@/components/admin/AdminFrame";
import {requireAdmin} from "@/lib/supabase/server";

export default async function AdminLayout({children}: {children: ReactNode}) {
  const pathname = (await headers()).get("x-admin-path") ?? "/admin";
  const isLogin = pathname === "/admin/accesso";
  const auth = await requireAdmin();

  if (auth.configured && !isLogin && !auth.user) {
    redirect("/admin/accesso");
  }
  if (auth.configured && isLogin && auth.user) {
    redirect("/admin");
  }

  return (
    <AdminDataProvider>
      <AdminFrame>{children}</AdminFrame>
    </AdminDataProvider>
  );
}
