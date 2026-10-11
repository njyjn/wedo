import { fitWithin, MAX_UPLOAD_EDGE } from "@/lib/image";

// Matches the server limit in uploadSettingImage, with headroom for the rest of the request.
const MAX_BYTES = 3.5 * 1024 * 1024;
const PASS_THROUGH = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Shrink a photo in the browser so it fits the 4 MB upload limit and isn't needlessly large for
 * guests: at most MAX_UPLOAD_EDGE px on the longest edge, re-encoded as JPEG (WebP for PNGs, to
 * keep transparency). Small files pass through untouched; GIFs are never touched (animation).
 * Also converts formats the server doesn't accept, such as HEIC, when the browser can decode them.
 */
export async function resizeForUpload(file: File): Promise<File> {
  if (file.type === "image/gif") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(
      `Your browser can't read ${file.name}. Export it as a JPEG and try again.`,
    );
  }
  const { width, height } = fitWithin(
    bitmap.width,
    bitmap.height,
    MAX_UPLOAD_EDGE,
  );
  if (
    PASS_THROUGH.has(file.type) &&
    width === bitmap.width &&
    file.size <= MAX_BYTES
  ) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const type = file.type === "image/png" ? "image/webp" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, 0.85),
  );
  if (!blob) throw new Error(`Could not process ${file.name}.`);
  const name =
    file.name.replace(/\.[^.]*$/, "") +
    (type === "image/webp" ? ".webp" : ".jpg");
  return new File([blob], name, { type });
}
