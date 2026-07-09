import type { HuisjeSlug } from "@/data/huisjes";
import { galleries } from "@/data/galleries";

export interface GalleryImage {
  path: string;
  width: number;
  height: number;
}

function normalizeImagePath(imagePath: string): string {
  return imagePath.normalize("NFC");
}

export function getGalleryImages(slug: HuisjeSlug): GalleryImage[] {
  return galleries[slug] ?? [];
}

export function getGalleryImageSrc(slug: HuisjeSlug, imagePath: string): string {
  const normalized = normalizeImagePath(imagePath);
  return `/huisjes/${slug}/img/${normalized.split("/").map(encodeURIComponent).join("/")}`;
}
