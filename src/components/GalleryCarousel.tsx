"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { HuisjeSlug } from "@/data/huisjes";
import { getGalleryImageSrc } from "@/lib/gallery";
import {
  getGalleryImageCacheStatus,
  markGalleryImageError,
  markGalleryImageLoaded,
  prefetchGalleryImage,
} from "@/lib/gallery-image-cache";

interface GalleryCarouselProps {
  slug: HuisjeSlug;
  images: string[];
}

const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [1000, 2000, 4000];
const VIEWPORT_ROOT_MARGIN = "320px";

function GalleryImage({
  src,
  alt,
  fetchPriority,
}: {
  src: string;
  alt: string;
  fetchPriority: "high" | "low" | "auto";
}) {
  const t = useTranslations("huisjes.gallery");
  const [loaded, setLoaded] = useState(
    () => getGalleryImageCacheStatus(src) === "loaded",
  );
  const [failed, setFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setLoaded(getGalleryImageCacheStatus(src) === "loaded");
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

  async function handleLoad(event: React.SyntheticEvent<HTMLImageElement>) {
    const image = event.currentTarget;

    try {
      await image.decode();
    } catch {
      // decode() can fail on unsupported formats; onLoad still means bytes arrived.
    }

    setLoaded(true);
    setFailed(false);
    markGalleryImageLoaded(src);
  }

  function handleError() {
    setFailed(true);
    markGalleryImageError(src);
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
          loading="eager"
          decoding="async"
          fetchPriority={fetchPriority}
          className={loaded ? "is-visible" : undefined}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}

function measureCarouselLayout(
  track: HTMLDivElement,
  viewport: HTMLDivElement,
  slideCount: number,
) {
  const slides = Array.from(track.children) as HTMLElement[];
  const offsets = slides.slice(0, slideCount).map((slide) => slide.offsetLeft);
  const trackWidth = track.scrollWidth;
  const viewportWidth = viewport.clientWidth;
  const maxScroll = Math.max(0, trackWidth - viewportWidth);

  let maxIndex = 0;
  for (let index = 0; index < offsets.length; index++) {
    if (offsets[index] <= maxScroll + 1) {
      maxIndex = index;
    } else {
      break;
    }
  }

  return {
    offsets,
    maxIndex,
    hideNav: trackWidth <= viewportWidth + 1,
  };
}

export default function GalleryCarousel({ slug, images }: GalleryCarouselProps) {
  const t = useTranslations("huisjes.gallery");
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [layout, setLayout] = useState({
    offsets: [0],
    maxIndex: 0,
    hideNav: true,
  });

  useEffect(() => {
    setCurrentIndex(0);
  }, [slug, images]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: VIEWPORT_ROOT_MARGIN },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [images.length]);

  useEffect(() => {
    function updateVisibleCount() {
      const carousel = rootRef.current;
      if (!carousel) return;
      const value = getComputedStyle(carousel).getPropertyValue("--gallery-visible");
      const parsed = parseInt(value, 10);
      setVisibleCount(parsed > 0 ? parsed : 1);
    }

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, [images.length]);

  useEffect(() => {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport || !images.length) return;

    function updateLayout() {
      const nextTrack = trackRef.current;
      const nextViewport = viewportRef.current;
      if (!nextTrack || !nextViewport) return;
      setLayout(measureCarouselLayout(nextTrack, nextViewport, images.length));
    }

    updateLayout();

    const observer = new ResizeObserver(updateLayout);
    observer.observe(track);
    observer.observe(viewport);
    for (const slide of track.children) {
      observer.observe(slide);
    }

    return () => observer.disconnect();
  }, [images, isNearViewport]);

  useEffect(() => {
    if (!isNearViewport) return;

    const mountedStart = Math.max(0, currentIndex - 1);
    const mountedEnd = Math.min(images.length - 1, currentIndex + visibleCount);
    const prefetchEnd = Math.min(images.length - 1, mountedEnd + 2);

    for (let index = mountedEnd + 1; index <= prefetchEnd; index++) {
      void prefetchGalleryImage(getGalleryImageSrc(slug, images[index]));
    }

    if (mountedStart > 0) {
      void prefetchGalleryImage(getGalleryImageSrc(slug, images[mountedStart - 1]));
    }
  }, [currentIndex, images, isNearViewport, slug, visibleCount]);

  const maxIndex = layout.maxIndex;
  const hideNav = layout.hideNav;
  const trackOffset = layout.offsets[currentIndex] ?? 0;

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
    <div className="gallery-carousel" data-gallery ref={rootRef}>
      <button
        type="button"
        className="gallery-carousel__btn gallery-carousel__btn--prev"
        aria-label={t("prev")}
        hidden={hideNav}
        onClick={() => goTo(currentIndex - 1)}
      >
        <i className="fa-solid fa-chevron-left" aria-hidden="true" />
      </button>
      <div className="gallery-carousel__viewport" ref={viewportRef}>
        <div
          ref={trackRef}
          className="gallery-carousel__track"
          role="list"
          style={{ transform: `translateX(-${trackOffset}px)` }}
        >
          {images.map((path, index) => {
            const isVisible =
              index >= currentIndex && index < currentIndex + visibleCount;
            const isAdjacent =
              index >= currentIndex - 1 &&
              index <= currentIndex + visibleCount;
            const shouldLoad = isNearViewport && isAdjacent;

            return (
              <div key={path} className="gallery-carousel__slide" role="listitem">
                {shouldLoad ? (
                  <GalleryImage
                    src={getGalleryImageSrc(slug, path)}
                    alt={t("photo", { number: index + 1 })}
                    fetchPriority={isVisible ? "high" : "low"}
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
