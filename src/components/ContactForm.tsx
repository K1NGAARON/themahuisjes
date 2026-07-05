"use client";

import { useTranslations } from "next-intl";
import { huisjes } from "@/data/huisjes";

export default function ContactForm() {
  const t = useTranslations("contact");

  return (
    <form
      action="https://formspree.io/f/mbjneqdv"
      method="post"
      target="_blank"
    >
      <div className="form-row">
        <input
          type="text"
          name="first-name"
          placeholder={t("firstName")}
          required
        />
        <input
          type="text"
          name="company"
          placeholder={t("lastName")}
          required
        />
      </div>
      <div className="form-row">
        <input type="email" name="email" placeholder={t("email")} required />
        <input type="tel" name="phone" placeholder={t("phone")} required />
      </div>
      {huisjes.map((huisje) => (
        <div className="form-row" key={huisje.slug}>
          <input
            className="checkbox"
            type="checkbox"
            id={huisje.slug}
            name={huisje.slug}
          />
          <label htmlFor={huisje.slug}>{huisje.name}</label>
        </div>
      ))}
      <input type="submit" value={t("submit")} name="subscribe" className="btn" />
    </form>
  );
}
