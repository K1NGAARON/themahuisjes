"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { HuisjeSlug } from "@/data/huisjes";
import { getGalleryImageSrc, type GalleryImage } from "@/lib/gallery";

interface GalleryCarouselProps {
  slug: HuisjeSlug;
  images: GalleryImage[];
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [layout, setLayout] = useState({
    offsets: [0],
    maxIndex: 0,
    hideNav: true,
  });

  useEffect(() => {
    setCurrentIndex(0);
  }, [slug, images]);

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
    observer.observe(viewport);

    return () => observer.disconnect();
  }, [images]);

  const maxIndex = layout.maxIndex;
  const hideNav = layout.hideNav;
  const trackOffset = layout.offsets[currentIndex] ?? 0;

  const goTo = useCallback(
    (index: number) => {
      if (!images.length) return;

      setIsAnimating(true);

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

  function handleTrackTransitionEnd(
    event: React.TransitionEvent<HTMLDivElement>,
  ) {
    if (event.propertyName === "transform") {
      setIsAnimating(false);
    }
  }

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
          className={`gallery-carousel__track${isAnimating ? " is-animating" : ""}`}
          role="list"
          style={{ transform: `translateX(-${trackOffset}px)` }}
          onTransitionEnd={handleTrackTransitionEnd}
        >
          {images.map((image, index) => (
            <div
              key={image.path}
              className="gallery-carousel__slide"
              role="listitem"
              style={{ aspectRatio: `${image.width} / ${image.height}` }}
            >
              <img
                src={getGalleryImageSrc(slug, image.path)}
                alt={t("photo", { number: index + 1 })}
                width={image.width}
                height={image.height}
                loading={index <= 2 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={index <= 2 ? "high" : "auto"}
              />
            </div>
          ))}
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
