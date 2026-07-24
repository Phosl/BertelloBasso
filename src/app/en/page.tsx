import {HomePageView} from "@/components/pages/HomePageView";
import {localizedMetadata} from "@/lib/i18n/metadata";

export const metadata = localizedMetadata({
  locale: "en",
  route: "home",
  title: "Family farm in San Damiano di Todi",
  description:
    "Olive oil, wine and small-batch farm products from San Damiano di Todi, in the heart of Umbria.",
});

export default function EnglishHomePage() {
  return <HomePageView locale="en" />;
}
