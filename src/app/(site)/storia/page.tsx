import {StoryPageView} from "@/components/pages/StoryPageView";
import {cmsSystemPageMetadata} from "@/lib/cms/metadata";

export function generateMetadata() {
  return cmsSystemPageMetadata("it", "story");
}

export default function StoryPage() {
  return <StoryPageView locale="it" />;
}
