"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function CookieBanner() {
  const t = useTranslations("cookies");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!localStorage.getItem("cookies"));
  }, []);

  function acceptCookies() {
    localStorage.setItem("cookies", "accepted");
    setVisible(false);
  }

  if (!visible) {
    return <div id="overlay" className="hide-cookie-banner" />;
  }

  return (
    <>
      <div className="cookie-banner-wrapper">
        <div className="cookie-banner-content">
          <h4>{t("title")}</h4>
          <p>{t("description")}</p>
          <div className="cookies-buttons">
            <Link id="more-info" href="/legal/cookie-policy">
              {t("moreInfo")}
            </Link>
            <button type="button" id="accept-cookies" onClick={acceptCookies}>
              {t("accept")}
            </button>
          </div>
        </div>
      </div>
      <div id="overlay" />
    </>
  );
}
