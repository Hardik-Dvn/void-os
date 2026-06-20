import React, { useState } from 'react'

export default function ReconApp() {
  const [target, setTarget] = useState('example.com')
  const [output, setOutput] = useState('')

  const api = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '')

  // fetch helper
  const fetchJson = async (url) => {
    try {
      const res = await fetch(url)
      const text = await res.text()

      try {
        const json = JSON.parse(text)
        setOutput(JSON.stringify(json, null, 2))
      } catch {
        setOutput(text)
      }
    } catch (err) {
      setOutput('Request failed: ' + err.message)
    }
  }

  // http headers
  const runHead = async () => {
    const res = await fetch(
      api + '/api/recon/head?url=' + encodeURIComponent('https://' + target)
    )
    const text = await res.text()
    setOutput(text)
  }

  // ip lookup
  const runIP = async () => {
    await fetchJson(
      api + '/api/recon/ip?domain=' + encodeURIComponent(target)
    )
  }

  // dns lookup
  const runDNS = async () => {
    await fetchJson(
      api + '/api/recon/dns?domain=' + encodeURIComponent(target)
    )
  }

  // whois lookup
  const runWhois = async () => {
    try {
      const res = await fetch(
        api + '/api/recon/whois?domain=' + encodeURIComponent(target)
      )

      const text = await res.text()

      console.log('WHOIS response:', text)
      setOutput(text)
    } catch (err) {
      setOutput('WHOIS failed: ' + err.message)
    }
  }

  // subdomains
  const runSubdomains = async () => {
    await fetchJson(
      api + '/api/recon/subdomains?domain=' + encodeURIComponent(target)
    )
  }

  // tech detect
  const runTech = async () => {
    await fetchJson(
      api + '/api/recon/tech?domain=' + encodeURIComponent(target)
    )
  }

  // security check
  const runSecurity = async () => {
    await fetchJson(
      api + '/api/recon/security?domain=' + encodeURIComponent(target)
    )
  }

  // ssl info
  const runSSL = async () => {
    await fetchJson(
      api + '/api/recon/ssl?domain=' + encodeURIComponent(target)
    )
  }

  // generate report
  const runReport = async () => {
    try {
      setOutput('Generating report...')

      const [ipRes, techRes, secRes, subRes] = await Promise.all([
        fetch(api + '/api/recon/ip?domain=' + encodeURIComponent(target)),
        fetch(api + '/api/recon/tech?domain=' + encodeURIComponent(target)),
        fetch(api + '/api/recon/security?domain=' + encodeURIComponent(target)),
        fetch(api + '/api/recon/subdomains?domain=' + encodeURIComponent(target))
      ])

      const ip = await ipRes.json()
      const tech = await techRes.json()
      const sec = await secRes.json()
      const sub = await subRes.json()

      let score = 100
      if (!sec.hsts) score -= 10
      if (!sec.csp) score -= 15
      if (!sec.xfo) score -= 10
      if (!sec.xcto) score -= 10

      const report = `
TARGET: ${target}

RISK SCORE: ${score}/100

NETWORK
-------
IP: ${ip.ip || 'Unknown'}

TECHNOLOGY
----------
${(tech.technologies || []).join('\n') || 'No technology detected'}

SECURITY
--------
HSTS: ${sec.hsts ? 'YES' : 'NO'}
CSP: ${sec.csp ? 'YES' : 'NO'}
XFO: ${sec.xfo ? 'YES' : 'NO'}
XCTO: ${sec.xcto ? 'YES' : 'NO'}

RECON
-----
Subdomains Found: ${sub.count || 0}

SUMMARY
-------
Target appears to be reachable and scanned successfully.
`

      setOutput(report)
    } catch (err) {
      setOutput('Report generation failed: ' + err.message)
    }
  }

  // placeholder
  const notImplemented = (feature) => {
    setOutput(`${feature}\n\nComing soon.`)
  }

  return (
    <div className="p-3 text-sm h-full flex flex-col gap-2">
      <div className="opacity-80">VoidOS Recon</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <input
          className="col-span-2 md:col-span-4 px-3 py-2 rounded-xl bg-white/5 border border-[var(--border)] w-full"
          value={target}
          onChange={e => setTarget(e.target.value)}
        />
        <button className="w-full px-2 py-2 text-xs rounded-xl bg-white/10 border border-[var(--border)] hover:bg-white/20" onClick={runHead}>HTTP HEAD</button>

        <button
          className="w-full px-2 py-2 text-xs rounded-xl bg-white/10 border border-[var(--border)] hover:bg-white/20"
          onClick={runIP}
        >
          IP Lookup
        </button>

        <button
          className="w-full px-2 py-2 text-xs rounded-xl bg-white/10 border border-[var(--border)] hover:bg-white/20"
          onClick={runDNS}
        >
          DNS Lookup
        </button>

        <button
          className="w-full px-2 py-2 text-xs rounded-xl bg-white/10 border border-[var(--border)] hover:bg-white/20"
          onClick={runWhois}
        >
          WHOIS
        </button>

        <button
          className="w-full px-2 py-2 text-xs rounded-xl bg-white/10 border border-[var(--border)] hover:bg-white/20"
          onClick={runTech}
        >
          Tech Detect
        </button>

        <button
          className="w-full px-2 py-2 text-xs rounded-xl bg-white/10 border border-[var(--border)] hover:bg-white/20"
          onClick={runSubdomains}
        >
          Subdomains
        </button>

        <button
          className="w-full px-2 py-2 text-xs rounded-xl bg-white/10 border border-[var(--border)] hover:bg-white/20"
          onClick={runSecurity}
        >
          Security Audit
        </button>
        <button
          className="w-full px-2 py-2 text-xs rounded-xl bg-white/10 border border-[var(--border)] hover:bg-white/20"
          onClick={runSSL}
        >
          SSL Info
        </button>
        <button
          className="w-full px-2 py-2 text-xs rounded-xl bg-white/10 border border-[var(--border)] hover:bg-white/20"
          onClick={runReport}
        >
          Generate Report
        </button>
      </div>
      <pre className="flex-1 overflow-auto whitespace-pre-wrap break-words p-3 rounded-xl bg-black border border-[var(--border)]">
        {output}
      </pre>
    </div>
  )
}