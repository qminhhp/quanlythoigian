import { createContext, useContext, useEffect, useState } from "react";
import { translations, Language } from "./translations";

type LanguageContextType = {
  language: Language;
  t: (section: keyof typeof translations.en, key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [language, setLanguage] = useState<Language>("en");

  // Function to update language based on URL and hostname
  const updateLanguage = () => {
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get("lang");
    if (langParam === "vi" || langParam === "en") {
      setLanguage(langParam);
      return;
    }

    const hostname = window.location.hostname;
    if (
      hostname === "quanlythoigian.com" ||
      hostname.includes("quanlythoigian")
    ) {
      setLanguage("vi");
    } else {
      setLanguage("en");
    }
  };

  // Initial language setup
  useEffect(() => {
    updateLanguage();
  }, []);

  // Watch for URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      updateLanguage();
    };

    window.addEventListener("popstate", handleUrlChange);
    window.addEventListener("pushstate", handleUrlChange);
    window.addEventListener("replacestate", handleUrlChange);

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      window.removeEventListener("pushstate", handleUrlChange);
      window.removeEventListener("replacestate", handleUrlChange);
    };
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
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
