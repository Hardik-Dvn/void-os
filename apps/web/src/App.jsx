import React, { useEffect, useState } from "react";
import WindowManager from "./components/WindowManager";
import Dock from "./components/Dock";
import Launcher from "./components/Launcher";

const apps = [
  { id: "files", title: "Files" },
  { id: "editor", title: "Editor" },
  { id: "terminal", title: "Terminal" },
  { id: "recon", title: "Recon" },
  { id: "settings", title: "Settings" },
  { id: "ai", title: "AI Assistant" },
  { id: "shortcuts", title: "Shortcuts" },
];

export default function App() {
  const [openApps, setOpenApps] = useState([]);
  const [showLauncher, setShowLauncher] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [wallpaper, setWallpaper] = useState('void');
  const [contextMenu, setContextMenu] = useState(null)
  const [now, setNow] = useState(new Date())

  // open app
  const openApp = (id) => {
    if (!openApps.find((a) => a.id === id)) {
      setOpenApps([
        ...openApps,
        { id, title: id.charAt(0).toUpperCase() + id.slice(1) },
      ]);
    }
  };

  // close app
  const closeApp = (id) => setOpenApps(openApps.filter((a) => a.id !== id));

  // open file in editor
  const openEditorForFile = (event) => {
    const file = event.detail?.file

    if (file) {
      setCurrentFile(file)
    }

    setOpenApps((apps) => {
      if (apps.find((a) => a.id === 'editor')) return apps
      return [...apps, { id: 'editor', title: 'Editor' }]
    })
  }

  // load settings
  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem('voidos-settings') || '{}'
    )
    if (saved.wallpaper && wallpapers[saved.wallpaper]) {
      setWallpaper(saved.wallpaper)
    } else {
      setWallpaper('void')
    }

    if (saved.theme === 'light') {
      document.documentElement.style.setProperty('--bg', '#f5f5f5')
      document.documentElement.style.setProperty('--fg', '#111111')
      document.documentElement.style.setProperty('--border', '#d4d4d4')
      document.documentElement.style.setProperty('--panel', '#ffffff')
    } else {
      document.documentElement.style.setProperty('--bg', '#0f172a')
      document.documentElement.style.setProperty('--fg', '#ffffff')
      document.documentElement.style.setProperty('--border', '#334155')
      document.documentElement.style.setProperty('--panel', '#141419')
    }

    const handler = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return

      if (e.code === 'Space') {
        e.preventDefault()
        setShowLauncher((v) => !v)
        return
      }

      const appMap = {
        Digit1: 'files',
        Digit2: 'editor',
        Digit3: 'terminal',
        Digit4: 'recon'
      }

      if (appMap[e.code]) {
        e.preventDefault()
        openApp(appMap[e.code])
        return
      }

      if (e.key === ',') {
        e.preventDefault()
        openApp('settings')
      }
    }

    window.addEventListener('keydown', handler)
    window.addEventListener('voidos:open-file', openEditorForFile)

    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => {
      window.removeEventListener('keydown', handler)
      window.removeEventListener('voidos:open-file', openEditorForFile)
      clearInterval(timer)
    }
  }, [])

  // wallpapers
  const wallpapers = {
    void: 'linear-gradient(135deg,#05010f,#3b0764,#7c3aed)',
    nebula: 'linear-gradient(135deg,#020617,#312e81,#7e22ce)',
    cosmos: 'linear-gradient(135deg,#000000,#111827,#4c1d95)',
    cyberpunk: 'linear-gradient(135deg,#2e1065,#6d28d9,#c026d3)',
    midnight: 'linear-gradient(135deg,#030712,#111827,#1e1b4b)',
    space: 'linear-gradient(135deg,#020617,#172554,#312e81)'
  }

  return (
    <div
      className="h-screen w-screen text-[var(--fg)]"
      style={{
        background: wallpapers[wallpaper] || wallpapers.void
      }}
    >
      <div className="fixed top-0 left-0 right-0 h-10 flex items-center justify-between px-3 text-sm border-b border-[var(--border)] backdrop-blur"
        style={{ background: 'var(--panel)', color: 'var(--fg)' }}>
        <div className="font-medium">
          VoidOS
        </div>
        <div className="flex items-center gap-6 text-right">
          <div className="opacity-80">VoidOS v1</div>

          <div className="leading-tight">
            <div className="font-medium">
              {now.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>

            <div className="text-xs opacity-70">
              {now.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>
      <div
        className="pt-10 pb-16 h-full relative"
        onContextMenu={(e) => {
          e.preventDefault()
          setContextMenu({ x: e.clientX, y: e.clientY })
        }}
        onClick={() => setContextMenu(null)}
      >
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{ zIndex: 1 }}
        >
          <img
            src="/voidos-logo.png"
            alt="VoidOS"
            style={{
              width: '320px',
              opacity: 0.18,
              filter: 'drop-shadow(0 0 25px rgba(168,85,247,0.6))'
            }}
          />
        </div>

        <WindowManager
          style={{ zIndex: 10 }}
          openApps={openApps}
          onClose={closeApp}
          currentFile={currentFile}
          setCurrentFile={setCurrentFile}
        />
        {/* desktop menu */}
        {contextMenu && (
          <div
            className="absolute bg-[var(--panel)] border border-[var(--border)] rounded-xl p-2 z-[99999] min-w-[180px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              className="block w-full text-left px-3 py-2 hover:bg-white/10 rounded"
              onClick={() => openApp('settings')}
            >
              ⚙️ Personalize
            </button>

            <button
              className="block w-full text-left px-3 py-2 hover:bg-white/10 rounded"
              onClick={() => openApp('shortcuts')}
            >
              ⌨️ Keyboard Shortcuts
            </button>

            <button
              className="block w-full text-left px-3 py-2 hover:bg-white/10 rounded"
              onClick={() => openApp('terminal')}
            >
              💻 Open Terminal
            </button>

            <button
              className="block w-full text-left px-3 py-2 hover:bg-white/10 rounded"
              onClick={() => openApp('files')}
            >
              📁 Open Files
            </button>

            <div className="my-1 border-t border-[var(--border)]" />

            <button
              className="block w-full text-left px-3 py-2 hover:bg-white/10 rounded"
              onClick={() => {
                localStorage.setItem(
                  'voidos-settings',
                  JSON.stringify({
                    ...JSON.parse(localStorage.getItem('voidos-settings') || '{}'),
                    wallpaper: 'void'
                  })
                )
                window.location.reload()
              }}
            >
              🟣 Void Purple Wallpaper
            </button>

            <button
              className="block w-full text-left px-3 py-2 hover:bg-white/10 rounded"
              onClick={() => {
                localStorage.setItem(
                  'voidos-settings',
                  JSON.stringify({
                    ...JSON.parse(localStorage.getItem('voidos-settings') || '{}'),
                    wallpaper: 'nebula'
                  })
                )
                window.location.reload()
              }}
            >
              🌌 Nebula Wallpaper
            </button>

            <button
              className="block w-full text-left px-3 py-2 hover:bg-white/10 rounded"
              onClick={() => {
                localStorage.setItem(
                  'voidos-settings',
                  JSON.stringify({
                    ...JSON.parse(localStorage.getItem('voidos-settings') || '{}'),
                    theme: 'light'
                  })
                )
                window.location.reload()
              }}
            >
              ☀️ Light Theme
            </button>

            <button
              className="block w-full text-left px-3 py-2 hover:bg-white/10 rounded"
              onClick={() => {
                localStorage.setItem(
                  'voidos-settings',
                  JSON.stringify({
                    ...JSON.parse(localStorage.getItem('voidos-settings') || '{}'),
                    theme: 'dark'
                  })
                )
                window.location.reload()
              }}
            >
              🌙 Dark Theme
            </button>

            <div className="my-1 border-t border-[var(--border)]" />

            <button
              className="block w-full text-left px-3 py-2 hover:bg-white/10 rounded"
              onClick={() => window.location.reload()}
            >
              🔄 Refresh Desktop
            </button>
          </div>
        )}
      </div>
      <Dock apps={apps} onOpen={openApp} />
      {showLauncher && (
        <Launcher
          apps={apps}
          onPick={(id) => {
            openApp(id);
            setShowLauncher(false);
          }}
          onClose={() => setShowLauncher(false)}
        />
      )}
    </div>
  );
}
