import {HomePageView} from "@/components/pages/HomePageView";
import {cmsSystemPageMetadata} from "@/lib/cms/metadata";

export function generateMetadata() {
  return cmsSystemPageMetadata("en", "home");
}

export default function EnglishHomePage() {
  return <HomePageView locale="en" />;
}
