import type { Metadata, Viewport } from "next";
import { Licorice } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Header from "@/components/Header";

const signature = Licorice({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-signature",
});

export const metadata: Metadata = {
  title: { default: "WeDo", template: "%s | WeDo" },
  description: "Wedding invitations and RSVPs",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={signature.variable}>
      <body>
        <div className="container-fluid">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
