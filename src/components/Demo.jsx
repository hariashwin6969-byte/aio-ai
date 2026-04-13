import { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

// ─── Syntax Highlighter ───────────────────────────────────────────────────────
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

// ─── Inline Code Block Component ─────────────────────────────────────────────
function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  const segments = highlightCode(code)
  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,245,255,0.15)', margin: '14px 0', boxShadow: '0 0 24px rgba(0,245,255,0.04)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 16px', background: '#161b22', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
          </svg>
          {lang || 'code'}
        </div>
        <button onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: copied ? '#00F5FF' : 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', padding: '4px 8px', borderRadius: 6, fontFamily: 'Poppins, sans-serif', transition: 'all 0.15s' }}>
          {copied ? (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00F5FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Copied!</>
          ) : (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg> Copy code</>
          )}
        </button>
      </div>
      {/* Code */}
      <div style={{ background: '#0d1117', padding: '18px 20px', overflowX: 'auto' }}>
        <pre style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: '#e6edf3', fontFamily: "'Courier New', Consolas, monospace", whiteSpace: 'pre' }}>
          {segments.map((s, i) => (
            <span key={i} style={s.type !== 'plain' ? { color: TOKEN_COLOR[s.type] } : {}}>{s.value}</span>
          ))}
        </pre>
      </div>
    </div>
  )
}

// ─── Smart Response Renderer ──────────────────────────────────────────────────
// Parses AI response text and renders code blocks with syntax highlighting
// and explanation sections below each code block.
function ResponseRenderer({ text }) {
  // Split on ```lang ... ``` fences
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
        if (part.type === 'code') {
          return <CodeBlock key={i} lang={part.lang} code={part.value} />
        }
        // Render plain text — style inline `code` snippets
        const inlineRe = /`([^`]+)`/g
        const textParts = []; let tLast = 0, tm
        while ((tm = inlineRe.exec(part.value)) !== null) {
          if (tm.index > tLast) textParts.push(<span key={tLast}>{part.value.slice(tLast, tm.index)}</span>)
          textParts.push(<code key={tm.index} style={{ background: 'rgba(0,245,255,0.08)', color: '#00F5FF', padding: '1px 6px', borderRadius: 4, fontSize: 12, fontFamily: 'monospace' }}>{tm[1]}</code>)
          tLast = tm.index + tm[0].length
        }
        if (tLast < part.value.length) textParts.push(<span key={tLast}>{part.value.slice(tLast)}</span>)
        return (
          <p key={i} style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.9, fontWeight: 300, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'Poppins, sans-serif', margin: '6px 0' }}>
            {textParts}
          </p>
        )
      })}
    </div>
  )
}

const MODES = [
  {
    id: 'generate',
    icon: '⚡',
    label: 'Generate',
    desc: 'Ask anything',
    color: '#00F5FF',
    system: `You are AIO AI — a highly intelligent, all-knowing assistant expert in every field of coding and general knowledge.

CODING EXPERTISE:
- Languages: Python, JavaScript, TypeScript, Java, C, C++, C#, Rust, Go, Kotlin, Swift, PHP, Ruby, R, MATLAB, Dart, Scala, Haskell, Bash/Shell, SQL, HTML, CSS, Assembly
- Frontend: React, Next.js, Vue 3, Angular, Svelte, Tailwind CSS, Bootstrap, HTML5, CSS3, WebGL, Three.js, GSAP, Framer Motion
- Backend: Node.js, Express, FastAPI, Django, Flask, Spring Boot, Laravel, NestJS, Hono, tRPC, GraphQL, REST, WebSockets, gRPC
- Databases: MySQL, PostgreSQL, MongoDB, Redis, SQLite, Firebase, Supabase, Prisma ORM, Mongoose, DynamoDB, Cassandra
- DevOps & Cloud: Docker, Kubernetes, CI/CD pipelines, GitHub Actions, Jenkins, Nginx, Apache, Linux/Unix, AWS, Azure, GCP, Vercel, Netlify
- Mobile: React Native, Flutter, Android (Kotlin/Java), iOS (Swift/SwiftUI), Expo
- AI & ML: TensorFlow, PyTorch, scikit-learn, HuggingFace, LangChain, OpenCV, Pandas, NumPy, Ollama, Gemma, GPT APIs
- Security: OWASP Top 10, JWT, OAuth2, CORS, XSS, SQL Injection, CSRF, Encryption, HTTPS, SSL/TLS
- Core CS: Data Structures, Algorithms, Big-O, Design Patterns, OOP, Functional Programming, System Design, Clean Code

GENERAL KNOWLEDGE:
- Mathematics, Sciences, History, Geography, Economics, Philosophy, Psychology, Writing, Reasoning

BEHAVIOR:
- Always give complete, working, accurate answers
- For code: full solutions with comments and language-tagged code blocks
- For bugs: identify root cause first, then fix
- Show time and space complexity for algorithms
- Be direct and precise — no filler, no hallucinations
- Use modern best practices`,
  },
  {
    id: 'code',
    icon: '💻',
    label: 'Code',
    desc: 'Debug & build',
    color: '#7B61FF',
    system: `You are AIO AI's dedicated Code Helper — an expert software engineer with mastery of every programming language and framework.

You help with:
- Writing new code from scratch (any language, any framework)
- Debugging and fixing broken code — always explain the root cause
- Code reviews — spot bugs, bad practices, performance issues
- Explaining code line by line in simple terms
- Converting code between languages
- Algorithm design with time/space complexity analysis
- Architecture advice: microservices, design patterns, system design

Rules:
- Always use proper code blocks with language tags
- Write complete, runnable solutions — never partial snippets
- Add concise comments to explain key logic
- State time and space complexity for algorithms
- If input code has bugs, list all bugs found before showing the fix`,
  },
  {
    id: 'summarize',
    icon: '📋',
    label: 'Summarize',
    desc: 'Extract key ideas',
    color: '#00F5FF',
    system: `You are AIO AI's Summarization Engine — an expert at distilling any content to its essential meaning.

Output format:
**Title:** (infer from content)
**Core Idea:** (1 sentence)
**Key Points:**
• Point 1
• Point 2
• Point 3
**Takeaway:** (1 actionable insight)

Rules:
- Be ruthlessly concise
- If no text provided, ask user to paste content
- Adapt depth to length: short texts = 2-3 bullets, long texts = up to 6`,
  },
  {
    id: 'notes',
    icon: '📝',
    label: 'Notes',
    desc: 'Structure & organize',
    color: '#7B61FF',
    system: `You are AIO AI's Smart Notes System — you convert raw input into perfectly structured, actionable notes.

Output format:
📌 **Title:** (clear, specific)
**Overview:** (1-2 sentences)
**Key Concepts:**
• Concept 1: brief explanation
• Concept 2: brief explanation
**Action Items:**
☐ Action 1
☐ Action 2
**Quick Reference:** (formulas, commands, or key terms)

Rules:
- Structure must always be clean and scannable
- Action items must be concrete and achievable
- Adapt to content type: lecture → learning notes, meeting → task notes, code → implementation notes`,
  },
]

const SUGGESTIONS = {
  generate: ['Explain quantum computing', 'How does the internet work?', 'What is blockchain?'],
  code: ['Fix my React useEffect bug', 'Write a binary search in Python', 'Explain Big O notation'],
  summarize: ['Paste an article to summarize', 'Summarize a research paper', 'Key points from this text'],
  notes: ['Create notes from my lecture', 'Organize my meeting notes', 'Study notes for React hooks'],
}

// ─── Supported file types ─────────────────────────────────────────────────────
const SUPPORTED_EXTS = [
  '.txt', '.md', '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp',
  '.cs', '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.html', '.css',
  '.json', '.xml', '.csv', '.yaml', '.yml', '.sh', '.sql', '.env', '.toml', '.ini',
]
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']
const IMAGE_MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp', '.bmp': 'image/bmp', '.svg': 'image/svg+xml' }

const getFileIcon = (name) => {
  const ext = '.' + name.split('.').pop().toLowerCase()
  if (IMAGE_EXTS.includes(ext)) return '🖼️'
  if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) return '📜'
  if (['.py'].includes(ext)) return '🐍'
  if (['.html', '.css'].includes(ext)) return '🌐'
  if (['.json', '.yaml', '.yml', '.toml'].includes(ext)) return '⚙️'
  if (['.md', '.txt'].includes(ext)) return '📄'
  if (['.c', '.cpp', '.cs', '.java', '.go', '.rs'].includes(ext)) return '⚡'
  if (['.sql'].includes(ext)) return '🗄️'
  if (['.sh'].includes(ext)) return '💻'
  return '📎'
}

const isImageFile = (name) => IMAGE_EXTS.includes('.' + name.split('.').pop().toLowerCase())

export default function Demo() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('generate')
  const [error, setError] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [copied, setCopied] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState([])
  const [fileError, setFileError] = useState('')
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)
  const outputRef = useRef(null)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const activeMode = MODES.find(m => m.id === mode)

  useEffect(() => { setCharCount(input.length) }, [input])

  useEffect(() => {
    if (output && outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [output])

  const handleInput = (e) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + 'px'
    }
  }

  const handleFileChange = (e) => {
    setFileError('')
    const files = Array.from(e.target.files)
    if (!files.length) return
    files.forEach(file => {
      const ext = '.' + file.name.split('.').pop().toLowerCase()
      const isImage = IMAGE_EXTS.includes(ext)
      if (!isImage && !SUPPORTED_EXTS.includes(ext)) {
        setFileError(`"${file.name}" not supported. Text, code, or image files only.`)
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setFileError(`"${file.name}" too large. Max 5MB.`)
        return
      }
      const reader = new FileReader()
      if (isImage) {
        reader.onload = (ev) => {
          const originalDataUrl = ev.target.result
          // LLaVA only supports jpeg/png — convert everything else via canvas
          const needsConversion = !['.jpg', '.jpeg', '.png'].includes(ext)
          if (needsConversion) {
            const img = new Image()
            img.onload = () => {
              const canvas = document.createElement('canvas')
              canvas.width = img.width
              canvas.height = img.height
              const ctx = canvas.getContext('2d')
              ctx.drawImage(img, 0, 0)
              const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92)
              const base64 = jpegDataUrl.split(',')[1]
              setAttachedFiles(prev =>
                prev.find(f => f.name === file.name) ? prev : [
                  ...prev,
                  { name: file.name, content: null, base64, mimeType: 'image/jpeg', size: file.size, isImage: true, preview: jpegDataUrl }
                ]
              )
            }
            img.src = originalDataUrl
          } else {
            const base64 = originalDataUrl.split(',')[1]
            setAttachedFiles(prev =>
              prev.find(f => f.name === file.name) ? prev : [
                ...prev,
                { name: file.name, content: null, base64, mimeType: IMAGE_MIME[ext] || 'image/jpeg', size: file.size, isImage: true, preview: originalDataUrl }
              ]
            )
          }
        }
        reader.readAsDataURL(file)
      } else {
        if (file.size > 500 * 1024) {
          setFileError(`"${file.name}" too large. Max 500KB for text files.`)
          return
        }
        reader.onload = (ev) => {
          setAttachedFiles(prev =>
            prev.find(f => f.name === file.name) ? prev : [...prev, { name: file.name, content: ev.target.result, size: file.size, isImage: false }]
          )
        }
        reader.readAsText(file)
      }
    })
    e.target.value = ''
  }

  const removeFile = (name) => setAttachedFiles(prev => prev.filter(f => f.name !== name))

  const run = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || loading) return
    setLoading(true); setOutput(''); setError('')
    try {
      const imageFiles = attachedFiles.filter(f => f.isImage)
      const textFiles = attachedFiles.filter(f => !f.isImage)

      let userMessage = input.trim()
      if (textFiles.length > 0) {
        const fileContext = textFiles.map(f =>
          `=== FILE: ${f.name} ===\n${f.content}\n=== END OF ${f.name} ===`
        ).join('\n\n')
        userMessage = fileContext + (userMessage
          ? `\n\nUser question: ${userMessage}`
          : '\n\nPlease analyse the above file(s) and provide insights, explanations, or suggestions.')
      }

      // Build message payload — include images if present
      let messagePayload
      if (imageFiles.length > 0) {
        const contentParts = imageFiles.map(img => ({
          type: 'image',
          mimeType: img.mimeType,
          base64: img.base64,
          name: img.name,
        }))
        messagePayload = {
          role: 'user',
          content: userMessage || 'Please analyse this image and describe what you see in detail.',
          images: contentParts,
        }
      } else {
        messagePayload = { role: 'user', content: userMessage }
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: activeMode.system, messages: [messagePayload] }),
      })
      const data = await res.json()
      const errorMsg = typeof data?.error === 'string' ? data.error : data?.error?.message
      if (!res.ok) throw new Error(errorMsg || `API error ${res.status}`)
      setOutput(data.content?.map(c => c.text || '').join('') || 'No response received.')
    } catch (e) {
      setError(e.message || 'Connection error. Is your backend running?')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); run() }
  }

  const handleSuggestion = (s) => {
    setInput(s)
    if (textareaRef.current) textareaRef.current.focus()
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="demo" ref={ref} style={{ padding: '120px 24px', maxWidth: 900, margin: '0 auto' }}>

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        style={{ marginBottom: 64 }}
      >
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(123,97,255,0.08)', border: '1px solid rgba(123,97,255,0.2)',
          borderRadius: 100, padding: '6px 16px', marginBottom: 24,
        }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: '50%', background: '#7B61FF', boxShadow: '0 0 8px #7B61FF' }}
          />
          <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, letterSpacing: 3, color: '#7B61FF' }}>LIVE DEMO</span>
        </div>

        <h2 style={{ fontFamily: 'Orbitron, monospace', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 16 }}>
          Experience<br />
          <span style={{ background: 'linear-gradient(90deg, #00F5FF, #7B61FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AIO Intelligence
          </span>
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 420, lineHeight: 1.8, fontWeight: 300 }}>
          Real AI. Zero latency. Ask anything — from deep code to general knowledge.
        </p>
      </motion.div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.15 }}
        style={{
          background: 'rgba(255,255,255,0.018)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 24, overflow: 'hidden',
          boxShadow: '0 40px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(0,0,0,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#FF5F57', '#FEBC2E', '#28C840'].map(c => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.8 }} />
              ))}
            </div>
            <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, letterSpacing: 2.5, color: 'rgba(255,255,255,0.2)', marginLeft: 6 }}>
              AIO · TERMINAL v2.0
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 6, height: 6, borderRadius: '50%', background: '#00F5FF' }} />
            <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, letterSpacing: 2, color: '#00F5FF' }}>ONLINE</span>
          </div>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {MODES.map((m, i) => (
            <motion.button
              key={m.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setMode(m.id); setOutput(''); setError('') }}
              style={{
                position: 'relative',
                background: mode === m.id ? 'rgba(255,255,255,0.04)' : 'transparent',
                border: 'none',
                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                borderBottom: mode === m.id ? `2px solid ${m.color}` : '2px solid transparent',
                padding: '18px 12px', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}
            >
              <span style={{ fontSize: 18 }}>{m.icon}</span>
              <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, letterSpacing: 1.5, color: mode === m.id ? m.color : 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }}>
                {m.label}
              </span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'Poppins, sans-serif' }}>{m.desc}</span>
            </motion.button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px 28px' }}>

          {/* Suggestions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}
            >
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'Poppins, sans-serif', alignSelf: 'center', marginRight: 2 }}>Try:</span>
              {SUGGESTIONS[mode].map(s => (
                <motion.button
                  key={s}
                  whileHover={{ borderColor: activeMode.color + '88', color: activeMode.color }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleSuggestion(s)}
                  style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 100, padding: '5px 14px',
                    fontSize: 12, color: 'rgba(255,255,255,0.35)',
                    fontFamily: 'Poppins, sans-serif', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                  }}
                >
                  {s}
                </motion.button>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Input area */}
          <div style={{
            background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, overflow: 'hidden', marginBottom: 0,
          }}>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={[...SUPPORTED_EXTS, ...IMAGE_EXTS].join(',')}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {/* Attached file chips */}
            {attachedFiles.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '14px 16px 0' }}>
                {attachedFiles.map(f => (
                  <div key={f.name} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: f.isImage ? 'rgba(123,97,255,0.08)' : 'rgba(0,245,255,0.07)',
                    border: `0.5px solid ${f.isImage ? 'rgba(123,97,255,0.35)' : 'rgba(0,245,255,0.25)'}`,
                    borderRadius: 8, padding: '5px 10px',
                  }}>
                    {f.isImage && f.preview ? (
                      <img src={f.preview} alt={f.name} style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                    ) : (
                      <span style={{ fontSize: 13 }}>{getFileIcon(f.name)}</span>
                    )}
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins, sans-serif', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'Poppins, sans-serif' }}>{(f.size / 1024).toFixed(1)}kb</span>
                    <button onClick={() => removeFile(f.name)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: '0 2px', display: 'flex', alignItems: 'center' }}>×</button>
                  </div>
                ))}
              </div>
            )}

            {/* File error */}
            {fileError && (
              <div style={{ padding: '8px 16px 0', fontSize: 11, color: '#FF6B6B', fontFamily: 'Poppins, sans-serif' }}>⚠️ {fileError}</div>
            )}

            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={attachedFiles.length > 0 ? 'Ask something about the file(s)... or just press RUN to analyse' : 'Ask AIO anything... (Enter to send, Shift+Enter for new line)'}
              rows={3}
              style={{
                width: '100%', background: 'transparent', border: 'none',
                padding: '18px 20px 8px', color: '#fff',
                fontFamily: 'Poppins, sans-serif', fontSize: 14, lineHeight: 1.7,
                outline: 'none', resize: 'none', minHeight: 80,
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* + Upload button */}
                <motion.button
                  whileHover={{ scale: 1.08, borderColor: 'rgba(0,245,255,0.5)' }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => { setFileError(''); fileInputRef.current?.click() }}
                  title="Attach a file"
                  style={{
                    width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: attachedFiles.length > 0 ? 'rgba(0,245,255,0.1)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${attachedFiles.length > 0 ? 'rgba(0,245,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    cursor: 'pointer', transition: 'all 0.2s', color: attachedFiles.length > 0 ? '#00F5FF' : 'rgba(255,255,255,0.4)',
                    fontSize: 18, fontWeight: 300, lineHeight: 1,
                  }}
                >+</motion.button>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', fontFamily: 'Poppins, sans-serif' }}>
                  {charCount > 0 ? `${charCount} chars` : 'Enter ↵ to send'}
                </span>
              </div>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={run}
                disabled={loading || (!input.trim() && attachedFiles.length === 0)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: loading || (!input.trim() && attachedFiles.length === 0) ? 'rgba(255,255,255,0.04)' : `linear-gradient(135deg, ${activeMode.color}22, ${activeMode.color}44)`,
                  border: `1px solid ${loading || (!input.trim() && attachedFiles.length === 0) ? 'rgba(255,255,255,0.07)' : activeMode.color + '55'}`,
                  borderRadius: 10, padding: '9px 20px',
                  color: loading || (!input.trim() && attachedFiles.length === 0) ? 'rgba(255,255,255,0.2)' : activeMode.color,
                  fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 2,
                  cursor: loading || (!input.trim() && attachedFiles.length === 0) ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                }}
              >
                {loading ? (
                  <>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i}
                        animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.7, delay: i * 0.15, repeat: Infinity }}
                        style={{ width: 4, height: 4, borderRadius: '50%', background: activeMode.color }}
                      />
                    ))}
                    <span>PROCESSING</span>
                  </>
                ) : (
                  <>
                    <span>RUN</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill={(input.trim() || attachedFiles.length > 0) ? activeMode.color : 'rgba(255,255,255,0.2)'}>
                      <path d="M5 3l14 9-14 9V3z" />
                    </svg>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Output panel */}
          <AnimatePresence>
            {(output || error) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                style={{ marginTop: 18 }}
              >
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: `1px solid ${error ? 'rgba(255,107,107,0.2)' : 'rgba(0,245,255,0.1)'}`,
                  borderRadius: 16, overflow: 'hidden',
                }}>
                  {/* Output header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '11px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: error ? '#FF6B6B' : '#00F5FF', boxShadow: `0 0 8px ${error ? '#FF6B6B' : '#00F5FF'}` }} />
                      <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.25)' }}>
                        {error ? 'ERROR' : 'RESPONSE'}
                      </span>
                    </div>
                    {output && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopy}
                        style={{
                          background: copied ? 'rgba(0,245,255,0.08)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${copied ? 'rgba(0,245,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
                          borderRadius: 6, padding: '4px 12px',
                          fontSize: 10, color: copied ? '#00F5FF' : 'rgba(255,255,255,0.3)',
                          fontFamily: 'Orbitron, monospace', letterSpacing: 1, cursor: 'pointer', transition: 'all 0.2s',
                        }}
                      >
                        {copied ? 'COPIED ✓' : 'COPY'}
                      </motion.button>
                    )}
                  </div>

                  {/* Output text */}
                  <div ref={outputRef} style={{ padding: '20px 22px', maxHeight: 380, overflowY: 'auto' }}>
                    {error && (
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 16 }}>⚠️</span>
                        <span style={{ color: '#FF6B6B', fontSize: 13, lineHeight: 1.7, fontFamily: 'Poppins, sans-serif' }}>{error}</span>
                      </div>
                    )}
                    {output && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
                      >
                        <ResponseRenderer text={output} />
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!output && !error && !loading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ marginTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 0' }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>
                {activeMode.icon}
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)', fontFamily: 'Poppins, sans-serif', textAlign: 'center', lineHeight: 1.7 }}>
                Pick a suggestion or type your prompt<br />
                and press <span style={{ color: activeMode.color, fontFamily: 'Orbitron, monospace', fontSize: 10 }}>RUN</span>
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  )
}
