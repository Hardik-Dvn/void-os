import React, { useEffect, useState } from 'react'

export default function SettingsApp() {
  const [username, setUsername] = useState('Hardik')
  const [theme, setTheme] = useState('dark')
  const [fontSize, setFontSize] = useState(14)
  const [wallpaper, setWallpaper] = useState('void')
  const [geminiApiKey, setGeminiApiKey] = useState('')

  // load settings
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('voidos-settings') || '{}')

    if (saved.username) setUsername(saved.username)
    if (saved.theme) setTheme(saved.theme)
    if (saved.fontSize) setFontSize(saved.fontSize)
    if (saved.wallpaper) setWallpaper(saved.wallpaper)
    if (saved.geminiApiKey) setGeminiApiKey(saved.geminiApiKey)
  }, [])

  // save settings
  const saveSettings = () => {
    localStorage.setItem(
      'voidos-settings',
      JSON.stringify({
        username,
        theme,
        fontSize,
        wallpaper,
        geminiApiKey
      })
    )

    alert('Settings saved')
  }

  // reset settings
  const resetSettings = () => {
    localStorage.removeItem('voidos-settings')
    location.reload()
  }

  return (
    <div className="p-4 text-sm flex flex-col gap-4 h-full overflow-auto">
      <h2 className="text-lg font-bold">VoidOS Settings</h2>

      <div>
        <label className="block mb-1">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-[var(--border)]"
        />
      </div>

      <div>
        <label className="block mb-1">Theme</label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-[var(--border)]"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>

      <div>
        <label className="block mb-1">Wallpaper</label>
        <select
          value={wallpaper}
          onChange={(e) => setWallpaper(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-[var(--border)]"
        >
          <option value="void">Void Purple</option>
          <option value="nebula">Nebula</option>
          <option value="cosmos">Cosmos</option>
          <option value="cyberpunk">Cyberpunk Neon</option>
          <option value="midnight">Midnight Gradient</option>
          <option value="space">Deep Space</option>
        </select>
      </div>

      <div>
        <label className="block mb-1">Gemini API Key</label>
        <input
          type="text"
          value={geminiApiKey}
          onChange={(e) => setGeminiApiKey(e.target.value)}
          placeholder="AIza..."
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-[var(--border)]"
        />
        <div className="text-xs opacity-70 mt-1">
          Your key is stored locally in your browser.
        </div>
      </div>

      <div>
        <label className="block mb-1">
          Terminal Font Size: {fontSize}px
        </label>
        <input
          type="range"
          min="10"
          max="24"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="flex gap-2 sticky bottom-0 bg-[var(--panel)] py-2">
        <button
          onClick={saveSettings}
          className="px-4 py-2 rounded-xl bg-white/10 border border-[var(--border)]"
        >
          Save Settings
        </button>

        <button
          onClick={resetSettings}
          className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500"
        >
          Reset
        </button>
      </div>
    </div>
  )
}