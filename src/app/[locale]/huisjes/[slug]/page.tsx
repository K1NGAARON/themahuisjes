import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import HuisjePage from "@/components/HuisjePage";
import { getHuisje, huisjeSlugs } from "@/data/huisjes";
import "@/styles/home.css";
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

  return <HuisjePage huisje={huisje} />;
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
