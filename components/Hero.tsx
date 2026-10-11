"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { isOptimizableImageUrl } from "@/lib/image";

/**
 * Full-bleed cover with the couple's names over a crossfading photo slideshow. Without photos it
 * falls back to a plain tinted panel.
 */
export default function Hero({
  photos,
  eyebrow,
  title,
  lines,
  countdown,
  action,
  compact = false,
}: {
  photos: string[];
  eyebrow?: string;
  title: string;
  lines: string[];
  countdown?: string | null;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (photos.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % photos.length),
      6000,
    );
    return () => clearInterval(timer);
  }, [photos.length]);

  const hasPhotos = photos.length > 0;
  return (
    <header
      className={`hero${hasPhotos ? " hero-photo" : " hero-plain"}${compact ? " hero-compact" : ""}`}
    >
      {photos.map((src, i) => (
        // Photos can come from any host; only our own Blob uploads go through the optimiser.
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="100vw"
          loading={i === 0 ? "eager" : "lazy"}
          fetchPriority={i === 0 ? "high" : "auto"}
          unoptimized={!isOptimizableImageUrl(src)}
          className={`hero-image${i === index ? " is-active" : ""}`}
        />
      ))}
      <div className="hero-content">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="hero-title">{title}</h1>
        {lines.filter(Boolean).map((line) => (
          <p className="hero-line" key={line}>
            {line}
          </p>
        ))}
        {countdown && <p className="hero-countdown">{countdown}</p>}
        {action && <div className="hero-actions">{action}</div>}
      </div>
    </header>
  );
}
