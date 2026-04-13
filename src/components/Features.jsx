import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

// ── Syntax Highlighter ────────────────────────────────────────────────────────
const TOKEN_RULES = [
  { type: 'comment', re: /\/\/[^\n]*|\/\*[\s\S]*?\*\//g },
  { type: 'string', re: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g },
  { type: 'preproc', re: /#\s*(include|define|ifdef|ifndef|endif|pragma)\b[^\n]*/g },
  { type: 'keyword', re: /\b(int|float|double|char|void|bool|long|short|unsigned|return|if|else|for|while|do|switch|case|break|continue|struct|typedef|enum|class|public|private|new|delete|nullptr|true|false|NULL|auto|let|const|var|function|import|export|default|async|await|try|catch|def|elif|pass|in|is|not|and|or|lambda|raise|with|as|print)\b/g },
  { type: 'function', re: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g },
  { type: 'number', re: /\b(\d+\.?\d*([eE][+-]?\d+)?[fFlLuU]*|0x[0-9a-fA-F]+)\b/g },
]
const TOKEN_COLOR = { keyword: '#c792ea', function: '#82aaff', string: '#c3e88d', number: '#f78c6c', comment: '#546e7a', preproc: '#ff5572' }

function highlightCode(code) {
  const ranges = []
  for (const rule of TOKEN_RULES) {
    const re = new RegExp(rule.re.source, 'g')
    let m
    while ((m = re.exec(code)) !== null)
      ranges.push({ start: m.index, end: m.index + m[0].length, type: rule.type })
  }
  ranges.sort((a, b) => a.start - b.start)
  const filtered = []; let cursor = 0
  for (const r of ranges) { if (r.start >= cursor) { filtered.push(r); cursor = r.end } }
  const segs = []; let pos = 0
  for (const r of filtered) {
    if (r.start > pos) segs.push({ type: 'plain', value: code.slice(pos, r.start) })
    segs.push({ ...r, value: code.slice(r.start, r.end) }); pos = r.end
  }
  if (pos < code.length) segs.push({ type: 'plain', value: code.slice(pos) })
  return segs
}

function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  const segments = highlightCode(code)
  return (
    <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,245,255,0.15)', margin: '12px 0', boxShadow: '0 0 20px rgba(0,245,255,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: '#161b22', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
          </svg>
          {lang || 'code'}
        </div>
        <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'transparent', border: 'none', color: copied ? '#00F5FF' : 'rgba(255,255,255,0.35)', fontSize: 11, cursor: 'pointer', padding: '3px 7px', borderRadius: 5, fontFamily: 'Poppins, sans-serif', transition: 'all 0.15s' }}>
          {copied
            ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00F5FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Copied!</>
            : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg> Copy code</>
          }
        </button>
      </div>
      <div style={{ background: '#0d1117', padding: '16px 18px', overflowX: 'auto' }}>
        <pre style={{ margin: 0, fontSize: 12, lineHeight: 1.75, color: '#e6edf3', fontFamily: "'Courier New', Consolas, monospace", whiteSpace: 'pre' }}>
          {segments.map((s, i) => <span key={i} style={s.type !== 'plain' ? { color: TOKEN_COLOR[s.type] } : {}}>{s.value}</span>)}
        </pre>
      </div>
    </div>
  )
}

function ResponseRenderer({ text }) {
  const parts = []
  const fenceRe = /```(\w*)\n?([\s\S]*?)```/g
  let last = 0, m
  while ((m = fenceRe.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: 'text', value: text.slice(last, m.index) })
    parts.push({ type: 'code', lang: m[1] || 'code', value: m[2].trimEnd() })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ type: 'text', value: text.slice(last) })
  return (
    <div>
      {parts.map((part, i) => {
        if (part.type === 'code') return <CodeBlock key={i} lang={part.lang} code={part.value} />
        const inlineRe = /`([^`]+)`/g
        const textParts = []; let tLast = 0, tm
        while ((tm = inlineRe.exec(part.value)) !== null) {
          if (tm.index > tLast) textParts.push(<span key={tLast}>{part.value.slice(tLast, tm.index)}</span>)
          textParts.push(<code key={tm.index} style={{ background: 'rgba(0,245,255,0.08)', color: '#00F5FF', padding: '1px 5px', borderRadius: 4, fontSize: 11, fontFamily: 'monospace' }}>{tm[1]}</code>)
          tLast = tm.index + tm[0].length
        }
        if (tLast < part.value.length) textParts.push(<span key={tLast}>{part.value.slice(tLast)}</span>)
        return <p key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'Poppins, sans-serif', margin: '4px 0' }}>{textParts}</p>
      })}
    </div>
  )
}

// ── Backend proxy at /api/chat — API key lives server-side in .env ────────────

const callAI = async (system, userMsg) => {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      system,
      messages: [{ role: 'user', content: userMsg }],
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || 'API error')
  return data.content?.map(c => c.text || '').join('') || ''
}

// ── 1. VOICE ASSISTANT ───────────────────────────────────────────────────────
function VoiceModal() {
  const [status, setStatus] = useState('idle') // idle | listening | thinking | speaking
  const [transcript, setTranscript] = useState('')
  const [reply, setReply] = useState('')
  const [error, setError] = useState('')
  const recogRef = useRef(null)

  const speak = (text) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 1.05; utt.pitch = 1.1
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.lang === 'en-US')
    if (preferred) utt.voice = preferred
    utt.onend = () => setStatus('idle')
    setStatus('speaking')
    window.speechSynthesis.speak(utt)
  }

  const startListening = useCallback(() => {
    setError(''); setTranscript(''); setReply('')
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setError('Speech recognition not supported in this browser. Try Chrome.'); return }
    const recog = new SR()
    recog.lang = 'en-US'; recog.interimResults = true; recog.maxAlternatives = 1
    recog.onstart = () => setStatus('listening')
    recog.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('')
      setTranscript(t)
      if (recogRef.current) recogRef.current.lastTranscript = t
    }
    recog.onend = async () => {
      setStatus('thinking')
      try {
        const text = recogRef.current?.lastTranscript || transcript || ''
        if (!text.trim()) { setStatus('idle'); return }
        const answer = await callAI(
          'You are AIO AI, a futuristic voice-controlled intelligence system. Respond concisely in 2-3 sentences, confident and slightly futuristic in tone.',
          text
        )
        setReply(answer)
        speak(answer)
      } catch (e) { setError(e.message); setStatus('idle') }
    }
    recog.onerror = (e) => { setError(`Mic error: ${e.error}`); setStatus('idle') }
    recogRef.current = recog
    recog.start()
  }, [transcript])

  const stop = () => { recogRef.current?.stop(); window.speechSynthesis?.cancel(); setStatus('idle') }

  const statusColors = { idle: '#555', listening: '#00F5FF', thinking: '#7B61FF', speaking: '#00FF99' }
  const statusLabels = { idle: 'TAP MIC TO SPEAK', listening: 'LISTENING...', thinking: 'PROCESSING...', speaking: 'SPEAKING...' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '10px 0' }}>
      <div style={{ position: 'relative' }}>
        <motion.button
          animate={status === 'listening' ? { scale: [1, 1.12, 1], boxShadow: ['0 0 20px rgba(0,245,255,0.4)', '0 0 50px rgba(0,245,255,0.8)', '0 0 20px rgba(0,245,255,0.4)'] } : {}}
          transition={{ duration: 1.2, repeat: Infinity }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={status === 'idle' ? startListening : stop}
          style={{
            width: 90, height: 90, borderRadius: '50%',
            background: status === 'listening' ? 'radial-gradient(circle, rgba(0,245,255,0.3), rgba(0,245,255,0.05))' : 'rgba(255,255,255,0.05)',
            border: `2px solid ${statusColors[status]}`,
            cursor: 'pointer', fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s',
          }}
        >
          {status === 'thinking' ? '🧠' : status === 'speaking' ? '🔊' : '🎙️'}
        </motion.button>
      </div>
      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 3, color: statusColors[status], transition: 'color 0.3s' }}>
        {statusLabels[status]}
      </div>
      {transcript && (
        <div style={{ width: '100%', background: 'rgba(0,245,255,0.05)', border: '0.5px solid rgba(0,245,255,0.2)', borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ fontSize: 10, color: 'rgba(0,245,255,0.5)', fontFamily: 'Orbitron, monospace', letterSpacing: 2, marginBottom: 6 }}>YOU SAID</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{transcript}</div>
        </div>
      )}
      {reply && (
        <div style={{ width: '100%', background: 'rgba(123,97,255,0.06)', border: '0.5px solid rgba(123,97,255,0.25)', borderRadius: 10, padding: '12px 16px' }}>
          <div style={{ fontSize: 10, color: 'rgba(123,97,255,0.7)', fontFamily: 'Orbitron, monospace', letterSpacing: 2, marginBottom: 8 }}>AIO AI RESPONSE</div>
          <ResponseRenderer text={reply} />
        </div>
      )}
      {error && <div style={{ fontSize: 13, color: '#FF6B6B', textAlign: 'center' }}>{error}</div>}
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.6 }}>
        Powered by Web Speech API + Gemini AI · Works best in Chrome
      </div>
    </div>
  )
}

// ── 2. SMART AUTOMATION ──────────────────────────────────────────────────────
function AutomationModal() {
  const [task, setTask] = useState('')
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [executing, setExecuting] = useState(-1)
  const [done, setDone] = useState(false)

  const generate = async () => {
    if (!task.trim()) return
    setLoading(true); setPlan(null); setDone(false); setExecuting(-1)
    try {
      const raw = await callAI(
        'You are AIO AI\'s automation engine. When given a task, respond ONLY with a JSON array of 4-5 automation steps. Each step: {"step": "Step title", "action": "What AIO AI does", "duration": number_of_ms_between_200_and_900}. No markdown, no explanation, just the JSON array.',
        task
      )
      const clean = raw.replace(/```json|```/g, '').trim()
      const steps = JSON.parse(clean)
      setPlan(steps)
      // Auto-execute each step
      for (let i = 0; i < steps.length; i++) {
        setExecuting(i)
        await new Promise(r => setTimeout(r, steps[i].duration || 600))
      }
      setExecuting(-1); setDone(true)
    } catch (e) {
      setPlan([{ step: 'Error', action: e.message, duration: 0 }])
    } finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={task}
          onChange={e => setTask(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && generate()}
          placeholder="e.g. Send weekly report to team..."
          style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: 13, outline: 'none' }}
        />
        <motion.button whileTap={{ scale: 0.96 }} onClick={generate} disabled={loading || !task.trim()}
          style={{ background: loading ? 'rgba(0,245,255,0.3)' : 'linear-gradient(135deg,#00F5FF,#7B61FF)', color: '#0B0F1A', border: 'none', padding: '12px 18px', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
          {loading ? '...' : '⚡ Run'}
        </motion.button>
      </div>
      {plan && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {plan.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, background: executing === i ? 'rgba(0,245,255,0.08)' : i < executing || done ? 'rgba(0,255,100,0.05)' : 'rgba(255,255,255,0.02)', border: `0.5px solid ${executing === i ? 'rgba(0,245,255,0.4)' : i < executing || done ? 'rgba(0,255,100,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 10, padding: '12px 16px', transition: 'all 0.3s' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: executing === i ? '#00F5FF' : i < executing || done ? '#00FF88' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: executing === i || i < executing || done ? '#0B0F1A' : 'rgba(255,255,255,0.4)', fontWeight: 700, flexShrink: 0, transition: 'all 0.3s' }}>
                {executing === i ? '⟳' : i < executing || done ? '✓' : i + 1}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: executing === i ? '#00F5FF' : 'rgba(255,255,255,0.8)', fontFamily: 'Orbitron, monospace', fontSize: 11, letterSpacing: 0.5 }}>{s.step}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.action}</div>
              </div>
            </motion.div>
          ))}
          {done && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: '14px', background: 'rgba(0,255,100,0.05)', border: '0.5px solid rgba(0,255,100,0.3)', borderRadius: 10 }}>
              <span style={{ color: '#00FF88', fontFamily: 'Orbitron, monospace', fontSize: 12, letterSpacing: 2 }}>✓ AUTOMATION COMPLETE</span>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

// ── 3. MULTI-DEVICE INTEGRATION ──────────────────────────────────────────────
function DeviceModal() {
  const devices = [
    { id: 'phone', icon: '📱', name: 'Mobile', type: 'iPhone 16 Pro' },
    { id: 'laptop', icon: '💻', name: 'Laptop', type: 'MacBook Pro' },
    { id: 'watch', icon: '⌚', name: 'Watch', type: 'Galaxy Watch 7' },
    { id: 'tablet', icon: '📟', name: 'Tablet', type: 'iPad Pro' },
    { id: 'tv', icon: '📺', name: 'Smart TV', type: 'Samsung 8K' },
  ]
  const [synced, setSynced] = useState(['phone'])
  const [syncing, setSyncing] = useState(null)
  const [payload, setPayload] = useState('{ "theme": "dark", "lang": "en", "ai_mode": "pro" }')
  const [log, setLog] = useState([{ time: new Date().toLocaleTimeString(), msg: 'Device mesh initialized' }])

  const addLog = (msg) => setLog(l => [{ time: new Date().toLocaleTimeString(), msg }, ...l.slice(0, 4)])

  const toggle = async (id) => {
    if (synced.includes(id)) {
      setSynced(s => s.filter(x => x !== id))
      addLog(`${devices.find(d => d.id === id).name} disconnected`)
      return
    }
    setSyncing(id)
    await new Promise(r => setTimeout(r, 900))
    setSynced(s => [...s, id])
    setSyncing(null)
    addLog(`${devices.find(d => d.id === id).name} synced — state propagated`)
  }

  const syncAll = async () => {
    for (const d of devices) {
      if (!synced.includes(d.id)) {
        setSyncing(d.id)
        await new Promise(r => setTimeout(r, 500))
        setSynced(s => [...s, d.id])
        setSyncing(null)
        addLog(`${d.name} joined the mesh`)
      }
    }
    addLog('All devices synced — zero-latency mesh active')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {devices.map(d => (
          <motion.button key={d.id} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => toggle(d.id)}
            style={{ flex: '1 1 80px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 10px', background: synced.includes(d.id) ? 'rgba(0,245,255,0.08)' : 'rgba(255,255,255,0.02)', border: `0.5px solid ${synced.includes(d.id) ? 'rgba(0,245,255,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}>
            {syncing === d.id && <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', inset: -1, borderRadius: 12, border: '1px solid transparent', borderTopColor: '#00F5FF' }} />}
            <span style={{ fontSize: 22 }}>{d.icon}</span>
            <span style={{ fontSize: 10, fontFamily: 'Orbitron, monospace', color: synced.includes(d.id) ? '#00F5FF' : 'rgba(255,255,255,0.4)', letterSpacing: 0.5 }}>{d.name}</span>
            <span style={{ fontSize: 9, color: synced.includes(d.id) ? 'rgba(0,245,255,0.5)' : 'rgba(255,255,255,0.2)' }}>{synced.includes(d.id) ? '● LINKED' : '○ OFFLINE'}</span>
          </motion.button>
        ))}
      </div>
      <textarea value={payload} onChange={e => setPayload(e.target.value)}
        style={{ background: 'rgba(0,0,0,0.3)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', color: 'rgba(0,245,255,0.7)', fontFamily: 'monospace', fontSize: 12, resize: 'none', outline: 'none', height: 60 }} />
      <div style={{ display: 'flex', gap: 10 }}>
        <motion.button whileTap={{ scale: 0.97 }} onClick={syncAll}
          style={{ flex: 1, background: 'linear-gradient(135deg,#00F5FF,#7B61FF)', color: '#0B0F1A', border: 'none', padding: '11px', borderRadius: 10, fontFamily: 'Poppins,sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          🔗 Sync All Devices
        </motion.button>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 12px', overflow: 'hidden' }}>
          {log.slice(0, 3).map((l, i) => (
            <div key={i} style={{ fontSize: 10, color: i === 0 ? 'rgba(0,245,255,0.7)' : 'rgba(255,255,255,0.25)', fontFamily: 'monospace', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              [{l.time}] {l.msg}
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
        {synced.length}/{devices.length} devices in mesh · State propagation: &lt;10ms
      </div>
    </div>
  )
}

// ── 4. ADAPTIVE INTELLIGENCE ─────────────────────────────────────────────────
function AdaptiveModal() {
  const [memory, setMemory] = useState([])
  const [input, setInput] = useState('')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({ interactions: 0, topics: [] })

  const chat = async () => {
    if (!input.trim()) return
    setLoading(true)
    const context = memory.map(m => `User said: "${m.user}". AI learned: "${m.insight}"`).join('\n')
    try {
      const res = await callAI(
        `You are AIO AI's Adaptive Intelligence engine. You learn from every interaction.
        ${context ? `\nWhat you've learned so far:\n${context}` : ''}
        After your main response, on a NEW LINE, write exactly: LEARNED: [one short insight about this user's interests/style in under 10 words]`,
        input
      )
      const [main, learnedLine] = res.split(/\nLEARNED:/i)
      const insight = learnedLine?.trim() || 'User is curious and engaged'
      setMemory(m => [...m, { user: input, insight }])
      setReply(main.trim())
      setProfile(p => ({ interactions: p.interactions + 1, topics: [...new Set([...p.topics, input.split(' ')[0]])] }))
    } catch (e) { setReply('Error: ' + e.message) }
    finally { setLoading(false); setInput('') }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 120px', background: 'rgba(0,245,255,0.05)', border: '0.5px solid rgba(0,245,255,0.2)', borderRadius: 10, padding: '10px 14px' }}>
          <div style={{ fontSize: 9, color: 'rgba(0,245,255,0.5)', fontFamily: 'Orbitron,monospace', letterSpacing: 2, marginBottom: 4 }}>INTERACTIONS</div>
          <div style={{ fontSize: 28, fontFamily: 'Orbitron,monospace', fontWeight: 900, color: '#00F5FF' }}>{profile.interactions}</div>
        </div>
        <div style={{ flex: '2 1 180px', background: 'rgba(123,97,255,0.05)', border: '0.5px solid rgba(123,97,255,0.2)', borderRadius: 10, padding: '10px 14px' }}>
          <div style={{ fontSize: 9, color: 'rgba(123,97,255,0.5)', fontFamily: 'Orbitron,monospace', letterSpacing: 2, marginBottom: 6 }}>LEARNED ABOUT YOU</div>
          {memory.length === 0 ? <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>No data yet — start chatting</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {memory.slice(-3).map((m, i) => (
                <div key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'flex', gap: 6 }}><span style={{ color: '#7B61FF' }}>›</span>{m.insight}</div>
              ))}
            </div>
          )}
        </div>
      </div>
      {reply && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px' }}>
          <ResponseRenderer text={reply} />
        </div>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && chat()}
          placeholder="Talk to AIO AI — it remembers you..."
          style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontFamily: 'Poppins,sans-serif', fontSize: 13, outline: 'none' }} />
        <motion.button whileTap={{ scale: 0.96 }} onClick={chat} disabled={loading || !input.trim()}
          style={{ background: loading ? 'rgba(123,97,255,0.3)' : 'linear-gradient(135deg,#7B61FF,#00F5FF)', color: '#0B0F1A', border: 'none', padding: '12px 18px', borderRadius: 10, fontFamily: 'Poppins,sans-serif', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '🧠' : 'Learn'}
        </motion.button>
      </div>
    </div>
  )
}

// ── 5. OFFLINE MODE ──────────────────────────────────────────────────────────
function OfflineModal() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [queue, setQueue] = useState([])
  const [taskInput, setTaskInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [log, setLog] = useState([])

  useEffect(() => {
    const on = () => { setIsOnline(true); flushQueue() }
    const off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  const flushQueue = async () => {
    if (queue.length === 0) return
    setProcessing(true)
    for (const task of queue) {
      await new Promise(r => setTimeout(r, 500))
      setLog(l => [...l, { text: `✓ Processed: "${task}"`, color: '#00FF88' }])
    }
    setQueue([])
    setProcessing(false)
  }

  const addTask = async () => {
    if (!taskInput.trim()) return
    if (!isOnline) {
      setQueue(q => [...q, taskInput])
      setLog(l => [...l, { text: `📦 Queued offline: "${taskInput}"`, color: '#FEBC2E' }])
    } else {
      setLog(l => [...l, { text: `⚡ Executed instantly: "${taskInput}"`, color: '#00F5FF' }])
    }
    setTaskInput('')
  }

  const simulate = () => {
    setIsOnline(v => {
      const next = !v
      setLog(l => [...l, { text: next ? '🌐 Network restored — flushing queue...' : '📡 Network lost — offline mode active', color: next ? '#00FF88' : '#FF6B6B' }])
      if (next && queue.length > 0) setTimeout(flushQueue, 300)
      return next
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: isOnline ? 'rgba(0,255,100,0.06)' : 'rgba(255,100,100,0.06)', border: `0.5px solid ${isOnline ? 'rgba(0,255,100,0.3)' : 'rgba(255,100,100,0.3)'}`, borderRadius: 10, padding: '12px 16px' }}>
          <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: 10, height: 10, borderRadius: '50%', background: isOnline ? '#00FF88' : '#FF6B6B', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 12, fontFamily: 'Orbitron,monospace', color: isOnline ? '#00FF88' : '#FF6B6B', letterSpacing: 1 }}>{isOnline ? 'ONLINE' : 'OFFLINE MODE ACTIVE'}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{isOnline ? 'Full connectivity · Cloud sync active' : `${queue.length} task${queue.length !== 1 ? 's' : ''} queued for sync`}</div>
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={simulate}
          style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins,sans-serif', fontSize: 12, cursor: 'pointer' }}>
          {isOnline ? '📴 Go Offline' : '🌐 Go Online'}
        </motion.button>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <input value={taskInput} onChange={e => setTaskInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder={isOnline ? 'Run a task...' : 'Queue a task for when online...'}
          style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: '#fff', fontFamily: 'Poppins,sans-serif', fontSize: 13, outline: 'none' }} />
        <motion.button whileTap={{ scale: 0.96 }} onClick={addTask}
          style={{ background: isOnline ? 'linear-gradient(135deg,#00F5FF,#7B61FF)' : 'linear-gradient(135deg,#FEBC2E,#FF6B6B)', color: '#0B0F1A', border: 'none', padding: '12px 18px', borderRadius: 10, fontFamily: 'Poppins,sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          {isOnline ? '⚡ Run' : '📦 Queue'}
        </motion.button>
      </div>
      {log.length > 0 && (
        <div style={{ background: 'rgba(0,0,0,0.3)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px', maxHeight: 120, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {log.slice(-6).reverse().map((l, i) => (
            <div key={i} style={{ fontSize: 12, color: l.color, fontFamily: 'monospace' }}>{l.text}</div>
          ))}
        </div>
      )}
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
        Local processing engine · Tasks auto-sync on reconnect
      </div>
    </div>
  )
}

// ── 6. ANTI-GRAVITY INTERFACE ────────────────────────────────────────────────
function AntiGravityModal() {
  const W = 460, H = 300
  const NODES_INIT = [
    { id: 1, label: '🧠 Neural', x: 160, y: 80, vx: 0.6, vy: 0.4, color: '#00F5FF', r: 28 },
    { id: 2, label: '📡 IoT', x: 300, y: 140, vx: -0.5, vy: 0.6, color: '#7B61FF', r: 24 },
    { id: 3, label: '⚡ Power', x: 90, y: 190, vx: 0.7, vy: -0.5, color: '#FEBC2E', r: 22 },
    { id: 4, label: '🔐 Secure', x: 240, y: 220, vx: -0.4, vy: -0.7, color: '#FF6B6B', r: 26 },
    { id: 5, label: '☁️ Cloud', x: 370, y: 70, vx: -0.6, vy: 0.5, color: '#00FF88', r: 23 },
    { id: 6, label: '🔮 Quantum', x: 200, y: 150, vx: 0.3, vy: -0.6, color: '#FF88FF', r: 20 },
  ]

  const nodesRef = useRef(NODES_INIT.map(n => ({ ...n })))
  const dragRef = useRef(null)
  const svgRef = useRef(null)
  const rafRef = useRef(null)
  const [tick, setTick] = useState(0)
  const [grabbed, setGrabbed] = useState(null)
  const [pulseId, setPulseId] = useState(null)

  // Physics loop
  useEffect(() => {
    const step = () => {
      const ns = nodesRef.current
      // Update positions
      ns.forEach(n => {
        if (dragRef.current === n.id) return
        n.x += n.vx; n.y += n.vy
        // Bounce off walls
        if (n.x - n.r < 0) { n.x = n.r; n.vx = Math.abs(n.vx) }
        if (n.x + n.r > W) { n.x = W - n.r; n.vx = -Math.abs(n.vx) }
        if (n.y - n.r < 0) { n.y = n.r; n.vy = Math.abs(n.vy) }
        if (n.y + n.r > H) { n.y = H - n.r; n.vy = -Math.abs(n.vy) }
      })
      // Node-node repulsion
      for (let i = 0; i < ns.length; i++) {
        for (let j = i + 1; j < ns.length; j++) {
          const a = ns[i], b = ns[j]
          const dx = b.x - a.x, dy = b.y - a.y
          const dist = Math.max(1, Math.hypot(dx, dy))
          const minDist = a.r + b.r + 10
          if (dist < minDist) {
            const force = (minDist - dist) / minDist * 0.5
            const fx = (dx / dist) * force, fy = (dy / dist) * force
            if (dragRef.current !== a.id) { a.vx -= fx; a.vy -= fy }
            if (dragRef.current !== b.id) { b.vx += fx; b.vy += fy }
          }
        }
      }
      // Speed limit
      ns.forEach(n => {
        const spd = Math.hypot(n.vx, n.vy)
        if (spd > 1.8) { n.vx = n.vx / spd * 1.8; n.vy = n.vy / spd * 1.8 }
        if (spd < 0.2 && dragRef.current !== n.id) { n.vx += (Math.random() - 0.5) * 0.1; n.vy += (Math.random() - 0.5) * 0.1 }
      })
      setTick(t => t + 1)
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Drag handlers
  const onMouseDown = (e, id) => {
    e.preventDefault()
    dragRef.current = id
    setGrabbed(id)
    setPulseId(id)
    setTimeout(() => setPulseId(null), 600)
  }

  const onMouseMove = useCallback((e) => {
    if (!dragRef.current || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const scaleX = W / rect.width
    const x = Math.max(30, Math.min(W - 30, (e.clientX - rect.left) * scaleX))
    const y = Math.max(30, Math.min(H - 30, (e.clientY - rect.top) * scaleX))
    const n = nodesRef.current.find(n => n.id === dragRef.current)
    if (n) { n.x = x; n.y = y; n.vx = 0; n.vy = 0 }
  }, [])

  const onMouseUp = useCallback(() => {
    const n = nodesRef.current.find(n => n.id === dragRef.current)
    if (n) { n.vx = (Math.random() - 0.5) * 2; n.vy = (Math.random() - 0.5) * 2 }
    dragRef.current = null
    setGrabbed(null)
  }, [])

  // Touch support
  const onTouchStart = (e, id) => { e.preventDefault(); dragRef.current = id; setGrabbed(id) }
  const onTouchMove = useCallback((e) => {
    if (!dragRef.current || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const scaleX = W / rect.width
    const touch = e.touches[0]
    const x = Math.max(30, Math.min(W - 30, (touch.clientX - rect.left) * scaleX))
    const y = Math.max(30, Math.min(H - 30, (touch.clientY - rect.top) * scaleX))
    const n = nodesRef.current.find(n => n.id === dragRef.current)
    if (n) { n.x = x; n.y = y; n.vx = 0; n.vy = 0 }
  }, [])
  const onTouchEnd = onMouseUp

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [onMouseMove, onMouseUp, onTouchMove, onTouchEnd])

  const ns = nodesRef.current

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, letterSpacing: 3, color: 'rgba(0,245,255,0.5)', textAlign: 'center' }}>
        ANTI-GRAVITY SPATIAL UI — DRAG & RELEASE NODES
      </div>

      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
        style={{ background: 'radial-gradient(ellipse at center, rgba(0,20,40,0.95) 0%, rgba(11,15,26,1) 100%)', border: '0.5px solid rgba(0,245,255,0.12)', borderRadius: 16, cursor: grabbed ? 'grabbing' : 'default', userSelect: 'none' }}>

        {/* Grid dots */}
        {Array.from({ length: 12 }, (_, col) =>
          Array.from({ length: 8 }, (_, row) => (
            <circle key={`${col}-${row}`} cx={col * 42} cy={row * 42} r={0.8} fill="rgba(0,245,255,0.08)" />
          ))
        )}

        {/* Connection lines with glow effect */}
        {ns.map((a, i) => ns.slice(i + 1).map(b => {
          const dist = Math.hypot(b.x - a.x, b.y - a.y)
          const maxDist = 200
          if (dist > maxDist) return null
          const alpha = (1 - dist / maxDist) * 0.6
          const midColor = a.color
          return (
            <line key={`${a.id}-${b.id}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={midColor}
              strokeWidth={alpha > 0.4 ? 1.5 : 0.5}
              strokeOpacity={alpha}
            />
          )
        }))}

        {/* Nodes */}
        {ns.map(n => (
          <g key={n.id}
            transform={`translate(${n.x},${n.y})`}
            onMouseDown={e => onMouseDown(e, n.id)}
            onTouchStart={e => onTouchStart(e, n.id)}
            style={{ cursor: grabbed === n.id ? 'grabbing' : 'grab' }}>

            {/* Outer glow ring */}
            <circle r={n.r + 10} fill={`${n.color}08`} />
            {/* Pulse when grabbed */}
            {pulseId === n.id && <circle r={n.r + 20} fill="none" stroke={n.color} strokeWidth={1} strokeOpacity={0.4} />}
            {/* Main body */}
            <circle r={n.r} fill={`${n.color}18`} stroke={n.color} strokeWidth={grabbed === n.id ? 2 : 1} />
            {/* Inner bright dot */}
            <circle r={4} fill={n.color} fillOpacity={0.9} />
            {/* Label */}
            <text x={0} y={n.r + 14} textAnchor="middle"
              style={{ fontSize: 9, fill: n.color, fontFamily: 'Orbitron,monospace', letterSpacing: 0.5, pointerEvents: 'none' }}>
              {n.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Live node coordinates */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {ns.map(n => (
          <div key={n.id} style={{ fontSize: 9, padding: '3px 9px', borderRadius: 20, background: `${n.color}12`, border: `0.5px solid ${n.color}44`, color: n.color, fontFamily: 'Orbitron,monospace', letterSpacing: 0.3 }}>
            {n.label.split(' ')[1]} {Math.round(n.x)},{Math.round(n.y)}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.6 }}>
        Physics-based floating nodes · Grab & throw · Connection strength = proximity
      </div>
    </div>
  )
}

// ── MODAL WRAPPER ────────────────────────────────────────────────────────────
function Modal({ feature, onClose }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  const PANELS = {
    voice: <VoiceModal />,
    automation: <AutomationModal />,
    devices: <DeviceModal />,
    adaptive: <AdaptiveModal />,
    offline: <OfflineModal />,
    antigravity: <AntiGravityModal />,
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 520, background: '#0D1120', border: `0.5px solid ${feature.borderColor}`, borderRadius: 20, padding: 28, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{feature.icon}</div>
            <h3 style={{ fontFamily: 'Orbitron,monospace', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{feature.title}</h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 300, lineHeight: 1.5, maxWidth: 360 }}>{feature.desc}</p>
          </div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            ×
          </motion.button>
        </div>
        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', paddingTop: 20 }}>
          {PANELS[feature.id]}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── MAIN FEATURES COMPONENT ──────────────────────────────────────────────────
const features = [
  { id: 'voice', icon: '🎙️', title: 'Voice Assistant', desc: 'Neural STT + TTS with real-time processing. Hands-free command in 40+ languages with contextual awareness.', borderColor: 'rgba(0,245,255,0.25)', badge: 'LIVE MIC + AI' },
  { id: 'automation', icon: '⚡', title: 'Smart Automation', desc: 'Context-aware task automation that learns your patterns and executes decisions proactively without prompting.', borderColor: 'rgba(0,245,255,0.25)', badge: 'AI POWERED' },
  { id: 'devices', icon: '🔗', title: 'Multi-Device Integration', desc: 'Seamless sync across all connected devices with zero-latency state management and unified control plane.', borderColor: 'rgba(123,97,255,0.25)', badge: 'LIVE SYNC' },
  { id: 'adaptive', icon: '🧠', title: 'Adaptive Intelligence', desc: 'On-device ML models that evolve with each interaction — smarter every day, entirely private, entirely yours.', borderColor: 'rgba(123,97,255,0.25)', badge: 'LEARNS YOU' },
  { id: 'offline', icon: '📡', title: 'Offline Mode', desc: 'Full core functionality without internet. Local processing keeps you operational anywhere on the planet.', borderColor: 'rgba(0,245,255,0.25)', badge: 'REAL NETWORK' },
  { id: 'antigravity', icon: '🚀', title: 'Anti-Gravity Interface', desc: 'Spatial UI technology projecting controls into 3D space — the first interface to eliminate physical constraints.', borderColor: 'rgba(123,97,255,0.25)', badge: 'INTERACTIVE 3D' },
]

export default function Features() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [active, setActive] = useState(null)

  return (
    <section id="features" ref={ref} style={{ padding: '100px 40px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 4, color: '#00F5FF', marginBottom: 12 }}>// CAPABILITIES</div>
        <h2 style={{ fontFamily: 'Orbitron, monospace', fontSize: 'clamp(24px,3vw,40px)', fontWeight: 700, marginBottom: 14 }}>
          Core <span style={{ color: '#00F5FF' }}>Features</span>
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', maxWidth: 480, lineHeight: 1.7, marginBottom: 16, fontWeight: 300 }}>
          Engineered with adaptive intelligence across every layer of human-machine interaction.
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,245,255,0.06)', border: '0.5px solid rgba(0,245,255,0.2)', borderRadius: 20, padding: '5px 14px', marginBottom: 48 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00F5FF', display: 'inline-block', animation: 'pulse 1.2s ease-in-out infinite' }} />
          <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, letterSpacing: 2, color: '#00F5FF' }}>CLICK ANY FEATURE TO ACTIVATE</span>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {features.map((f, i) => (
          <motion.div key={f.id}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -6, borderColor: f.borderColor, background: 'rgba(0,245,255,0.04)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActive(f)}
            style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '32px 28px', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,245,255,0.08)', border: '0.5px solid rgba(0,245,255,0.2)', borderRadius: 20, padding: '3px 10px', fontFamily: 'Orbitron,monospace', fontSize: 8, letterSpacing: 1.5, color: '#00F5FF' }}>
              {f.badge}
            </div>
            <div style={{ fontSize: 32, marginBottom: 18, filter: 'drop-shadow(0 0 10px rgba(0,245,255,0.4))' }}>{f.icon}</div>
            <h3 style={{ fontFamily: 'Orbitron, monospace', fontSize: 13, fontWeight: 700, marginBottom: 12, letterSpacing: 0.5 }}>{f.title}</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, fontWeight: 300, marginBottom: 20 }}>{f.desc}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#00F5FF', fontSize: 12, fontFamily: 'Orbitron,monospace', letterSpacing: 1 }}>
              <span>LAUNCH</span>
              <span>→</span>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {active && <Modal feature={active} onClose={() => setActive(null)} />}
      </AnimatePresence>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </section>
  )
}
