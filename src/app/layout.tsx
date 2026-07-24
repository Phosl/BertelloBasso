import type {Metadata} from "next";
import {DM_Mono, Manrope} from "next/font/google";
import "@/app/globals.css";
import {PageTransitionProvider} from "@/components/transitions/PageTransitionProvider";

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
  metadataBase: new URL("https://piandellacarlotta.it"),
  title: {
    default: "Pian della Carlotta · Azienda agricola in Umbria",
    template: "%s · Pian della Carlotta",
  },
  description:
    "Olio, vino e piccole produzioni agricole dalle colline umbre vicino Todi.",
};

export default function RootLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="it">
      <body className={`${manrope.variable} ${dmMono.variable}`}>
        <a className="skip-link" href="#main-content">
          Vai al contenuto
        </a>
        <PageTransitionProvider>{children}</PageTransitionProvider>
      </body>
    </html>
  );
}
