import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { TitleBar } from "@/components/desktop/TitleBar";
import "../globals.css";

export const metadata: Metadata = {
  title: "REIZEVAL — Global Project Assessment Platform",
  description: "Enterprise Windows Desktop Suite by REİZMEDYA",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} className="dark">
      <body className="h-screen w-screen flex flex-col bg-[#060a17] text-slate-100">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {/* Windows Desktop TitleBar */}
          <TitleBar />

          {/* Main Desktop Container below TitleBar */}
          <main className="flex-1 mt-10 overflow-hidden relative flex flex-col">
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
