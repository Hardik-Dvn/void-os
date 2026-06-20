import React, { useRef, useState, useEffect } from 'react'

// window component
export default function Window({ title, children, initialPos = {x: 120, y: 120}, onClose }) {
  const ref = useRef(null)
  const [pos, setPos] = useState(initialPos)
  const [size, setSize] = useState({ w: 680, h: 420 })
  const [drag, setDrag] = useState(null)
  const [resizing, setResizing] = useState(null)
  const [minimized, setMinimized] = useState(false)
  const [maximized, setMaximized] = useState(false)
  const [restoreState, setRestoreState] = useState(null)
  const [minimizedRestore, setMinimizedRestore] = useState(null)
  const [zIndex, setZIndex] = useState(100)

  // drag and resize
  useEffect(() => {
    const move = (e) => {
      if (drag) {
        const newX = e.clientX - drag.dx
        const newY = e.clientY - drag.dy

        setPos({ x: newX, y: newY })

        // snap left
        if (e.clientX <= 20) {
          setPos({ x: 0, y: 40 })
          setSize({
            w: window.innerWidth / 2,
            h: window.innerHeight - 40
          })
        }

        // snap right
        if (e.clientX >= window.innerWidth - 20) {
          setPos({
            x: window.innerWidth / 2,
            y: 40
          })

          setSize({
            w: window.innerWidth / 2,
            h: window.innerHeight - 40
          })
        }
      } else if (resizing) {
        setSize({ w: Math.max(360, e.clientX - pos.x), h: Math.max(240, e.clientY - pos.y) })
      }
    }
    const up = () => { setDrag(null); setResizing(null) }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
  }, [drag, resizing, pos.x, pos.y])

  // focus window
  const bringToFront = () => {
    setZIndex(Date.now())
  }

  // minimize window
  const toggleMinimize = () => {
    bringToFront()
    if (!minimized) {
      setMinimizedRestore({ pos, size })
      setMinimized(true)

      setPos({
        x: 20,
        y: window.innerHeight - 90
      })

      setSize({
        w: 260,
        h: 40
      })
    } else {
      if (minimizedRestore) {
        setPos(minimizedRestore.pos)
        setSize(minimizedRestore.size)
      }

      setMinimized(false)
    }
  }

  // maximize window
  const toggleMaximize = () => {
    bringToFront()
    if (!maximized) {
      setRestoreState({ pos, size })
      setPos({ x: 0, y: 40 })
      setSize({
        w: window.innerWidth,
        h: window.innerHeight - 40
      })
      setMaximized(true)
    } else {
      if (restoreState) {
        setPos(restoreState.pos)
        setSize(restoreState.size)
      }
      setMaximized(false)
    }
  }

  return (
    <div
      ref={ref}
      onMouseDown={bringToFront}
      className="absolute rounded-2xl shadow-xl border border-[var(--border)] bg-[var(--panel)] overflow-hidden"
      style={{
        left: pos.x,
        top: pos.y,
        width: size.w,
        height: size.h,
        zIndex: maximized ? 999999 : zIndex
      }}
    >
      <div
        className="h-10 cursor-move select-none flex items-center justify-between px-3 border-b border-[var(--border)] bg-black/20"
        onDoubleClick={toggleMaximize}
        onClick={bringToFront}
        onMouseDown={(e) => {
          if (maximized) return
          setDrag({
            dx: e.clientX - pos.x,
            dy: e.clientY - pos.y
          })
        }}
      >
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 cursor-pointer" onClick={onClose} />
          <span
            className="w-3 h-3 rounded-full bg-yellow-500 cursor-pointer"
            onClick={toggleMinimize}
          />
          <span
            className="w-3 h-3 rounded-full bg-green-500 cursor-pointer"
            onClick={toggleMaximize}
          />
        </div>
        <div className="text-sm opacity-80">{title}</div>
        <div />
      </div>
      {!minimized && (
        <div className="w-full h-[calc(100%-2.5rem)] overflow-hidden">
          {children}
        </div>
      )}
      {!minimized && !maximized && (
        <div
          className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize"
          onMouseDown={() => setResizing(true)}
        />
      )}
    </div>
  )
}