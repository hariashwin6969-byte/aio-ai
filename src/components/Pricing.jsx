import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const plans = [
  {
    name: 'Starter', price: { monthly: 0, yearly: 0 }, color: 'rgba(255,255,255,0.1)',
    features: ['5,000 AI queries/mo', 'Voice assistant (basic)', '2 device sync', 'Community support'],
    cta: 'Get Started', popular: false,
  },
  {
    name: 'Pro', price: { monthly: 49, yearly: 39 }, color: '#00F5FF',
    features: ['Unlimited AI queries', 'Voice assistant (advanced)', '20 device sync', 'Smart automation', 'Priority support', 'Offline mode'],
    cta: 'Go Pro', popular: true,
  },
  {
    name: 'Enterprise', price: { monthly: 199, yearly: 159 }, color: '#7B61FF',
    features: ['Unlimited everything', 'Anti-gravity interface beta', 'Unlimited devices', 'Dedicated AI nodes', '24/7 concierge support', 'Custom integrations', 'SLA guarantee'],
    cta: 'Contact Sales', popular: false,
  },
]

export default function Pricing() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [yearly, setYearly] = useState(false)

  return (
    <section id="pricing" ref={ref} style={{ padding: '100px 40px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 4, color: '#7B61FF', marginBottom: 12 }}>// PRICING</div>
        <h2 style={{ fontFamily: 'Orbitron, monospace', fontSize: 'clamp(24px,3vw,40px)', fontWeight: 700, marginBottom: 14 }}>
          Choose Your <span style={{ color: '#7B61FF' }}>Intelligence Level</span>
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', maxWidth: 420, margin: '0 auto 28px', lineHeight: 1.7, fontWeight: 300 }}>
          Scale your intelligence from zero to enterprise-grade anti-gravity systems.
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 40, padding: '6px 20px' }}>
          <span style={{ fontSize: 13, color: yearly ? 'rgba(255,255,255,0.4)' : '#fff' }}>Monthly</span>
          <div onClick={() => setYearly(y => !y)} style={{ width: 40, height: 22, borderRadius: 11, background: yearly ? '#7B61FF' : 'rgba(255,255,255,0.15)', cursor: 'pointer', position: 'relative', transition: 'background 0.3s' }}>
            <div style={{ position: 'absolute', top: 3, left: yearly ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.3s' }} />
          </div>
          <span style={{ fontSize: 13, color: yearly ? '#fff' : 'rgba(255,255,255,0.4)' }}>Yearly <span style={{ color: '#00F5FF', fontSize: 11 }}>-20%</span></span>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 20 }}>
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            style={{
              background: plan.popular ? 'rgba(0,245,255,0.04)' : 'rgba(255,255,255,0.02)',
              border: `${plan.popular ? '1.5px' : '0.5px'} solid ${plan.popular ? 'rgba(0,245,255,0.35)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 20, padding: '36px 28px',
              position: 'relative',
            }}
          >
            {plan.popular && (
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #00F5FF, #7B61FF)', color: '#0B0F1A', fontSize: 11, fontWeight: 600, padding: '4px 16px', borderRadius: 20, whiteSpace: 'nowrap', fontFamily: 'Orbitron, monospace', letterSpacing: 1 }}>MOST POPULAR</div>
            )}
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 14, fontWeight: 700, marginBottom: 8, color: plan.color }}>{plan.name}</div>
            <div style={{ fontFamily: 'Orbitron, monospace', marginBottom: 24 }}>
              <span style={{ fontSize: 40, fontWeight: 900 }}>${yearly ? plan.price.yearly : plan.price.monthly}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginLeft: 4 }}>/mo</span>
            </div>
            <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.07)', paddingTop: 20, marginBottom: 28 }}>
              {plan.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 300 }}>
                  <span style={{ color: plan.color, fontSize: 14 }}>✓</span> {f}
                </div>
              ))}
            </div>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              style={{
                width: '100%',
                background: plan.popular ? 'linear-gradient(135deg, #00F5FF, #7B61FF)' : 'transparent',
                color: plan.popular ? '#0B0F1A' : plan.color,
                border: `0.5px solid ${plan.popular ? 'transparent' : plan.color}`,
                padding: '13px', borderRadius: 10,
                fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {plan.cta}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
