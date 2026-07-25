import {AdminLogin} from "@/components/admin/AdminLogin";

export const metadata = {title: "Accesso admin"};

type AdminAccessPageProps = {
  searchParams: Promise<{reason?: string | string[]}>;
};

export default async function AdminAccessPage({
  searchParams,
}: AdminAccessPageProps) {
  const params = await searchParams;
  const reason = Array.isArray(params.reason) ? params.reason[0] : params.reason;
  return <AdminLogin reason={reason} />;
}
