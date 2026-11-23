import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  const chosenLocale = locale || 'tr';
  return {
    messages: (await import(`./messages/${chosenLocale}.json`)).default,
  };
});
