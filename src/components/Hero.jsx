import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const words = ['Intelligence', 'Automation', 'Innovation', 'Evolution']

export default function Hero() {
  const [wordIdx, setWordIdx] = useState(0)
  const particlesRef = useRef(null)

  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % words.length), 2200)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const container = particlesRef.current
    if (!container) return
    const particles = []
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('div')
      p.style.cssText = `
        position:absolute;border-radius:50%;pointer-events:none;
        width:${1 + Math.random() * 2}px;height:${1 + Math.random() * 2}px;
        background:${Math.random() > 0.5 ? '#00F5FF' : '#7B61FF'};
        left:${Math.random() * 100}%;
        animation:floatUp ${4 + Math.random() * 8}s ${Math.random() * 6}s linear infinite;
        opacity:0;
      `
      container.appendChild(p)
      particles.push(p)
    }
    const style = document.createElement('style')
    style.textContent = `
      @keyframes floatUp {
        0%{transform:translateY(100vh) scale(0);opacity:0}
        10%{opacity:0.8}90%{opacity:0.3}
        100%{transform:translateY(-10vh) scale(1.5);opacity:0}
      }
    `
    document.head.appendChild(style)
    return () => { particles.forEach(p => p.remove()); style.remove() }
  }, [])

  return (
    <section id="home" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '80px 32px', overflow: 'hidden' }}>
      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, rgba(123,97,255,0.15) 0%, rgba(0,245,255,0.05) 40%, transparent 70%)' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(123,97,255,0.08)', filter: 'blur(80px)', top: -100, right: -100, animation: 'orb1 9s ease-in-out infinite alternate' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(0,245,255,0.06)', filter: 'blur(60px)', bottom: 80, left: -80, animation: 'orb2 12s ease-in-out infinite alternate' }} />

      <style>{`
        @keyframes orb1{from{transform:translate(0,0)}to{transform:translate(30px,-40px)}}
        @keyframes orb2{from{transform:translate(0,0)}to{transform:translate(-20px,30px)}}
      `}</style>

      <div ref={particlesRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.8, duration: 0.7 }}
        style={{ position: 'relative', zIndex: 2 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.9, duration: 0.5 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,245,255,0.08)', border: '0.5px solid rgba(0,245,255,0.3)', color: '#00F5FF', fontSize: 10, letterSpacing: 3, padding: '7px 18px', borderRadius: 20, marginBottom: 28, fontFamily: 'Orbitron, monospace' }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00F5FF', animation: 'pulse 1.2s ease-in-out infinite', display: 'inline-block' }} />
          NEXT-GEN INTELLIGENCE SYSTEM
        </motion.div>

        <h1 style={{ fontFamily: 'Orbitron, monospace', fontSize: 'clamp(30px, 5.5vw, 64px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20, letterSpacing: -1 }}>
          Redefining<br />
          <span style={{ color: '#00F5FF', textShadow: '0 0 40px rgba(0,245,255,0.4)' }}>
            <motion.span
              key={wordIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ display: 'inline-block' }}
            >
              {words[wordIdx]}
            </motion.span>
          </span>
          {' '}
          <span style={{ color: '#7B61FF', textShadow: '0 0 40px rgba(123,97,255,0.4)' }}>Beyond Gravity</span>
        </h1>

        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', maxWidth: 520, lineHeight: 1.8, marginBottom: 44, fontWeight: 300, margin: '0 auto 44px' }}>
          A combined intelligence system fusing AI, IoT, and Anti-Gravity technology — engineered for a world that hasn't been built yet.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.button
            whileHover={{ y: -2, boxShadow: '0 10px 40px rgba(0,245,255,0.35)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ background: 'linear-gradient(135deg, #00F5FF, #7B61FF)', color: '#0B0F1A', border: 'none', padding: '15px 36px', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
          >
            Explore System
          </motion.button>
          <motion.button
            whileHover={{ borderColor: '#00F5FF', color: '#00F5FF' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ background: 'transparent', color: '#fff', border: '0.5px solid rgba(255,255,255,0.3)', padding: '15px 36px', borderRadius: 10, fontFamily: 'Poppins, sans-serif', fontSize: 15, fontWeight: 400, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Try Live Demo
          </motion.button>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.25)' }}
      >
        <div style={{ fontSize: 11, letterSpacing: 2, fontFamily: 'Orbitron, monospace' }}>SCROLL</div>
        <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(0,245,255,0.4), transparent)' }} />
      </motion.div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </section>
  )
}
