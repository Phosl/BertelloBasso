import {StoryPageView} from "@/components/pages/StoryPageView";
import {cmsSystemPageMetadata} from "@/lib/cms/metadata";

export function generateMetadata() {
  return cmsSystemPageMetadata("en", "story");
}

export default function EnglishStoryPage() {
  return <StoryPageView locale="en" />;
}
