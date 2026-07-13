import { getTranslations, setRequestLocale } from "next-intl/server";
import Footer from "@/components/Footer";
import "@/styles/coming-soon.css";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tc = await getTranslations("common");

  return (
    <div className="coming-soon-page">
      <main className="coming-soon-main">
        <span className="badge">{tc("comingSoon")}</span>
        <h1>{tc("siteName")}</h1>
        <p>{t("comingSoonMessage")}</p>
      </main>
      <Footer />
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });

  return {
    title: t("title"),
    description: t("description"),
  };
}
