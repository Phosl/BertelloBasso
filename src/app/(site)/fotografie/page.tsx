import {PhotographyPageView} from "@/components/pages/PhotographyPageView";
import {cmsSystemPageMetadata} from "@/lib/cms/metadata";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return cmsSystemPageMetadata("it", "photography");
}

export default function PhotographyPage() {
  return <PhotographyPageView locale="it" />;
}
