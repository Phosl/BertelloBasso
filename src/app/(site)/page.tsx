import {FeaturedProducts} from "@/components/sections/FeaturedProducts";
import {HomeHero} from "@/components/sections/HomeHero";
import {HomeStory} from "@/components/sections/HomeStory";
import {getProducts, getSiteCopy} from "@/lib/content/repository";

export default async function HomePage() {
  const [products, copy] = await Promise.all([getProducts(), getSiteCopy()]);

  return (
    <>
      <HomeHero copy={copy} />
      <FeaturedProducts products={products} />
      <HomeStory copy={copy} />
    </>
  );
}
