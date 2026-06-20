import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'
import 'xterm/css/xterm.css'

// start app
createRoot(document.getElementById('root')).render(<App />)