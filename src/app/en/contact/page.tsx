import {ContactPageView} from "@/components/pages/ContactPageView";
import {cmsSystemPageMetadata} from "@/lib/cms/metadata";

export function generateMetadata() {
  return cmsSystemPageMetadata("en", "contact");
}

export default function EnglishContactPage() {
  return <ContactPageView locale="en" />;
}
