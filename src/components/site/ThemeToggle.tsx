'use client'

import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

const STORAGE_KEY = 'theme'

const getSystemTheme = (): Theme => {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

const getInitialTheme = (): Theme => {
  const storedTheme = window.localStorage.getItem(STORAGE_KEY)

  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme
  }

  return getSystemTheme()
}

const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme
}

export const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const initialTheme = getInitialTheme()

    setTheme(initialTheme)
    applyTheme(initialTheme)
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'

    setTheme(nextTheme)
    applyTheme(nextTheme)
    window.localStorage.setItem(STORAGE_KEY, nextTheme)
  }

  return (
    <button
      aria-label={mounted ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle theme'}
      aria-pressed={mounted ? theme === 'dark' : undefined}
      className="theme-toggle"
      onClick={toggleTheme}
      type="button"
    >
      <span aria-hidden="true">{mounted && theme === 'dark' ? '☾' : '☼'}</span>
      <span>{mounted && theme === 'dark' ? 'Dark' : 'Light'}</span>
    </button>
  )
}
