import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import Footer from "@/components/Footer";
import { comingSoonHuisjes, huisjes } from "@/data/huisjes";
import "@/styles/home.css";

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
    <div className="section banner">
      <AnimateOnScroll className="row flex-col center">
        <h1>
          {t("welcome")}
          <br />
          <span className="focus-heading">{t("focusHeading")}</span>
        </h1>
        <div className="projects-wrapper">
          {huisjes.map((huisje) => (
            <div key={huisje.slug} className={`item ${huisje.themeClass}`}>
              <img
                src={`/huisjes/${huisje.slug}/img/banner.jpg`}
                alt={huisje.name}
              />
              <div className="content">
                <p className="city">{huisje.city}</p>
                <h3>{huisje.name}</h3>
                <Link href={`/huisjes/${huisje.slug}`}>{tc("moreInfo")}</Link>
              </div>
              <div className="overlay" />
            </div>
          ))}
          {comingSoonHuisjes.map((huisje) => (
            <div key={huisje.slug} className="item coming-soon">
              <img src={huisje.frontImage} alt={huisje.name} />
              <div className="coming-soon-content">
                {huisje.city ? <p className="city">{huisje.city}</p> : null}
                <h3>{huisje.name}</h3>
                <span className="badge">{tc("comingSoon")}</span>
              </div>
              <div className="coming-soon-overlay" />
            </div>
          ))}
          <div className="item large" />
        </div>
      </AnimateOnScroll>
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
