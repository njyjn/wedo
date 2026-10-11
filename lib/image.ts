// Pure image helpers, shared by components, the upload resizer and tests.

/** Longest edge, in px, that photos are scaled down to before upload. */
export const MAX_UPLOAD_EDGE = 2400;

/** Scale `width` x `height` down to fit within `max` on the longest edge (never up). */
export function fitWithin(
  width: number,
  height: number,
  max: number,
): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

/**
 * Only our own Vercel Blob photos go through Next's image optimiser (allowed in next.config.ts);
 * URLs pasted from other hosts are shown as is.
 */
export function isOptimizableImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.protocol === "https:" &&
      u.hostname.endsWith(".public.blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}
