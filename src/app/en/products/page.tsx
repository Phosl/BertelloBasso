import {ProductsPageView} from "@/components/pages/ProductsPageView";
import {cmsSystemPageMetadata} from "@/lib/cms/metadata";

export function generateMetadata() {
  return cmsSystemPageMetadata("en", "products");
}

export default function EnglishProductsPage() {
  return <ProductsPageView locale="en" />;
}
