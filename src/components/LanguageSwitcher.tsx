"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

const localeLabels: Record<Locale, string> = {
  nl: "NL",
  fr: "FR",
  de: "DE",
  en: "EN",
};

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(nextLocale: Locale) {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <nav className="language-switcher notranslate" aria-label="Language">
      {routing.locales.map((code) => (
        <button
          key={code}
          type="button"
          className={`notranslate${code === locale ? " is-active" : ""}`}
          onClick={() => switchLocale(code)}
          aria-current={code === locale ? "true" : undefined}
        >
          {localeLabels[code]}
        </button>
      ))}
    </nav>
  );
}
