import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import i18n from '@/i18n'

export type Theme = 'light' | 'dark' | 'system'
export type Language = 'fr' | 'en'

const STORAGE_THEME = 'laundrymap_theme'
const STORAGE_LANG  = 'laundrymap_lang'

interface PreferencesContextValue {
  theme: Theme
  language: Language
  setTheme: (theme: Theme) => void
  setLanguage: (lang: Language) => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(STORAGE_THEME) as Theme) ?? 'system'
  )
  const [language, setLanguageState] = useState<Language>(
    () => (localStorage.getItem(STORAGE_LANG) as Language) ?? 'fr'
  )

  useEffect(() =>{
    const root = document.documentElement
    const mq = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
     root.classList.toggle('dark', theme === 'dark' || (theme === 'system' && mq.matches))
   }
    apply()
    if (theme !== 'system') {
      return 
    }
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)

  }, [theme]) 

  function setTheme(t: Theme) {
    setThemeState(t)
    localStorage.setItem(STORAGE_THEME, t)
  }

  function setLanguage(lang: Language) {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_LANG, lang)
    i18n.changeLanguage(lang)
  }

  return (
    <PreferencesContext.Provider value={{ theme, language, setTheme, setLanguage }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences doit être utilisé dans PreferencesProvider')
  return ctx
}
