import { createContext, useContext, useEffect, useState } from "react";
import { translations, Language } from "./translations";

type LanguageContextType = {
  language: Language;
  t: (section: keyof typeof translations.en, key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    // Set language based on domain
    const hostname = window.location.hostname;
    if (hostname === "quanlythoigian.com") {
      setLanguage("vi");
    } else {
      setLanguage("en");
    }
  }, []);

  const t = (section: keyof typeof translations.en, key: string): string => {
    return (
      translations[language][section]?.[key] ||
      translations.en[section]?.[key] ||
      key
    );
  };

  return (
    <LanguageContext.Provider value={{ language, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
