import React, { useEffect, useRef, useState } from 'react'
import { MdPalette, MdCheck } from 'react-icons/md'
import { useTheme } from '../context/ThemeContext'

const ThemeSwitcher = () => {
  const { themeId, setThemeId, themes } = useTheme()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  const handleClickOutside = (e) => {
    if (wrapRef.current && !wrapRef.current.contains(e.target)) {
      setOpen(false)
    }
  }

  useEffect(() => {
    if (!open) return undefined

    const listener = (e) => handleClickOutside(e)
    document.addEventListener('mousedown', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
    }
  }, [open])

  const toggleOpen = () => {
    setOpen((prev) => !prev)
  }

  const activeTheme = themes.find((t) => t.id === themeId)

  return (
    <div className="theme-switcher" ref={wrapRef}>
      <button
        type="button"
        className="theme-switcher-trigger"
        onClick={toggleOpen}
        aria-expanded={open}
      >
        <MdPalette />
        <span>Theme</span>
        <span className="theme-switcher-trigger-dots">
          {activeTheme?.swatches.slice(0, 3).map((c, i) => (
            <span key={i} style={{ background: c }} />
          ))}
        </span>
      </button>

      {open && (
        <div className="theme-switcher-panel">
          <p className="theme-switcher-panel-title">Choose a color scheme</p>
          {themes.map((t) => (
            <button
              type="button"
              key={t.id}
              className={`theme-option ${t.id === themeId ? 'theme-option--active' : ''}`}
              onClick={() => {
                setThemeId(t.id)
                setOpen(false)
              }}
            >
              <span className="theme-option-swatches">
                {t.swatches.map((c, i) => (
                  <span key={i} style={{ background: c }} />
                ))}
              </span>
              <span className="theme-option-text">
                <span className="theme-option-name">{t.name}</span>
                <span className="theme-option-desc">{t.description}</span>
              </span>
              {t.id === themeId && <MdCheck className="theme-option-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ThemeSwitcher
