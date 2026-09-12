import React, { createContext, useContext, useEffect, useState } from 'react'
import { DEFAULT_THEME_ID, THEMES } from '../../themes'

const STORAGE_KEY = 'mba-dashboard-theme'
const VALID_IDS = THEMES.map((t) => t.id)

const ThemeContext = createContext(null)

const getInitialTheme = () => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved && VALID_IDS.includes(saved)) return saved
  } catch (e) {
    // localStorage unavailable (private browsing, etc.) — fall back to default
  }
  return DEFAULT_THEME_ID
}

export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeId] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId)
    try {
      window.localStorage.setItem(STORAGE_KEY, themeId)
    } catch (e) {
      // ignore write failures — theme still applies for this session
    }
  }, [themeId])

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside a ThemeProvider')
  return ctx
}
