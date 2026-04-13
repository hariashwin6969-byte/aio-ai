import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const tech = [
  { icon: '🤖', name: 'Artificial Intelligence', desc: 'Neural mesh processing' },
  { icon: '🗣️', name: 'NLP Engine', desc: '40+ language support' },
  { icon: '📶', name: 'IoT Protocol', desc: 'MQTT & WebSocket layer' },
  { icon: '⚙️', name: 'Embedded Systems', desc: 'ARM Cortex-M core' },
  { icon: '🔐', name: 'Edge Security', desc: 'Zero-trust architecture' },
  { icon: '☁️', name: 'Cloud Sync', desc: 'Sub-10ms latency' },
  { icon: '🌐', name: 'Mesh Network', desc: 'P2P distributed nodes' },
  { icon: '🔋', name: 'Power AI', desc: 'Adaptive energy core' },
]

export default function Technology() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} style={{ padding: '100px 40px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 4, color: '#00F5FF', marginBottom: 12 }}>// TECH STACK</div>
        <h2 style={{ fontFamily: 'Orbitron, monospace', fontSize: 'clamp(24px,3vw,40px)', fontWeight: 700, marginBottom: 14 }}>
          Powered By <span style={{ color: '#00F5FF' }}>Technology</span>
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', maxWidth: 440, lineHeight: 1.7, marginBottom: 56, fontWeight: 300 }}>
          Built on proven frameworks, integrated for the most advanced combined intelligence system ever deployed.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {tech.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            whileHover={{ borderColor: 'rgba(123,97,255,0.4)', y: -3 }}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '0.5px solid rgba(255,255,255,0.07)',
              borderRadius: 14, padding: '22px 18px',
              textAlign: 'center', transition: 'all 0.2s',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>{t.icon}</div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 1, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>{t.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>{t.desc}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
