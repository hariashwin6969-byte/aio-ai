import { useEffect, useRef } from 'react'

export default function CursorGlow() {
  const ref = useRef(null)

  useEffect(() => {
    const move = (e) => {
      if (ref.current) {
        ref.current.style.left = e.clientX + 'px'
        ref.current.style.top = e.clientY + 'px'
      }
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <div ref={ref} style={{
      position: 'fixed',
      width: 400, height: 400,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(0,245,255,0.04) 0%, transparent 70%)',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      zIndex: 9998,
      transition: 'left 0.1s ease, top 0.1s ease',
    }} />
  )
}
