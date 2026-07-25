import {PhotographyPageView} from "@/components/pages/PhotographyPageView";
import {getMessages} from "@/lib/i18n/messages";
import {localizedMetadata} from "@/lib/i18n/metadata";

const copy = getMessages("it").photography;

export const dynamic = "force-dynamic";

export const metadata = localizedMetadata({
  locale: "it",
  route: "photography",
  title: copy.metadataTitle,
  description: copy.metadataDescription,
});

export default function PhotographyPage() {
  return <PhotographyPageView locale="it" />;
}
