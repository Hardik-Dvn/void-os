import React, { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'

export default function TerminalApp() {
  const ref = useRef(null)
  const termRef = useRef(null)
  const socketRef = useRef(null)

  // terminal setup
  useEffect(() => {
    const term = new Terminal({ convertEol: true, fontSize: 14 })
    term.open(ref.current)
    termRef.current = term

    // websocket connection
    const url = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')
    const wsUrl = url.replace('http', 'ws') + '/ws/term'
    const ws = new WebSocket(wsUrl)
    socketRef.current = ws

    ws.onopen = () => {
      term.writeln('VoidOS Terminal Connected')
    }
    ws.onmessage = (ev) => term.write(ev.data)
    ws.onclose = () => term.writeln('\r\n[disconnected]')

    // current command
    let commandBuffer = ''

    // terminal input
    const disp = term.onData((data) => {
      if (data === '\r') {
        term.write('\r\n')

        if (ws.readyState === 1) {
          ws.send(commandBuffer)
        }

        commandBuffer = ''
        return
      }

      if (data === '\u007F') {
        if (commandBuffer.length > 0) {
          commandBuffer = commandBuffer.slice(0, -1)
          term.write('\b \b')
        }
        return
      }

      commandBuffer += data
      term.write(data)
    })

    // cleanup
    return () => {
      disp.dispose()
      ws.close()
      term.dispose()
    }
  }, [])

  return <div className="w-full h-full p-2"><div ref={ref} className="w-full h-full bg-black rounded-xl overflow-hidden" /></div>
}