import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { TitleBar } from "@/components/desktop/TitleBar";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale || 'tr';
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {/* Windows Desktop TitleBar */}
      <TitleBar />

      {/* Main Desktop Container below TitleBar */}
      <main className="flex-1 mt-10 overflow-hidden relative flex flex-col">
        {children}
      </main>
    </NextIntlClientProvider>
  );
}
