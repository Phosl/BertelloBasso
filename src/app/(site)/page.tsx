import {HomePageView} from "@/components/pages/HomePageView";
import {localizedMetadata} from "@/lib/i18n/metadata";

export const metadata = localizedMetadata({
  locale: "it",
  route: "home",
  title: "Azienda agricola a San Damiano di Todi",
  description:
    "Olio, vino e piccole produzioni agricole da San Damiano di Todi, nel cuore dell’Umbria.",
});

export default function HomePage() {
  return <HomePageView locale="it" />;
}
