import { motion } from 'framer-motion'

const links = {
  Product: ['Features', 'Demo', 'Pricing', 'Roadmap'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Support: ['Documentation', 'API Reference', 'Status', 'Contact'],
  Legal: ['Privacy', 'Terms', 'Security', 'Cookies'],
}

export default function Footer() {
  return (
    <footer style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', padding: '60px 40px 32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 40, marginBottom: 60 }}>
          {/* Brand */}
          <div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 22, fontWeight: 900, color: '#00F5FF', letterSpacing: 2, textShadow: '0 0 20px rgba(0,245,255,0.4)', marginBottom: 14 }}>AIO AI</div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, fontWeight: 300, maxWidth: 200 }}>
              Combined Intelligence System with Anti-Gravity Technology. Building the future, one node at a time.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              {['𝕏', 'in', '⬡', '▶'].map((icon, i) => (
                <motion.div
                  key={i}
                  whileHover={{ borderColor: 'rgba(0,245,255,0.4)', color: '#00F5FF' }}
                  style={{ width: 34, height: 34, borderRadius: 8, border: '0.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {icon}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 3, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>{section.toUpperCase()}</div>
              {items.map(item => (
                <motion.div
                  key={item}
                  whileHover={{ color: '#00F5FF', x: 3 }}
                  style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 10, cursor: 'pointer', transition: 'all 0.2s', fontWeight: 300 }}
                >
                  {item}
                </motion.div>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.05)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', letterSpacing: 1 }}>
            © 2026 AIO AI · All rights reserved
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00F5FF', animation: 'pulse 1.5s ease infinite' }} />
            <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'rgba(0,245,255,0.5)', letterSpacing: 2 }}>ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </footer>
  )
}
