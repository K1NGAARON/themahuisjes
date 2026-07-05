import { getTranslations, setRequestLocale } from "next-intl/server";
import Footer from "@/components/Footer";
import "@/styles/home.css";

export default async function ContactThankYouPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <div className="section banner">
      <div className="row flex-col center">
        <h1>{t("thankYou")}</h1>
      </div>
      <div className="overlay" />
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
  const t = await getTranslations({ locale, namespace: "meta.contactThankYou" });

  return {
    title: t("title"),
    description: t("description"),
  };
}
