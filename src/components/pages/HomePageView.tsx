import {FeaturedProducts} from "@/components/sections/FeaturedProducts";
import {HomeHero} from "@/components/sections/HomeHero";
import {HomeStory} from "@/components/sections/HomeStory";
import {getProducts, getSiteCopy} from "@/lib/content/repository";
import type {Locale} from "@/lib/i18n/config";

export async function HomePageView({locale}: {locale: Locale}) {
  const [products, copy] = await Promise.all([
    getProducts(locale),
    getSiteCopy(locale),
  ]);

  return (
    <>
      <HomeHero copy={copy} locale={locale} />
      <FeaturedProducts locale={locale} products={products} />
      <HomeStory copy={copy} locale={locale} />
    </>
  );
}
