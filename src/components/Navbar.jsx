import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const links = ['Home', 'Features', 'Demo', 'Pricing', 'Contact']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 2.7, duration: 0.5 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 40px',
        background: scrolled ? 'rgba(11,15,26,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '0.5px solid rgba(0,245,255,0.12)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 20, fontWeight: 900, color: '#00F5FF', letterSpacing: 2, textShadow: '0 0 20px rgba(0,245,255,0.5)' }}>
        AIO AI
      </div>
      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        {links.map(link => (
          <button key={link} onClick={() => scrollTo(link)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins, sans-serif', fontSize: 13, cursor: 'pointer', transition: 'color 0.2s', letterSpacing: 0.5 }}
            onMouseEnter={e => e.target.style.color = '#00F5FF'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
          >
            {link}
          </button>
        ))}
        <button
          onClick={() => scrollTo('Demo')}
          style={{
            background: 'linear-gradient(135deg, #00F5FF, #7B61FF)',
            color: '#0B0F1A', border: 'none',
            padding: '9px 20px', borderRadius: 8,
            fontFamily: 'Poppins, sans-serif', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', letterSpacing: 0.5,
          }}
        >
          Try Demo
        </button>
      </div>
    </motion.nav>
  )
}
