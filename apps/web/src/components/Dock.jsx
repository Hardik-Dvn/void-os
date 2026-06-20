import React from 'react'

// dock
export default function Dock({ apps, onOpen }) {
  return (
    <div
      className="fixed bottom-2 left-1/2 -translate-x-1/2 backdrop-blur border rounded-2xl px-3 py-2 flex gap-3"
      style={{
        background: 'var(--panel)',
        color: 'var(--fg)',
        borderColor: 'var(--border)'
      }}
    >
      {/* app icons */}
      {apps.map(app => (
        <button
          key={app.id}
          onClick={() => onOpen(app.id)}
          className="px-4 py-2 rounded-xl text-sm"
          style={{
            background: 'rgba(255,255,255,0.08)',
            color: 'var(--fg)'
          }}
        >
          {app.title}
        </button>
      ))}
    </div>
  )
}