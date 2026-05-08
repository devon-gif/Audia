"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { en } from "@/lib/dictionaries/en";
import { es } from "@/lib/dictionaries/es";
import { Dictionary, Language } from "@/lib/dictionaries";

export { type Language, type Dictionary };

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: Dictionary;
}

const dictionaries: Record<Language, Dictionary> = {
  en,
  es,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "es" : "en"));
  };

  const t = dictionaries[language];

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
