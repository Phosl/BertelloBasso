import {GalleryEditor} from "@/components/admin/GalleryEditor";

type PageProps = {params: Promise<{id: string}>};

export const metadata = {title: "Gestisci galleria"};

export default async function AdminGalleryEditorPage({params}: PageProps) {
  const {id} = await params;
  return <GalleryEditor galleryId={id} />;
}
