import type {Metadata} from "next";
import {headers} from "next/headers";
import {DM_Mono, Manrope} from "next/font/google";
import "@/app/globals.css";
import {PageTransitionProvider} from "@/components/transitions/PageTransitionProvider";
import {brand} from "@/lib/brand";
import {getMessages} from "@/lib/i18n/messages";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(brand.productionUrl),
  title: {
    default: `${brand.name} · Azienda agricola a ${brand.location}`,
    template: `%s · ${brand.name}`,
  },
  description:
    "Olio, vino e piccole produzioni agricole da San Damiano di Todi, nel cuore dell’Umbria.",
};

export default async function RootLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-site-locale") === "en" ? "en" : "it";
  const copy = getMessages(locale);

  return (
    <html lang={locale}>
      <body className={`${manrope.variable} ${dmMono.variable}`}>
        <a className="skip-link" href="#main-content">
          {copy.skipToContent}
        </a>
        <PageTransitionProvider>{children}</PageTransitionProvider>
      </body>
    </html>
  );
}
