import path from 'node:path';

export const i18n = {
  defaultLocale: 'ar',
  locales: ['ar', 'en', 'es'],
  localeDetection: true
};

const isDev = process.env.NODE_ENV === 'development';

export default {
  i18n,
  localePath: path.resolve('./public/locales'),
  reloadOnPrerender: isDev,
  strictMode: true
};
