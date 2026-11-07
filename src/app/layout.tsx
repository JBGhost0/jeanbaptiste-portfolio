import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import { ReadingProvider, ModeToggle, Ambient } from "@/components/ReadingMode";

const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jb = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jb" });

export const metadata: Metadata = {
  title: "Jean-Baptiste Mahougnon DADA | Agronome & Développeur",
  description:
    "Technicien agronome en nutrition et transformation alimentaire, et développeur web. Portfolio, projets et parcours.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${space.variable} ${inter.variable} ${jb.variable}`}>
      <body>
        <body>
  <ReadingProvider>
    <Ambient />
    <SmoothScroll>{children}</SmoothScroll>
    <Cursor />
    <ModeToggle />
  </ReadingProvider>
</body>
      </body>
    </html>
  );
}