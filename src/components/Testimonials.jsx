import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const testimonials = [
  { name: 'Aria Chen', role: 'CTO, NovaTech Corp', avatar: 'AC', quote: 'AIO AI transformed how our 500-person engineering team operates. The adaptive intelligence layer reduced our deployment cycles by 73%. I\'ve never seen anything like it.', rating: 5 },
  { name: 'Marcus Oduya', role: 'Lead Scientist, SpaceForward', avatar: 'MO', quote: 'The anti-gravity interface concept alone is worth the investment. We\'re using the spatial UI for satellite control systems. Absolutely mind-bending technology.', rating: 5 },
  { name: 'Sofia Reyes', role: 'Director of AI, Nexora Labs', avatar: 'SR', quote: 'We integrated AIO AI into our research pipeline in under 48 hours. The multi-device sync and offline mode are game-changers for field research teams.', rating: 5 },
]

export default function Testimonials() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} style={{ padding: '100px 40px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 4, color: '#00F5FF', marginBottom: 12 }}>// TESTIMONIALS</div>
        <h2 style={{ fontFamily: 'Orbitron, monospace', fontSize: 'clamp(24px,3vw,40px)', fontWeight: 700, marginBottom: 14 }}>
          What Pioneers <span style={{ color: '#00F5FF' }}>Say</span>
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', maxWidth: 420, lineHeight: 1.7, marginBottom: 56, fontWeight: 300 }}>
          Teams across the globe are reshaping their workflows with AIO AI.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '0.5px solid rgba(255,255,255,0.07)',
              borderRadius: 16, padding: '28px 24px',
            }}
          >
            <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
              {Array(t.rating).fill(0).map((_, j) => (
                <span key={j} style={{ color: '#00F5FF', fontSize: 14 }}>★</span>
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, fontWeight: 300, marginBottom: 24, fontStyle: 'italic' }}>"{t.quote}"</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #00F5FF22, #7B61FF44)', border: '0.5px solid rgba(0,245,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#00F5FF', fontFamily: 'Orbitron, monospace' }}>
                {t.avatar}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Orbitron, monospace', letterSpacing: 0.5 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{t.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
