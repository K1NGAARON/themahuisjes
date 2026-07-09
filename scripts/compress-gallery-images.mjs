import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const PUBLIC_HUISJES = path.join(ROOT, "public", "huisjes");
const HUIZEN_WITH_GALLERY = ["retteketet", "vis-a-vis", "maison-d-o", "ribbedepie"];

const MAX_DIMENSION = 1920;
const TARGET_MAX_BYTES = 400 * 1024;
const MIN_QUALITY = 55;
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function collectImagePaths() {
  const imagePaths = new Set();

  for (const slug of HUIZEN_WITH_GALLERY) {
    const imgDir = path.join(PUBLIC_HUISJES, slug, "img");
    const galleryJsonPath = path.join(imgDir, "gallery.json");
    const gallery = JSON.parse(await fs.readFile(galleryJsonPath, "utf8"));

    for (const image of gallery.images ?? []) {
      imagePaths.add(path.join(imgDir, image));
    }

    imagePaths.add(path.join(imgDir, "banner.jpg"));
  }

  imagePaths.add(path.join(PUBLIC_HUISJES, "kabinet-walschap", "img", "front.jpg"));
  imagePaths.add(path.join(PUBLIC_HUISJES, "tete-a-tete", "img", "front.jpeg"));

  const existing = [];
  for (const imagePath of imagePaths) {
    if (await fileExists(imagePath)) {
      existing.push(imagePath);
    } else {
      console.warn(`Skipping missing file: ${path.relative(ROOT, imagePath)}`);
    }
  }

  return existing.sort();
}

async function optimizeJpeg(inputPath, metadata) {
  const needsResize =
    (metadata.width ?? 0) > MAX_DIMENSION || (metadata.height ?? 0) > MAX_DIMENSION;

  let pipeline = sharp(inputPath, { failOn: "none" }).rotate();
  if (needsResize) {
    pipeline = pipeline.resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  let quality = 82;
  let bestBuffer = null;

  while (quality >= MIN_QUALITY) {
    const buffer = await pipeline
      .clone()
      .jpeg({ quality, mozjpeg: true, chromaSubsampling: "4:2:0" })
      .toBuffer();

    bestBuffer = buffer;
    if (buffer.length <= TARGET_MAX_BYTES) {
      return buffer;
    }

    quality -= 5;
  }

  return bestBuffer;
}

async function optimizePng(inputPath, metadata) {
  const needsResize =
    (metadata.width ?? 0) > MAX_DIMENSION || (metadata.height ?? 0) > MAX_DIMENSION;

  let pipeline = sharp(inputPath, { failOn: "none" }).rotate();
  if (needsResize) {
    pipeline = pipeline.resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const hasAlpha = metadata.hasAlpha;
  let bestBuffer = await pipeline
    .clone()
    .png({
      compressionLevel: 9,
      palette: !hasAlpha,
      quality: 80,
      effort: 10,
    })
    .toBuffer();

  if (bestBuffer.length <= TARGET_MAX_BYTES || hasAlpha) {
    return bestBuffer;
  }

  const jpegBuffer = await pipeline
    .clone()
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: "4:2:0" })
    .toBuffer();

  if (jpegBuffer.length < bestBuffer.length) {
    return { buffer: jpegBuffer, convertToJpeg: true };
  }

  return bestBuffer;
}

async function compressImage(imagePath) {
  const originalStat = await fs.stat(imagePath);
  const extension = path.extname(imagePath).toLowerCase();

  if (!IMAGE_EXTENSIONS.has(extension)) {
    return { status: "skipped", reason: "unsupported extension" };
  }

  const metadata = await sharp(imagePath, { failOn: "none" }).metadata();
  const withinSizeLimit = originalStat.size <= TARGET_MAX_BYTES;
  const withinDimensions =
    (metadata.width ?? 0) <= MAX_DIMENSION && (metadata.height ?? 0) <= MAX_DIMENSION;

  if (withinSizeLimit && withinDimensions) {
    return { status: "skipped", reason: "already within limits" };
  }

  let output;
  let outputPath = imagePath;

  if (extension === ".png") {
    const pngResult = await optimizePng(imagePath, metadata);
    if (pngResult && typeof pngResult === "object" && "convertToJpeg" in pngResult) {
      output = pngResult.buffer;
      outputPath = imagePath.replace(/\.png$/i, ".jpg");
    } else {
      output = pngResult;
    }
  } else {
    output = await optimizeJpeg(imagePath, metadata);
  }

  if (!output || output.length >= originalStat.size) {
    return { status: "skipped", reason: "no size improvement" };
  }

  if (outputPath !== imagePath) {
    await fs.writeFile(outputPath, output);
    await fs.unlink(imagePath);
    await updateGalleryReference(imagePath, outputPath);
  } else {
    await fs.writeFile(imagePath, output);
  }

  const optimizedMeta = await sharp(outputPath).metadata();

  return {
    status: "compressed",
    outputPath,
    beforeBytes: originalStat.size,
    afterBytes: output.length,
    beforeDimensions: `${metadata.width}x${metadata.height}`,
    afterDimensions: `${optimizedMeta.width}x${optimizedMeta.height}`,
  };
}

async function updateGalleryReference(oldPath, newPath) {
  const oldName = path.basename(oldPath);
  const newName = path.basename(newPath);
  const galleryJsonPath = path.join(path.dirname(oldPath), "gallery.json");

  if (!(await fileExists(galleryJsonPath))) {
    return;
  }

  const gallery = JSON.parse(await fs.readFile(galleryJsonPath, "utf8"));
  const images = gallery.images ?? [];
  const index = images.indexOf(oldName);

  if (index === -1) {
    return;
  }

  images[index] = newName;
  gallery.images = images;
  await fs.writeFile(galleryJsonPath, `${JSON.stringify(gallery, null, 2)}\n`);
}

async function main() {
  const imagePaths = await collectImagePaths();
  let compressed = 0;
  let skipped = 0;
  let savedBytes = 0;

  console.log(`Found ${imagePaths.length} images to inspect.\n`);

  for (const imagePath of imagePaths) {
    const relativePath = path.relative(ROOT, imagePath);
    const result = await compressImage(imagePath);

    if (result.status === "compressed") {
      compressed += 1;
      savedBytes += result.beforeBytes - result.afterBytes;
      const outputRelativePath = path.relative(ROOT, result.outputPath);
      console.log(
        `✓ ${outputRelativePath}: ${formatBytes(result.beforeBytes)} → ${formatBytes(result.afterBytes)} (${result.beforeDimensions} → ${result.afterDimensions})`,
      );
    } else {
      skipped += 1;
      console.log(`· ${relativePath}: ${result.reason}`);
    }
  }

  console.log(
    `\nDone. Compressed ${compressed} image(s), skipped ${skipped}. Saved ${formatBytes(savedBytes)}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
