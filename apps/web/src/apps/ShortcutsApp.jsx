export default function ShortcutsApp() {
  // shortcut list
  const shortcuts = [
    ['Ctrl/⌘ + Space', 'Open App Launcher'],
    ['Ctrl/⌘ + 1', 'Open Files'],
    ['Ctrl/⌘ + 2', 'Open Editor'],
    ['Ctrl/⌘ + 3', 'Open Terminal'],
    ['Ctrl/⌘ + 4', 'Open Recon'],
    ['Ctrl/⌘ + ,', 'Open Settings'],
    ['Double Click Title Bar', 'Maximize / Restore'],
    ['Drag To Left Edge', 'Snap Left'],
    ['Drag To Right Edge', 'Snap Right'],
    ['Right Click Desktop', 'Open Context Menu'],
    ['Yellow Button', 'Minimize Window'],
    ['Red Button', 'Close Window']
  ]

  return (
    <div className="p-4 h-full overflow-auto">
      <h2 className="text-xl font-bold mb-4">⌨️ VoidOS Shortcuts</h2>

      <div className="space-y-2">
        {/* render shortcuts */}
        {shortcuts.map(([key, action]) => (
          <div
            key={key}
            className="flex justify-between items-center py-2 border-b border-[var(--border)]"
          >
            <kbd className="px-2 py-1 rounded bg-white/10">
              {key}
            </kbd>
            <span>{action}</span>
          </div>
        ))}
      </div>
    </div>
  )
}