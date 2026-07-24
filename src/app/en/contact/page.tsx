import {ContactPageView} from "@/components/pages/ContactPageView";
import {getMessages} from "@/lib/i18n/messages";
import {localizedMetadata} from "@/lib/i18n/metadata";

const copy = getMessages("en").contact;

export const metadata = localizedMetadata({
  locale: "en",
  route: "contact",
  title: copy.metadataTitle,
  description: copy.metadataDescription,
});

export default function EnglishContactPage() {
  return <ContactPageView locale="en" />;
}
