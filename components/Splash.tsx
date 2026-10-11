"use client";

import Image from "next/image";
import { Carousel } from "react-bootstrap";

export default function Splash({ photos }: { photos: string[] }) {
  return (
    <Carousel
      fade
      interval={3000}
      controls={photos.length > 1}
      indicators={photos.length > 1}
    >
      {photos.map((p, i) => (
        <Carousel.Item key={p}>
          {/* Photos can come from any host configured in settings, so skip the optimiser. */}
          <Image
            src={p}
            alt="The couple"
            width={1000}
            height={1000}
            priority={i === 0}
            unoptimized
            style={{ width: "100%", height: "auto" }}
          />
        </Carousel.Item>
      ))}
    </Carousel>
  );
}
