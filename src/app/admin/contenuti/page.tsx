import {redirect} from "next/navigation";

export const metadata = {title: "Contenuti admin"};

export default function AdminContentPage() {
  redirect("/admin/pagine");
}
