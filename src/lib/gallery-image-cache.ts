type CacheStatus = "idle" | "loading" | "loaded" | "error";

interface CacheEntry {
  status: CacheStatus;
  promise?: Promise<void>;
}

const cache = new Map<string, CacheEntry>();

function decodeImage(image: HTMLImageElement): Promise<void> {
  if ("decode" in image) {
    return image.decode().catch(() => undefined);
  }
  return Promise.resolve();
}

export function getGalleryImageCacheStatus(src: string): CacheStatus {
  return cache.get(src)?.status ?? "idle";
}

export function markGalleryImageLoaded(src: string): void {
  cache.set(src, { status: "loaded" });
}

export function markGalleryImageError(src: string): void {
  cache.set(src, { status: "error" });
}

export function prefetchGalleryImage(src: string): Promise<void> {
  const existing = cache.get(src);
  if (existing?.status === "loaded") return Promise.resolve();
  if (existing?.promise) return existing.promise;

  const promise = new Promise<void>((resolve) => {
    const image = new Image();
    image.decoding = "async";

    image.onload = () => {
      void decodeImage(image).finally(() => {
        cache.set(src, { status: "loaded" });
        resolve();
      });
    };

    image.onerror = () => {
      cache.set(src, { status: "error" });
      resolve();
    };

    image.src = src;
  });

  cache.set(src, { status: "loading", promise });
  return promise;
}
