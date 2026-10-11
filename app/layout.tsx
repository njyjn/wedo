import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Fraunces,
  Inter,
  Jost,
  Licorice,
} from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Header from "@/components/Header";
import { getSettings } from "@/lib/settings";
import { resolveAccent, resolveTheme } from "@/lib/theme";

// Every theme's fonts are declared, but browsers only download the ones the active theme uses.
const signature = Licorice({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-signature",
});
const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});
const jost = Jost({ subsets: ["latin"], variable: "--font-jost" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "WeDo", template: "%s | WeDo" },
  description: "Wedding invitations and RSVPs",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const accent = resolveAccent(settings.themeAccent);
  return (
    <html
      lang="en"
      data-theme={resolveTheme(settings.themePreset)}
      className={[signature, cormorant, fraunces, jost, inter]
        .map((f) => f.variable)
        .join(" ")}
      style={
        accent ? ({ "--accent": accent } as React.CSSProperties) : undefined
      }
    >
      <body>
        <Header coupleName={settings.coupleName} />
        <main>{children}</main>
      </body>
    </html>
  );
}
