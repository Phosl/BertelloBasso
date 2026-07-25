import {ContactPageView} from "@/components/pages/ContactPageView";
import {cmsSystemPageMetadata} from "@/lib/cms/metadata";

export function generateMetadata() {
  return cmsSystemPageMetadata("it", "contact");
}

export default function ContactPage() {
  return <ContactPageView locale="it" />;
}
