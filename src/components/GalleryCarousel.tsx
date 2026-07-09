"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { HuisjeSlug } from "@/data/huisjes";

interface GalleryCarouselProps {
  slug: HuisjeSlug;
}

const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [1000, 2000, 4000];

function galleryImageSrc(slug: HuisjeSlug, path: string) {
  return `/huisjes/${slug}/img/${path.split("/").map(encodeURIComponent).join("/")}`;
}

function GalleryImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority: boolean;
}) {
  const t = useTranslations("huisjes.gallery");
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
    setRetryCount(0);
  }, [src]);

  useEffect(() => {
    if (!failed || retryCount >= MAX_RETRIES) return;

    const delay = RETRY_DELAYS_MS[retryCount] ?? 4000;
    const timer = window.setTimeout(() => {
      setFailed(false);
      setRetryCount((count) => count + 1);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [failed, retryCount]);

  function handleRetry() {
    setLoaded(false);
    setFailed(false);
    setRetryCount((count) => count + 1);
  }

  return (
    <div className={`gallery-carousel__frame${loaded ? " is-loaded" : ""}`}>
      {!loaded && !failed && (
        <div className="gallery-carousel__placeholder" aria-hidden="true" />
      )}
      {failed && retryCount >= MAX_RETRIES ? (
        <button
          type="button"
          className="gallery-carousel__retry"
          onClick={handleRetry}
        >
          {t("retry")}
        </button>
      ) : (
        <img
          key={`${src}-${retryCount}`}
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={loaded ? "is-visible" : undefined}
          onLoad={() => {
            setLoaded(true);
            setFailed(false);
          }}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function orderImages(images: string[]) {
  const rest = [...images];
  const frontIndex = rest.findIndex(
    (path) => path.split("/").pop()?.toLowerCase() === "front.jpg",
  );

  let front: string | null = null;
  if (frontIndex !== -1) {
    front = rest.splice(frontIndex, 1)[0] ?? null;
  }

  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }

  return front ? [front, ...rest] : rest;
}

export default function GalleryCarousel({ slug }: GalleryCarouselProps) {
  const t = useTranslations("huisjes.gallery");
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    fetch(`/huisjes/${slug}/img/gallery.json`)
      .then((response) => {
        if (!response.ok) throw new Error("Manifest not found");
        return response.json();
      })
      .then((data: { images?: string[] }) => {
        const ordered = orderImages(data.images ?? []);
        setImages(ordered);
      })
      .catch(() => setImages([]));
  }, [slug]);

  useEffect(() => {
    function updateVisibleCount() {
      const carousel = document.querySelector(".gallery-carousel");
      if (!carousel) return;
      const value = getComputedStyle(carousel).getPropertyValue("--gallery-visible");
      const parsed = parseInt(value, 10);
      setVisibleCount(parsed > 0 ? parsed : 1);
    }

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, [images.length]);

  const maxIndex = Math.max(0, images.length - visibleCount);
  const hideNav = images.length <= visibleCount;

  const goTo = useCallback(
    (index: number) => {
      if (!images.length) return;
      if (index < 0) {
        setCurrentIndex(maxIndex);
      } else if (index > maxIndex) {
        setCurrentIndex(0);
      } else {
        setCurrentIndex(index);
      }
    },
    [images.length, maxIndex],
  );

  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [currentIndex, maxIndex]);

  if (!images.length) {
    return null;
  }

  return (
    <div className="gallery-carousel" data-gallery>
      <button
        type="button"
        className="gallery-carousel__btn gallery-carousel__btn--prev"
        aria-label={t("prev")}
        hidden={hideNav}
        onClick={() => goTo(currentIndex - 1)}
      >
        <i className="fa-solid fa-chevron-left" aria-hidden="true" />
      </button>
      <div className="gallery-carousel__viewport">
        <div
          className="gallery-carousel__track"
          role="list"
          style={{ "--gallery-index": currentIndex } as React.CSSProperties}
        >
          {images.map((path, index) => {
            const shouldLoad =
              index >= currentIndex - 1 &&
              index <= currentIndex + visibleCount;

            return (
              <div key={path} className="gallery-carousel__slide" role="listitem">
                {shouldLoad ? (
                  <GalleryImage
                    src={galleryImageSrc(slug, path)}
                    alt={t("photo", { number: index + 1 })}
                    priority={index >= currentIndex && index < currentIndex + visibleCount}
                  />
                ) : (
                  <div className="gallery-carousel__placeholder" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        className="gallery-carousel__btn gallery-carousel__btn--next"
        aria-label={t("next")}
        hidden={hideNav}
        onClick={() => goTo(currentIndex + 1)}
      >
        <i className="fa-solid fa-chevron-right" aria-hidden="true" />
      </button>
      {!hideNav && (
        <div className="gallery-carousel__dots" role="tablist" aria-label={t("nav")}>
          {Array.from({ length: maxIndex + 1 }, (_, index) => (
            <button
              key={index}
              type="button"
              className={`gallery-carousel__dot${index === currentIndex ? " is-active" : ""}`}
              role="tab"
              aria-label={t("photo", { number: index + 1 })}
              aria-selected={index === currentIndex}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
