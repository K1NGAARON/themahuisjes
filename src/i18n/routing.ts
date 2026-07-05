import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["nl", "fr", "de", "en"],
  defaultLocale: "nl",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
