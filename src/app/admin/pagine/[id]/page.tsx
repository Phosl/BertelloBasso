import {PageEditor} from "@/components/admin/PageEditor";

export const metadata = {title: "Modifica pagina"};

export default async function AdminPageEditor({
  params,
}: {
  params: Promise<{id: string}>;
}) {
  const {id} = await params;
  return <PageEditor id={id} />;
}
