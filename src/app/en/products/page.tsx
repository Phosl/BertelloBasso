import {ProductsPageView} from "@/components/pages/ProductsPageView";
import {getMessages} from "@/lib/i18n/messages";
import {localizedMetadata} from "@/lib/i18n/metadata";

const copy = getMessages("en").products;

export const metadata = localizedMetadata({
  locale: "en",
  route: "products",
  title: copy.metadataTitle,
  description: copy.metadataDescription,
});

export default function EnglishProductsPage() {
  return <ProductsPageView locale="en" />;
}
