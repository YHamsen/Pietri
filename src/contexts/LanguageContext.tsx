'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import t, { Lang, Translations } from '@/i18n/translations';

interface LanguageCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  tr: Translations;
}

const LanguageContext = createContext<LanguageCtx>({
  lang: 'fr',
  setLang: () => {},
  tr: t['fr'] as Translations,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr');

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('pietri_lang')) as Lang | null;
    if (saved && (saved === 'fr' || saved === 'en' || saved === 'es')) {
      setLangState(saved);
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('pietri_lang', l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, tr: t[lang] as Translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
