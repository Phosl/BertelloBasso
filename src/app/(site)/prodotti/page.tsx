import {ProductsPageView} from "@/components/pages/ProductsPageView";
import {cmsSystemPageMetadata} from "@/lib/cms/metadata";

export function generateMetadata() {
  return cmsSystemPageMetadata("it", "products");
}

export default function ProductsPage() {
  return <ProductsPageView locale="it" />;
}
