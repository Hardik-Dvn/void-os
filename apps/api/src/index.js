import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import { WebSocketServer } from 'ws'
import url from 'url'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import dns from 'dns/promises'

const app = express()
const PORT = process.env.PORT || 4000
const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: ORIGIN, credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

app.get('/api/health', (_req, res) => res.json({ ok: true }))

// auth route
app.get('/api/auth/me', (_req, res) => {
  res.json({ user: { id: 'demo', name: 'Demo User' } })
})

// basic header check
app.get('/api/recon/head', async (req, res) => {
  const target = req.query.url
  if (!target) return res.status(400).send('Missing url')
  try {
    const r = await axios.head(target, { timeout: 5000, validateStatus: () => true })
    const headers = Object.entries(r.headers).map(([k, v]) => `${k}: ${v}`).join('\n')
    res.type('text/plain').send(`Status: ${r.status}\n${headers}`)
  } catch (e) {
    res.status(500).type('text/plain').send(String(e))
  }
})

// dns lookup
app.get('/api/recon/dns', async (req, res) => {
  const target = req.query.domain

  if (!target) {
    return res.status(400).json({ error: 'Missing domain' })
  }

  try {
    const records = await dns.lookup(target, { all: true })

    res.json({
      domain: target,
      records
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// get ip
app.get('/api/recon/ip', async (req, res) => {
  const target = req.query.domain

  if (!target) {
    return res.status(400).json({ error: 'Missing domain' })
  }

  try {
    const result = await dns.lookup(target)

    res.json({
      domain: target,
      ip: result.address,
      family: result.family
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// tech detection
app.get('/api/recon/tech', async (req, res) => {
  const target = req.query.domain

  if (!target) {
    return res.status(400).json({ error: 'Missing domain' })
  }

  try {
    const url = target.startsWith('http')
      ? target
      : `https://${target}`

    const response = await axios.get(url, {
      timeout: 5000,
      validateStatus: () => true
    })

    const headers = response.headers

    const technologies = []

    if (headers.server) {
      technologies.push(`Server: ${headers.server}`)
    }

    if (headers['x-powered-by']) {
      technologies.push(`Powered By: ${headers['x-powered-by']}`)
    }

    if (headers['cf-ray']) {
      technologies.push('Cloudflare')
    }

    if (headers['x-vercel-id']) {
      technologies.push('Vercel')
    }

    if ((response.data || '').includes('__NEXT_DATA__')) {
      technologies.push('Next.js')
    }

    if ((response.data || '').includes('react')) {
      technologies.push('React')
    }

    res.json({
      domain: target,
      status: response.status,
      technologies,
      headers
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// security headers
app.get('/api/recon/security', async (req, res) => {
  const target = req.query.domain

  if (!target) {
    return res.status(400).json({ error: 'Missing domain' })
  }

  try {
    const url = target.startsWith('http')
      ? target
      : `https://${target}`

    const response = await axios.head(url, {
      timeout: 5000,
      validateStatus: () => true
    })

    const headers = response.headers

    res.json({
      hsts: !!headers['strict-transport-security'],
      csp: !!headers['content-security-policy'],
      xfo: !!headers['x-frame-options'],
      xcto: !!headers['x-content-type-options'],
      referrerPolicy: !!headers['referrer-policy'],
      permissionsPolicy: !!headers['permissions-policy']
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

// whois lookup
app.get('/api/recon/whois', (req, res) => {
  const target = req.query.domain

  if (!target) {
    return res.status(400).json({ error: 'Missing domain' })
  }

  exec(`whois ${target}`, { timeout: 10000 }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({
        error: error.message
      })
    }

    res.json({
      domain: target,
      output: stdout || stderr
    })
  })
})

// subdomain finder
app.get('/api/recon/subdomains', async (req, res) => {
  const target = req.query.domain

  if (!target) {
    return res.status(400).json({ error: 'Missing domain' })
  }

  try {
    const response = await axios.get(
      `https://crt.sh/?q=%25.${target}&output=json`,
      { timeout: 10000 }
    )

    const names = new Set()

    for (const item of response.data || []) {
      const value = item.name_value || ''

      value
        .split('\n')
        .map(v => v.trim())
        .filter(Boolean)
        .forEach(v => names.add(v))
    }

    res.json({
      domain: target,
      count: names.size,
      subdomains: [...names].sort()
    })
  } catch (err) {
    res.status(500).json({
      error: String(err)
    })
  }
})

// start api
const server = app.listen(PORT, () => {
  console.log('API listening on', PORT)
})

// terminal socket
const wss = new WebSocketServer({ server, path: '/ws/term' })

wss.on('connection', (ws) => {
  ws.send('VoidOS Terminal Ready\r\n')
  ws.send(`Working directory: ${process.cwd()}\r\n\r\n`)

  ws.on('message', (msg) => {
    const command = msg.toString().trim()

    if (!command) return

    exec(
      command,
      {
        cwd: path.join(process.cwd(), 'workspace')
      },
      (error, stdout, stderr) => {
        if (stdout) ws.send(stdout)
        if (stderr) ws.send(stderr)

        if (error) {
          ws.send(`Error: ${error.message}\r\n`)
        }

        ws.send('\r\n$ ')
      }
    )
  })

  ws.send('$ ')
})
// file list
app.get('/api/files', async (req, res) => {

  try {

    const dir = path.join(process.cwd(), 'workspace')

    const files = fs.readdirSync(dir).map((file) => {

      const stat = fs.statSync(path.join(dir, file))

      return {

        name: file,

        size: stat.size + ' B'

      }

    })

    res.json(files)

  } catch (err) {

    res.status(500).json({

      error: err.message

    })

  }

})
// create file
app.post('/api/files/create', express.json(), (req, res) => {
  try {
    const { name } = req.body

    if (!name) {
      return res.status(400).json({
        error: 'Filename required'
      })
    }

    const filePath = path.join(process.cwd(), 'workspace', name)

    fs.writeFileSync(filePath, '')

    res.json({
      success: true
    })
  } catch (err) {
    res.status(500).json({
      error: err.message
    })
  }
})

// read file
app.get('/api/files/content', (req, res) => {
  try {
    const { name } = req.query

    const filePath = path.join(process.cwd(), 'workspace', name)

    const content = fs.readFileSync(filePath, 'utf8')

    res.json({ content })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// save file
app.post('/api/files/save', (req, res) => {
  try {
    const { name, content } = req.body

    const filePath = path.join(process.cwd(), 'workspace', name)

    fs.writeFileSync(filePath, content || '')

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})