import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import HuisjePage from "@/components/HuisjePage";
import { getHuisje, huisjeSlugs, type HuisjeSlug } from "@/data/huisjes";
import { getGalleryImageSrc, getGalleryImages } from "@/lib/gallery";
import "@/styles/huisjes.css";

export function generateStaticParams() {
  return huisjeSlugs.map((slug) => ({ slug }));
}

export default async function HuisjeDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const huisje = getHuisje(slug);

  if (!huisje) {
    notFound();
  }

  setRequestLocale(locale);
  const galleryImages = getGalleryImages(slug as HuisjeSlug);
  const firstImage = galleryImages[0];

  return (
    <>
      {firstImage ? (
        <link
          rel="preload"
          as="image"
          href={getGalleryImageSrc(slug as HuisjeSlug, firstImage.path)}
          fetchPriority="high"
        />
      ) : null}
      <HuisjePage huisje={huisje} galleryImages={galleryImages} />
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const huisje = getHuisje(slug);

  if (!huisje) {
    return {};
  }

  const t = await getTranslations({
    locale,
    namespace: `meta.huisjes.${huisje.slug}`,
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}
