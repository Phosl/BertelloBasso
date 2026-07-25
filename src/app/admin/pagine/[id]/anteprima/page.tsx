import {notFound} from "next/navigation";
import {PageRenderer} from "@/components/cms/PageRenderer";
import {mapCmsPage} from "@/lib/cms/mapper";
import {getServerSupabase} from "@/lib/supabase/server";

export const metadata = {title: "Anteprima pagina"};

export default async function AdminPagePreview({
  params,
}: {
  params: Promise<{id: string}>;
}) {
  const {id} = await params;
  const client = await getServerSupabase();
  if (!client) notFound();
  const {data} = await client
    .from("cms_pages")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const page = mapCmsPage(data as Record<string, unknown>);
  return <PageRenderer locale="it" page={page} preview snapshot={page.draft} />;
}
