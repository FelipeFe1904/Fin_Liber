"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Language } from "./translations"
import { translations } from "./translations"

interface ThemeContextType {
  theme: "light" | "dark"
  toggleTheme: () => void
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: keyof typeof translations.en) => string
  getLocale: () => string
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const savedLanguage = localStorage.getItem("language") as Language | null

    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }

    if (savedLanguage) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: keyof typeof translations.en) => {
    return translations[language][key] || key
  }

  const getLocale = () => {
    return language === "pt" ? "pt-BR" : "en-US"
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, language, setLanguage, t, getLocale }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
