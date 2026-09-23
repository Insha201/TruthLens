import React, { createContext, useContext, useState } from 'react';
import { Lang, translate } from '../i18n/translations';

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Look up a UI string in the active language. */
  t: (key: string) => string;
  /** Subject-domain label in the active language. */
  td: (domain: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'truthlens_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'hi' || saved === 'mr') return saved;
    } catch {
      // storage can be unavailable (private mode); fall through to default
    }
    return 'en';
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // non-fatal: the choice simply will not persist across reloads
    }
    document.documentElement.setAttribute('lang', l);
  };

  const t = (key: string) => translate(lang, key);
  const td = (domain: string) => translate(lang, `domain.${domain || 'other'}`);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, td }}>{children}</LanguageContext.Provider>
  );
};

/** Safe outside a provider: falls back to English rather than throwing. */
export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      lang: 'en',
      setLang: () => {},
      t: (key: string) => translate('en', key),
      td: (domain: string) => translate('en', `domain.${domain || 'other'}`),
    };
  }
  return ctx;
};
