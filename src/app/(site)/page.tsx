import {HomePageView} from "@/components/pages/HomePageView";
import {cmsSystemPageMetadata} from "@/lib/cms/metadata";

export function generateMetadata() {
  return cmsSystemPageMetadata("it", "home");
}

export default function HomePage() {
  return <HomePageView locale="it" />;
}
