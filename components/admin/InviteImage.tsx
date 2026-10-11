"use client";

import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Uploaded templates live on another origin; CORS keeps the canvas exportable.
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Renders the printable RSVP card: template background, addressee, code, deadline and QR link. */
export default function InviteImage({
  inviteCode,
  templateUrl,
  rsvpUrl,
  respondBy,
  defaultRecipientText,
}: {
  inviteCode: string;
  /** Background image; a plain card is drawn when none is configured. */
  templateUrl: string | null;
  rsvpUrl: string;
  respondBy: string;
  defaultRecipientText: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [recipientText, setRecipientText] = useState(defaultRecipientText);
  const [images, setImages] = useState<{
    template: HTMLImageElement | null;
    qr: HTMLImageElement;
  } | null>(null);
  const [downloadUrl, setDownloadUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      // A template that fails to load (e.g. no CORS) falls back to the plain card.
      templateUrl
        ? loadImage(templateUrl).catch(() => null)
        : Promise.resolve(null),
      QRCode.toDataURL(rsvpUrl).then(loadImage),
    ])
      .then(([template, qr]) => !cancelled && setImages({ template, qr }))
      .catch((e) => console.error("Could not load invite image assets", e));
    return () => {
      cancelled = true;
    };
  }, [rsvpUrl, templateUrl]);

  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx || !images) return;
    ctx.clearRect(0, 0, c.width, c.height);
    if (images.template) {
      ctx.drawImage(images.template, 0, 0, c.width, c.height);
    } else {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.strokeStyle = "#b9a493";
      ctx.lineWidth = 12;
      ctx.strokeRect(40, 40, c.width - 80, c.height - 80);
    }
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
