import { getTranslations, setRequestLocale } from "next-intl/server";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import ContactForm from "@/components/ContactForm";
import "@/styles/contact.css";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <div className="section banner contact">
      <AnimateOnScroll className="row">
        <div className="col">
          <h1>{t("title")}</h1>
          <p className="contact-note">{t("note")}</p>
        </div>
        <div className="col">
          <div className="form-wrapper">
            <ContactForm />
          </div>
        </div>
      </AnimateOnScroll>
      <div className="overlay" />
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.contact" });

  return {
    title: t("title"),
    description: t("description"),
  };
}
