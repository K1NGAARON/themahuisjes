import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const GALLERIES_TS = path.join(ROOT, "src", "data", "galleries.ts");
const SLUGS = ["retteketet", "vis-a-vis", "maison-d-o", "ribbedepie"];
const DEFAULT_ASPECT = { width: 4, height: 3 };

function normalizeImagePath(imagePath) {
  return imagePath.normalize("NFC");
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function orderGalleryImages(slug, images) {
  const rest = images.map(normalizeImagePath);
  const frontIndex = rest.findIndex(
    (imagePath) => imagePath.split("/").pop()?.toLowerCase() === "front.jpg",
  );

  let front = null;
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

export function parseGalleriesTs(source) {
  const galleries = {};
  let currentSlug = null;

  for (const line of source.split("\n")) {
    const slugMatch = line.match(/^\s{2}"?([a-z-]+)"?:\s*\[/);
    if (slugMatch) {
      currentSlug = slugMatch[1];
      galleries[currentSlug] = [];
      continue;
    }

    const pathMatch = line.match(/path:\s*"([^"]+)"/);
    if (pathMatch && currentSlug) {
      galleries[currentSlug].push(pathMatch[1]);
    }
  }

  return galleries;
}

async function readImageDimensions(imagePath) {
  try {
    const metadata = await sharp(imagePath, { failOn: "none" }).metadata();
    if (metadata.width && metadata.height) {
      return { width: metadata.width, height: metadata.height };
    }
  } catch {
    // Fall back below.
  }

  return DEFAULT_ASPECT;
}

function formatSlugKey(slug) {
  return slug.includes("-") ? `"${slug}"` : slug;
}

function formatGalleryFile(galleries) {
  const lines = [
    'import type { HuisjeSlug } from "@/data/huisjes";',
    'import type { GalleryImage } from "@/lib/gallery";',
    "",
    "export const galleries: Record<HuisjeSlug, GalleryImage[]> = {",
  ];

  for (const slug of SLUGS) {
    lines.push(`  ${formatSlugKey(slug)}: [`);
    for (const image of galleries[slug] ?? []) {
      lines.push(
        `    { path: ${JSON.stringify(image.path)}, width: ${image.width}, height: ${image.height} },`,
      );
    }
    lines.push("  ],");
  }

  lines.push("};", "");
  return lines.join("\n");
}

async function buildGalleriesFromManifests() {
  const galleries = {};

  for (const slug of SLUGS) {
    const galleryJsonPath = path.join(
      ROOT,
      "public",
      "huisjes",
      slug,
      "img",
      "gallery.json",
    );
    const data = JSON.parse(await fs.readFile(galleryJsonPath, "utf8"));
    const orderedPaths = orderGalleryImages(slug, data.images ?? []);
    const imgDir = path.join(ROOT, "public", "huisjes", slug, "img");

    galleries[slug] = [];
    for (const imagePath of orderedPaths) {
      const normalizedPath = normalizeImagePath(imagePath);
      const dimensions = await readImageDimensions(path.join(imgDir, normalizedPath));
      galleries[slug].push({
        path: normalizedPath,
        width: dimensions.width,
        height: dimensions.height,
      });
    }
  }

  return galleries;
}

async function buildGalleriesFromTs() {
  const source = await fs.readFile(GALLERIES_TS, "utf8");
  const pathsBySlug = parseGalleriesTs(source);
  const galleries = {};

  for (const slug of SLUGS) {
    const imgDir = path.join(ROOT, "public", "huisjes", slug, "img");
    galleries[slug] = [];

    for (const imagePath of pathsBySlug[slug] ?? []) {
      const normalizedPath = normalizeImagePath(imagePath);
      const dimensions = await readImageDimensions(path.join(imgDir, normalizedPath));
      galleries[slug].push({
        path: normalizedPath,
        width: dimensions.width,
        height: dimensions.height,
      });
    }
  }

  return galleries;
}

export async function writeGalleriesFile(galleries) {
  await fs.writeFile(GALLERIES_TS, formatGalleryFile(galleries));
}

export async function updateGalleryImagePath(oldPath, newPath) {
  const source = await fs.readFile(GALLERIES_TS, "utf8");
  const oldName = path.basename(oldPath);
  const newName = path.basename(newPath);
  const nextSource = source.replace(
    new RegExp(`path:\\s*${JSON.stringify(oldName).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
    `path: ${JSON.stringify(newName)}`,
  );

  if (nextSource === source) {
    return false;
  }

  await fs.writeFile(GALLERIES_TS, nextSource);
  const galleries = await buildGalleriesFromTs();
  await writeGalleriesFile(galleries);
  return true;
}

async function main() {
  const fromManifest = process.argv.includes("--from-manifest");
  const galleries = fromManifest
    ? await buildGalleriesFromManifests()
    : await buildGalleriesFromTs();

  await writeGalleriesFile(galleries);
  console.log(`Updated ${path.relative(ROOT, GALLERIES_TS)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
