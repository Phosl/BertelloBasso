import {PhotographyPageView} from "@/components/pages/PhotographyPageView";
import {cmsSystemPageMetadata} from "@/lib/cms/metadata";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return cmsSystemPageMetadata("en", "photography");
}

export default function EnglishPhotographyPage() {
  return <PhotographyPageView locale="en" />;
}
