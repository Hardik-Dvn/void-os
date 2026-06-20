import React, { useState } from 'react'
import Window from './Window'
import TerminalApp from '../apps/TerminalApp'
import EditorApp from '../apps/EditorApp'
import FilesApp from '../apps/FilesApp'
import ReconApp from '../apps/ReconApp'
import SettingsApp from '../apps/SettingsApp'
import ShortcutsApp from '../apps/ShortcutsApp'

// ai app
const AIApp = () => {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')

  // send prompt
  const sendPrompt = async () => {
    const settings = JSON.parse(
      localStorage.getItem('voidos-settings') || '{}'
    )

    const apiKey = settings.geminiApiKey

    if (!apiKey) {
      setResponse('Add your Gemini API key in Settings first.')
      return
    }

    try {
      setResponse('Thinking...')

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ]
          })
        }
      )

      const data = await res.json()

      setResponse(
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        JSON.stringify(data, null, 2)
      )
    } catch (err) {
      setResponse('Error: ' + err.message)
    }
  }

  return (
    <div className="p-4 flex flex-col gap-3 h-full">
      <div className="text-lg font-bold">VoidOS AI</div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full h-32 p-3 rounded-xl bg-white/5 border border-[var(--border)]"
        placeholder="Ask Gemini anything..."
      />

      <button
        className="px-4 py-2 rounded-xl bg-white/10 border border-[var(--border)]"
        onClick={sendPrompt}
      >
        Send
      </button>

      <pre className="flex-1 overflow-auto whitespace-pre-wrap p-3 rounded-xl bg-black border border-[var(--border)]">
        {response}
      </pre>
    </div>
  )
}

// app switcher
const AppView = ({ id , currentFile, setCurrentFile  }) => {
  switch(id) {
    case 'terminal': return <TerminalApp />
    case 'editor': return (<EditorApp

      currentFile={currentFile}

    />

  )

     case 'files':

  return (

    <FilesApp

      onOpenFile={setCurrentFile}

    />

  )

    case 'recon': return <ReconApp />
    case 'settings': return <SettingsApp />
    case 'ai': return <AIApp />
    case 'shortcuts': return <ShortcutsApp />
    default: return <div className="p-4">App not found</div>
  }
}

// window manager
export default function WindowManager({
  openApps,
  onClose,
  currentFile,
  setCurrentFile
}) {
  return (
    <div className="relative h-full">
      {openApps.map((app, idx) => (
        <Window key={app.id} title={app.title} initialPos={{x: 100 + 40*idx, y: 80 + 30*idx}} onClose={()=>onClose(app.id)}>
          <AppView

  id={app.id}

  currentFile={currentFile}

  setCurrentFile={setCurrentFile}

/>
        </Window>
      ))}
    </div>
  )
}