"use client";

import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Renders the printable RSVP card: template background, addressee, code, deadline and QR link. */
export default function InviteImage({
  inviteCode,
  rsvpUrl,
  respondBy,
  defaultRecipientText,
}: {
  inviteCode: string;
  rsvpUrl: string;
  respondBy: string;
  defaultRecipientText: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [recipientText, setRecipientText] = useState(defaultRecipientText);
  const [images, setImages] = useState<{
    template: HTMLImageElement;
    qr: HTMLImageElement;
  } | null>(null);
  const [downloadUrl, setDownloadUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loadImage("/rsvp-template.png"),
      QRCode.toDataURL(rsvpUrl).then(loadImage),
    ])
      .then(([template, qr]) => !cancelled && setImages({ template, qr }))
      .catch((e) => console.error("Could not load invite image assets", e));
    return () => {
      cancelled = true;
    };
  }, [rsvpUrl]);

  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx || !images) return;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(images.template, 0, 0, c.width, c.height);
    ctx.textAlign = "center";
    ctx.fillStyle = "#000";
    ctx.font = "45px Helvetica";
    ctx.fillText(recipientText, 620, 665, 1100);
    ctx.fillText(respondBy, 605, 1650);
    ctx.font = "45px Courier";
    ctx.fillText(inviteCode, 605, 1525);
    ctx.drawImage(images.qr, 890, 1410, 325, 325);
    setDownloadUrl(c.toDataURL());
  }, [images, recipientText, respondBy, inviteCode]);

  return (
    <>
      <div className="mb-2">
        <label className="form-label" htmlFor="recipient-text">
          Modify Recipient Text
        </label>
        <input
          id="recipient-text"
          className="form-control"
          value={recipientText}
          onChange={(e) => setRecipientText(e.target.value)}
        />
      </div>
      {downloadUrl && (
        <a
          className="center"
          href={downloadUrl}
          download={`rsvp-${inviteCode}.png`}
        >
          Download
        </a>
      )}
      <canvas
        ref={canvas}
        width={1240}
        height={1748}
        style={{ border: "1px solid #000", maxWidth: "100%" }}
      />
    </>
  );
}
