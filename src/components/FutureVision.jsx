import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export default function FutureVision() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const orbits = [
    { size: 140, duration: 8, dot: '#00F5FF', label: 'Neural Core' },
    { size: 210, duration: 13, dot: '#7B61FF', label: 'AI Mesh', reverse: true },
    { size: 280, duration: 20, dot: 'rgba(255,255,255,0.6)', label: 'IoT Network' },
  ]

  return (
    <section ref={ref} style={{ padding: '100px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(123,97,255,0.06) 0%, transparent 60%)' }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 4, color: '#7B61FF', marginBottom: 12 }}>// FUTURE VISION</div>
        <h2 style={{ fontFamily: 'Orbitron, monospace', fontSize: 'clamp(24px,3vw,40px)', fontWeight: 700, marginBottom: 14 }}>
          Anti-Gravity <span style={{ color: '#7B61FF' }}>Intelligence</span>
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 460, margin: '0 auto 60px', lineHeight: 1.7, fontWeight: 300 }}>
          Spatial intelligence that operates above physical constraints — a new dimension of human-machine interaction beyond anything built before.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        style={{ position: 'relative', width: 300, height: 300, margin: '0 auto 60px' }}
      >
        {/* Core */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], boxShadow: ['0 0 30px rgba(0,245,255,0.5)', '0 0 60px rgba(0,245,255,0.8)', '0 0 30px rgba(0,245,255,0.5)'] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 60, height: 60, borderRadius: '50%',
            background: 'radial-gradient(circle, #00F5FF, #7B61FF)',
            zIndex: 10,
          }}
        />

        {orbits.map((o, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: o.size, height: o.size,
            marginTop: -o.size / 2, marginLeft: -o.size / 2,
            borderRadius: '50%',
            border: '0.5px solid rgba(0,245,255,0.15)',
            animation: `spin${i} ${o.duration}s linear infinite${o.reverse ? ' reverse' : ''}`,
          }}>
            <div style={{
              position: 'absolute', top: -5, left: '50%', marginLeft: -5,
              width: 10, height: 10, borderRadius: '50%',
              background: o.dot,
              boxShadow: `0 0 12px ${o.dot}`,
            }} />
          </div>
        ))}

        <style>{`
          @keyframes spin0{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
          @keyframes spin1{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
          @keyframes spin2{from{transform:rotate(45deg)}to{transform:rotate(405deg)}}
        `}</style>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 3, color: 'rgba(0,245,255,0.5)', marginBottom: 32 }}>
          GRAVITATIONAL INTELLIGENCE CORE — ACTIVE
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
          {[['Neural Core', '#00F5FF'], ['AI Mesh', '#7B61FF'], ['IoT Network', 'rgba(255,255,255,0.5)']].map(([label, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'Orbitron, monospace', letterSpacing: 1 }}>{label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
