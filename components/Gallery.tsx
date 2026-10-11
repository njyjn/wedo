"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { isOptimizableImageUrl } from "@/lib/image";

/** A photo grid; tapping a photo opens a full-screen viewer with swipe and arrow-key navigation. */
export default function Gallery({ photos }: { photos: string[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);
  const count = photos.length;
  const step = (delta: number) =>
    setOpen((i) => (i === null ? i : (i + delta + count) % count));

  const isOpen = open !== null;
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (delta) setOpen((i) => (i === null ? i : (i + delta + count) % count));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, count]);

  return (
    <>
      <ul className="gallery-grid">
        {photos.map((src, i) => (
          <li key={src}>
            <button
              type="button"
              className="gallery-thumb"
              onClick={() => setOpen(i)}
              aria-label={`Open photo ${i + 1} of ${count}`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(min-width: 1024px) 21rem, (min-width: 576px) 33vw, 50vw"
                unoptimized={!isOptimizableImageUrl(src)}
              />
            </button>
          </li>
        ))}
      </ul>

      <Modal
        show={open !== null}
        onHide={() => setOpen(null)}
        fullscreen
        contentClassName="lightbox"
        aria-label="Photo viewer"
      >
        {open !== null && (
          <div
            className="lightbox-stage"
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              touchX.current = null;
              if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            }}
          >
            <Image
              key={photos[open]}
              src={photos[open]}
              alt={`Photo ${open + 1} of ${count}`}
              fill
              sizes="100vw"
              unoptimized={!isOptimizableImageUrl(photos[open])}
              className="lightbox-image"
            />
            <button
              type="button"
              className="lightbox-btn lightbox-close"
              onClick={() => setOpen(null)}
              aria-label="Close"
            >
              ×
            </button>
            {count > 1 && (
              <>
                <button
                  type="button"
                  className="lightbox-btn lightbox-prev"
                  onClick={() => step(-1)}
                  aria-label="Previous photo"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="lightbox-btn lightbox-next"
                  onClick={() => step(1)}
                  aria-label="Next photo"
                >
                  ›
                </button>
                <p className="lightbox-count">
                  {open + 1} / {count}
                </p>
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
