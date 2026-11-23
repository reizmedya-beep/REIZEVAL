import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  const chosenLocale = locale || 'tr';
  return {
    locale: chosenLocale,
    messages: (await import(`./messages/${chosenLocale}.json`)).default,
  };
});
