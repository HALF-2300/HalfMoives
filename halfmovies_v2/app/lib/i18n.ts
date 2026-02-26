export const locales = ['ar', 'en', 'es'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ar';

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export async function getDictionary(locale: Locale) {
  switch (locale) {
    case 'ar':
      return import('../../public/locales/ar/common.json').then((m) => m.default);
    case 'es':
      return import('../../public/locales/es/common.json').then((m) => m.default);
    default:
      return import('../../public/locales/en/common.json').then((m) => m.default);
  }
}
