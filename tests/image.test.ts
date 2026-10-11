import { describe, expect, it } from "vitest";
import { fitWithin, isOptimizableImageUrl } from "@/lib/image";

describe("fitWithin", () => {
  it("scales the longest edge down to the limit, keeping the aspect ratio", () => {
    expect(fitWithin(6000, 4000, 2400)).toEqual({ width: 2400, height: 1600 });
    expect(fitWithin(3000, 4500, 2400)).toEqual({ width: 1600, height: 2400 });
  });

  it("never scales up", () => {
    expect(fitWithin(1240, 1748, 2400)).toEqual({ width: 1240, height: 1748 });
  });
});

describe("isOptimizableImageUrl", () => {
  it("accepts public Vercel Blob URLs", () => {
    expect(
      isOptimizableImageUrl(
        "https://abc123.public.blob.vercel-storage.com/wedo/galleryPhotos-x.jpg",
      ),
    ).toBe(true);
  });

  it("rejects other hosts, lookalikes and non-https URLs", () => {
    for (const url of [
      "https://example.com/photo.jpg",
      "https://public.blob.vercel-storage.com.evil.com/x.jpg",
      "http://abc.public.blob.vercel-storage.com/x.jpg",
      "/local.jpg",
      "not a url",
    ]) {
      expect(isOptimizableImageUrl(url)).toBe(false);
    }
  });
});
