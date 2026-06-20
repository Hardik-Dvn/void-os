import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

export default function EditorApp({ currentFile }) {
  const [code, setCode] = useState(`// VoidOS editor

function hello() {
  console.log("Hello Hardik");
}

hello();
`);
  const [fileName, setFileName] = useState("");

  const [output, setOutput] = useState("");

  // run code
  const runCode = () => {
    let logs = [];

    const originalLog = console.log;

    console.log = (...args) => {
      logs.push(args.join(" "));
      originalLog(...args);
    };

    try {
      // basic runner
      eval(code);

      setOutput(logs.join("\n") || "Code executed successfully");
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    }

    console.log = originalLog;
  };

  // save file
  const saveFile = async () => {
    if (!fileName) return;

    const api = (
      import.meta.env.VITE_API_URL || 'http://localhost:4000'
    ).replace(/\/$/, '');

    await fetch(`${api}/api/files/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: fileName,
        content: code
      })
    });

    alert('Saved');
  };

  useEffect(() => {
    console.log('Editor currentFile:', currentFile)
    if (!currentFile) return;

    const api = (
      import.meta.env.VITE_API_URL || 'http://localhost:4000'
    ).replace(/\/$/, '');

    fetch(`${api}/api/files/content?name=${encodeURIComponent(currentFile)}`)
      .then((r) => r.json())
      .then((data) => {
        console.log('Loaded file content for', currentFile)
        setCode(data.content || '');
        setFileName(currentFile);
      })
      .catch(console.error);
  }, [currentFile]);

  useEffect(() => {
    const openFile = async (event) => {
      console.log('voidos:open-file event', event.detail)
      const file = event.detail?.file
      if (!file) return

      const api = (
        import.meta.env.VITE_API_URL || 'http://localhost:4000'
      ).replace(/\/$/, '')

      const res = await fetch(
        `${api}/api/files/content?name=${encodeURIComponent(file)}`
      )

      const data = await res.json()

      setCode(data.content || '')
      setFileName(file)
    }

    window.addEventListener('voidos:open-file', openFile)

    return () => {
      window.removeEventListener('voidos:open-file', openFile)
    }
  }, [])

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-2 border-b border-neutral-700 flex gap-2 items-center">
        <button
          onClick={runCode}
          className="px-3 py-1 bg-green-600 rounded text-white"
        >
          Run
        </button>

        <button
          onClick={saveFile}
          className="px-3 py-1 bg-blue-600 rounded text-white"
        >
          Save
        </button>

        <span className="text-sm opacity-70">
          {fileName || 'No file selected'}
        </span>
      </div>

      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code}
          onChange={(value) => setCode(value || "")}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
          }}
        />
      </div>

      <div className="h-32 bg-black text-green-400 p-2 overflow-auto border-t border-neutral-700">
        <pre>{output}</pre>
      </div>
    </div>
  );
}
