import { useState, useEffect } from 'react';

type Language = 'en' | 'hi' | 'mr';

let globalLanguage: Language = 'en';
const listeners: Array<(lang: Language) => void> = [];

export function setChatLanguage(lang: Language) {
  globalLanguage = lang;
  listeners.forEach(listener => listener(lang));
}

export function useChatLanguage() {
  const [language, setLanguage] = useState<Language>(globalLanguage);

  useEffect(() => {
    const newListener = (lang: Language) => {
      setLanguage(lang);
    };
    listeners.push(newListener);

    // Set initial language state
    setLanguage(globalLanguage);

    return () => {
      const index = listeners.indexOf(newListener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return { language, setLanguage };
}
