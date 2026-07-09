"use client";

import { useEffect } from "react";

const DESKTOP_MIN_WIDTH = 1025;

export default function ScrollBackground() {
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(".content");
    const numSections = sections.length;

    function updateBackgrounds() {
      if (window.innerWidth < DESKTOP_MIN_WIDTH) {
        sections.forEach((section) => {
          section.style.removeProperty("background");
        });
        return;
      }

      const scrollTop = window.scrollY;
      const viewportHeight = window.innerHeight;

      sections.forEach((section, index) => {
        // Hero uses .item.bg for its right-side overlay
        if (index === 0) {
          section.style.background = "transparent";
          return;
        }

        const sectionOffsetTop = section.offsetTop;
        const distanceFromTop =
          scrollTop - sectionOffsetTop + viewportHeight / 2;

        let opacity: number;
        if (distanceFromTop >= 0 && distanceFromTop <= viewportHeight) {
          opacity = Math.min(1, ((index + 1) / numSections) * 0.85 + 0.15);
        } else {
          opacity = 0;
        }

        section.style.background = `rgba(0, 0, 0, ${opacity})`;
      });
    }

    window.addEventListener("scroll", updateBackgrounds, { passive: true });
    window.addEventListener("resize", updateBackgrounds, { passive: true });
    updateBackgrounds();

    return () => {
      window.removeEventListener("scroll", updateBackgrounds);
      window.removeEventListener("resize", updateBackgrounds);
    };
  }, []);

  return null;
}
