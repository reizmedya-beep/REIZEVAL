import type { Metadata } from "next";
import "./globals.css";
import { TitleBar } from "@/components/desktop/TitleBar";

export const metadata: Metadata = {
  title: "REIZEVAL — Global Project Assessment Platform",
  description: "Enterprise Windows Desktop Suite by REİZMEDYA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body className="h-screen w-screen flex flex-col bg-[#060a17] text-slate-100 overflow-hidden select-none">
        {/* Windows Desktop Custom Enterprise TitleBar */}
        <TitleBar />

        {/* Main Desktop Container below TitleBar */}
        <main className="flex-1 mt-10 overflow-hidden relative flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
