import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Édition",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<p className="p-8 font-mono text-sm text-muted">Chargement…</p>}>
        {children}
      </Suspense>
    </div>
  );
}