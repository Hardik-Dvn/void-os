import React from 'react'

// app launcher
export default function Launcher({ apps, onPick, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center" onClick={onClose}>
      <div className="w-[640px] max-w-[90vw] rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4" onClick={e=>e.stopPropagation()}>
        <div className="text-sm opacity-80 mb-2">VoidOS Launcher</div>
        {/* apps */}
        <div className="grid grid-cols-3 gap-3">
          {apps.map(app => (
            <button key={app.id} onClick={() => onPick(app.id)} className="rounded-xl border border-[var(--border)] bg-white/5 hover:bg-white/10 p-4 text-left">
              <div className="font-medium">{app.title}</div>
              <div className="text-xs opacity-70 mt-1">{app.id}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}