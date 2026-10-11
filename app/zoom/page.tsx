import type { Metadata } from "next";

export const metadata: Metadata = { title: "Zoom" };

export default function ZoomPage() {
  return (
    <p className="text-center">
      Nice try... This event will not be broadcast :/
    </p>
  );
}
