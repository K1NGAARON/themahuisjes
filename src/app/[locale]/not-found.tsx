import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Footer from "@/components/Footer";
import "@/styles/home.css";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="section banner">
      <div className="row flex-col align-start">
        <h1>{t("title")}</h1>
        <Link href="/" className="btn">
          {t("cta")}
        </Link>
      </div>
      <div className="overlay" />
      <Footer />
    </div>
  );
}

export async function generateMetadata() {
  const t = await getTranslations("meta.notFound");

  return {
    title: t("title"),
    description: t("description"),
  };
}
