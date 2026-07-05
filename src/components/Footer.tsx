import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");
  const tc = useTranslations("common");

  return (
    <footer>
      <div className="section footer" id="footer">
        <div className="row">
          <div className="footer-container">
            <Link className="nav-logo" href="/">
              {tc("siteName")}
            </Link>
          </div>
          <div className="footer-container">
            <p className="legal">{t("legal")}</p>
          </div>
        </div>
        <div className="made-by">
          <p>
            {tc("websiteBy")}{" "}
            <a href="https://blitz-media.io" target="_blank" rel="noopener noreferrer">
              Blitz Media
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
