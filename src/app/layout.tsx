import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ReadingProvider } from "@/components/ReadingMode";
import Chrome from "@/components/Chrome";

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
        <ReadingProvider>
          <Chrome>{children}</Chrome>
        </ReadingProvider>
      </body>
    </html>
  );
}