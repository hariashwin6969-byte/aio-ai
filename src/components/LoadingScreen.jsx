import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const steps = [
  'Initializing Intelligence Core...',
  'Calibrating Anti-Gravity Systems...',
  'Connecting Neural Networks...',
  'AIO AI Online.',
]

export default function LoadingScreen() {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); setDone(true); return 100 }
        return p + 2
      })
    }, 40)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress > 25 && step < 1) setStep(1)
    if (progress > 55 && step < 2) setStep(2)
    if (progress > 80 && step < 3) setStep(3)
  }, [progress, step])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#0B0F1A',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 24,
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ fontFamily: 'Orbitron, monospace', fontSize: 42, fontWeight: 900, color: '#00F5FF', letterSpacing: 4, textShadow: '0 0 40px rgba(0,245,255,0.7)' }}
          >
            AIO AI
          </motion.div>

          <div style={{ width: 260, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #00F5FF, #7B61FF)', borderRadius: 2 }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, letterSpacing: 3, color: 'rgba(0,245,255,0.7)' }}
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>

          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: 2 }}>
            {progress}%
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
