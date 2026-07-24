import {StoryPageView} from "@/components/pages/StoryPageView";
import {getMessages} from "@/lib/i18n/messages";
import {localizedMetadata} from "@/lib/i18n/metadata";

const copy = getMessages("en").story;

export const metadata = localizedMetadata({
  locale: "en",
  route: "story",
  title: copy.metadataTitle,
  description: copy.metadataDescription,
});

export default function EnglishStoryPage() {
  return <StoryPageView locale="en" />;
}
