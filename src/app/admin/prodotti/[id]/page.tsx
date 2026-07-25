import {ProductEditor} from "@/components/admin/ProductEditor";

export const metadata = {title: "Modifica prodotto"};

export default async function ProductEditorPage({
  params,
}: {
  params: Promise<{id: string}>;
}) {
  const {id} = await params;
  return <ProductEditor id={id} />;
}
