import { createContext, useContext, useState, useEffect } from 'react'
import { fetchSettings } from '../lib/api'

const SettingsContext = createContext({})

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({})

  useEffect(() => {
    fetchSettings()
      .then(data => setSettings(data || {}))
      .catch(() => {})
  }, [])

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
