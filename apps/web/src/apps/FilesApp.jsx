import React, { useEffect, useState } from 'react'

export default function FilesApp({ onOpenFile }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)

  const api =
    (import.meta.env.VITE_API_URL || 'http://localhost:4000')
    .replace(/\/$/, '')

  // load files
  const loadFiles = async () => {
    const res = await fetch(`${api}/api/files`)
    const data = await res.json()
    setFiles(data)
    setLoading(false)
  }

  // create file
  const createFile = async () => {
    const name = prompt('File name')
    if (!name) return

    await fetch(`${api}/api/files/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    })

    loadFiles()
  }

  useEffect(() => {
    loadFiles().catch(console.error)
  }, [])

  return (
    <div className="p-3 text-sm h-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="opacity-80">Files</span>
        <button
          onClick={createFile}
          className="px-3 py-1 bg-blue-600 rounded text-white"
        >
          New File
        </button>
      </div>

      <div className="border border-neutral-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Size</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="p-2" colSpan="2">
                  Loading...
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr
                  key={file.name}
                  onDoubleClick={() => {
                    onOpenFile?.(file.name)

                    window.dispatchEvent(
                      new CustomEvent('voidos:open-file', {
                        detail: { file: file.name }
                      })
                    )
                  }}
                  className="border-t border-neutral-700 cursor-pointer"
                >
                  <td className="p-2">{file.name}</td>
                  <td className="p-2">{file.size}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}