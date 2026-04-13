import { useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'

export default function Globe() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const canvasRef = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width = 400
    const H = canvas.height = 400
    const cx = W / 2, cy = H / 2, R = 160
    let angle = 0

    const dots = []
    for (let lat = -80; lat <= 80; lat += 18) {
      const r = Math.cos(lat * Math.PI / 180)
      const count = Math.max(4, Math.floor(r * 24))
      for (let i = 0; i < count; i++) {
        const lng = (i / count) * 360 - 180
        dots.push({ lat: lat * Math.PI / 180, lng: lng * Math.PI / 180 })
      }
    }

    const lines = [
      [{ lat: 0.6, lng: 0 }, { lat: 0.8, lng: 1.2 }, { lat: 0.9, lng: 2.0 }],
      [{ lat: -0.3, lng: -1.5 }, { lat: 0.1, lng: -0.8 }, { lat: 0.4, lng: 0.2 }],
      [{ lat: 0.2, lng: 2.5 }, { lat: 0.5, lng: 3.2 }, { lat: 0.7, lng: 3.8 }],
    ]

    function project(lat, lng, rot) {
      const x = Math.cos(lat) * Math.sin(lng + rot)
      const y = Math.sin(lat)
      const z = Math.cos(lat) * Math.cos(lng + rot)
      return { x: cx + x * R, y: cy - y * R, z }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      angle += 0.004

      // Globe sphere glow
      const grad = ctx.createRadialGradient(cx, cy, R * 0.3, cx, cy, R)
      grad.addColorStop(0, 'rgba(0,245,255,0.04)')
      grad.addColorStop(1, 'rgba(123,97,255,0.01)')
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()

      // Outer ring
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(0,245,255,0.1)'
      ctx.lineWidth = 0.5
      ctx.stroke()

      // Dots
      dots.forEach(d => {
        const p = project(d.lat, d.lng, angle)
        if (p.z > 0) {
          const alpha = (p.z * 0.7 + 0.1)
          ctx.beginPath()
          ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0,245,255,${alpha.toFixed(2)})`
          ctx.fill()
        }
      })

      // Connection lines
      lines.forEach((line, li) => {
        ctx.beginPath()
        let started = false
        line.forEach(pt => {
          const p = project(pt.lat, pt.lng, angle)
          if (p.z > 0) {
            if (!started) { ctx.moveTo(p.x, p.y); started = true }
            else ctx.lineTo(p.x, p.y)
          }
        })
        ctx.strokeStyle = li === 0 ? 'rgba(0,245,255,0.4)' : 'rgba(123,97,255,0.35)'
        ctx.lineWidth = 1
        ctx.stroke()
      })

      // Equator line
      ctx.beginPath()
      for (let i = 0; i <= 360; i += 4) {
        const p = project(0, i * Math.PI / 180, angle)
        if (p.z > 0) {
          if (i === 0) ctx.moveTo(p.x, p.y)
          else ctx.lineTo(p.x, p.y)
        }
      }
      ctx.strokeStyle = 'rgba(0,245,255,0.15)'
      ctx.lineWidth = 0.5
      ctx.stroke()

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return (
    <section ref={ref} style={{ padding: '80px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,245,255,0.03) 0%, transparent 70%)' }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 4, color: '#00F5FF', marginBottom: 12 }}>// GLOBAL NETWORK</div>
        <h2 style={{ fontFamily: 'Orbitron, monospace', fontSize: 'clamp(24px,3vw,40px)', fontWeight: 700, marginBottom: 14 }}>
          Connected <span style={{ color: '#00F5FF' }}>Worldwide</span>
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', maxWidth: 420, margin: '0 auto 40px', lineHeight: 1.7, fontWeight: 300 }}>
          AIO AI nodes span 147 countries, processing 2.4 billion queries per second across a distributed intelligence mesh.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{ display: 'flex', justifyContent: 'center' }}
      >
        <canvas ref={canvasRef} style={{ maxWidth: 400, width: '100%' }} />
      </motion.div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap', marginTop: 40 }}>
        {[['147', 'Countries'], ['2.4B', 'Queries/sec'], ['99.99%', 'Uptime'], ['<10ms', 'Latency']].map(([val, label]) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.4 }}>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 28, fontWeight: 900, color: '#00F5FF', textShadow: '0 0 20px rgba(0,245,255,0.4)' }}>{val}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: 1, marginTop: 4 }}>{label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
