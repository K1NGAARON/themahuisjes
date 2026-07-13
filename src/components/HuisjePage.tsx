import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { HuisjeFacts, HuisjeSlug } from "@/data/huisjes";
import type { GalleryImage } from "@/lib/gallery";
import GalleryCarousel from "@/components/GalleryCarousel";
import ScrollBackground from "@/components/ScrollBackground";

function BoolIcon({ value }: { value: boolean }) {
  return (
    <div className="checkbox">
      <i className={`fa-solid ${value ? "fa-check true" : "fa-x false"}`} />
    </div>
  );
}

export default function HuisjePage({
  huisje,
  galleryImages,
}: {
  huisje: HuisjeFacts;
  galleryImages: GalleryImage[];
}) {
  const t = useTranslations("huisjes");
  const slug = huisje.slug as HuisjeSlug;
  const story = t.raw(`${slug}.story`) as string[];
  const tips = t.raw(`${slug}.tips`) as string[];
  const rules = t.raw("rules.items") as string[];

  return (
    <>
      <ScrollBackground />
      <div className="container first-container">
        <div className="content">
          <div className="item" />
          <div className="item bg">
            <p className="city">{huisje.city}</p>
            <h1 className="notranslate">{huisje.name}</h1>
            <nav className="navbar">
              <a href="#beeldmateriaal">{t("nav.gallery")}</a>
              <a href="#info">{t("nav.info")}</a>
              <a href="#verhaal">{t("nav.story")}</a>
              <a href="#tips">{t("nav.tips")}</a>
              <a href="#locatie">{t("nav.location")}</a>
              <a href="#regels">{t("nav.rules")}</a>
              <Link href="/contact">{t("nav.contact")}</Link>
            </nav>
          </div>
        </div>

        <div className="content" id="info">
          <div className="item justify-end">
            <h2>{t("nav.info")}</h2>
          </div>
          <div className="item">
            <div className="wrapper info-wrapper">
              <div className="item">
                <div className="icon">
                  <i className="fa-solid fa-bed" />
                </div>
                <div className="info-value">
                  <p>{huisje.beds}</p>
                </div>
              </div>
              <div className="item">
                <div className="icon">
                  <img src="/assets/icons/bed.png" alt={t("info.bedLinen")} />
                </div>
                <BoolIcon value={true} />
              </div>
              <div className="item">
                <div className="icon">
                  <img src="/assets/icons/bad.png" alt={t("info.bathLinen")} />
                </div>
                <BoolIcon value={true} />
              </div>
              <div className="item">
                <div className="icon">
                  <i className="fa-solid fa-bicycle" />
                </div>
                <BoolIcon value={huisje.bicycle} />
              </div>
              <div className="item">
                <div className="icon">
                  <i className="fa-solid fa-car" />
                </div>
                <div className="item-col">
                  <p>{t("info.garage")}</p>
                  <p>{t("info.streetParking")}</p>
                  <p>{t("info.neighborhoodParking")}</p>
                </div>
                <div className="checkbox item-col">
                  <i
                    className={`fa-solid ${huisje.garage ? "fa-check true" : "fa-x false"}`}
                  />
                  <i
                    className={`fa-solid ${huisje.streetParking ? "fa-check true" : "fa-x false"}`}
                  />
                  <i
                    className={`fa-solid ${huisje.neighborhoodParking ? "fa-check true" : "fa-x false"}`}
                  />
                </div>
              </div>
              <div className="item">
                <div className="icon">
                  <i className="fa-solid fa-wifi" />
                </div>
                <BoolIcon value={huisje.wifi} />
              </div>
            </div>
          </div>
        </div>

        <div className="content height-fit-content" id="verhaal">
          <div className="item">
            {story.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
          <div className="item align-end justify-end">
            <h2>{t("nav.story")}</h2>
          </div>
        </div>

        <div className="content pd-0 height-fit-content" id="beeldmateriaal">
          <GalleryCarousel slug={slug} images={galleryImages} />
        </div>

        <div className="content height-fit-content" id="tips">
          <div className="item justify-end">
            <h2>{t("nav.tips")}</h2>
          </div>
          <div className="item text-list">
            <ol>
              {tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="content height-fit-content" id="locatie">
          <div className="item text-list">
            <p className="notranslate">
              {t("location.address", {
                street: huisje.addressStreet,
                locality: huisje.addressLocality,
              })}
            </p>
          </div>
          <div className="item align-end justify-end">
            <h2>{t("nav.location")}</h2>
          </div>
        </div>

        <div className="content height-fit-content" id="regels">
          <div className="item text-list">
            <p>
              <strong>{t("rules.generalTitle")}</strong>
              <br />
              {t("rules.generalText")}
            </p>
            <p>
              <strong>{t("rules.agreementsTitle")}</strong>
            </p>
            <ol>
              {rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ol>
          </div>
          <div className="item align-end justify-end">
            <h2>{t("nav.rules")}</h2>
          </div>
        </div>

        <div className="content">
          <div className="item align-center">
            <h2>{t("cta.title")}</h2>
            <Link href="/contact" className="btn">
              {t("cta.button")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
