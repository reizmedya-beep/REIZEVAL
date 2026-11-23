import type { Metadata } from "next";
import "./globals.css";

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
      <body className="h-screen w-screen flex flex-col bg-[#060a17] text-slate-100 overflow-hidden">
        {children}
      </body>
    </html>
  );
}
