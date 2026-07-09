import fs from "node:fs/promises";
import path from "node:path";
import { orderGalleryImages } from "@/lib/gallery";

export async function getGalleryImages(slug: string): Promise<string[]> {
  const galleryPath = path.join(
    process.cwd(),
    "public",
    "huisjes",
    slug,
    "img",
    "gallery.json",
  );

  try {
    const raw = await fs.readFile(galleryPath, "utf8");
    const data = JSON.parse(raw) as { images?: string[] };
    return orderGalleryImages(slug, data.images ?? []);
  } catch {
    return [];
  }
}
