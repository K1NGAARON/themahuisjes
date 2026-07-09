import type { HuisjeSlug } from "@/data/huisjes";

function normalizeImagePath(imagePath: string): string {
  return imagePath.normalize("NFC");
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function orderGalleryImages(slug: string, images: string[]): string[] {
  const rest = images.map(normalizeImagePath);
  const frontIndex = rest.findIndex(
    (imagePath) => imagePath.split("/").pop()?.toLowerCase() === "front.jpg",
  );

  let front: string | null = null;
  if (frontIndex !== -1) {
    front = rest.splice(frontIndex, 1)[0] ?? null;
  }

  let seed = hashString(slug);
  for (let i = rest.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }

  return front ? [front, ...rest] : rest;
}

export function getGalleryImageSrc(slug: HuisjeSlug, imagePath: string): string {
  const normalized = normalizeImagePath(imagePath);
  return `/huisjes/${slug}/img/${normalized.split("/").map(encodeURIComponent).join("/")}`;
}
