/**
 * i18n 翻譯管理 — 支援中英雙語切換
 * 使用方式: t('login') → "登入" 或 "Sign In"
 */
import zh, { TranslationKeys } from './zh';
import en from './en';

type Lang = 'zh' | 'en';

let currentLang: Lang = 'zh';
const translations: Record<Lang, Record<string, string>> = { zh, en };

export function setLanguage(lang: Lang) {
  currentLang = lang;
}

export function getLanguage(): Lang {
  return currentLang;
}

export function t(key: keyof TranslationKeys | string, params?: Record<string, string | number>): string {
  const text = translations[currentLang]?.[key] ?? translations['zh']?.[key] ?? key;
  if (params) {
    return text.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
  }
  return text;
}

export function toggleLanguage(): Lang {
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  return currentLang;
}
