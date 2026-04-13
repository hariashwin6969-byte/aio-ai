import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

export default function Contact() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;

    const subject = encodeURIComponent(`AIO AI Inquiry from ${form.name}`)
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
    )
    window.location.href = `mailto:hariashwin6969@gmail.com?subject=${subject}&body=${body}`
    setSent(true)
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Hi, I'd like to get in touch with the AIO AI developer.`)
    window.open(`https://wa.me/916374142808?text=${text}`, '_blank')
  };

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '14px 18px',
    color: '#fff', fontFamily: 'Poppins, sans-serif', fontSize: 14,
    outline: 'none', transition: 'border-color 0.2s',
  }

  return (
    <section id="contact" ref={ref} style={{ padding: '100px 40px', maxWidth: 680, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: 4, color: '#00F5FF', marginBottom: 12 }}>// CONTACT</div>
        <h2 style={{ fontFamily: 'Orbitron, monospace', fontSize: 'clamp(24px,3vw,40px)', fontWeight: 700, marginBottom: 14 }}>
          Get In <span style={{ color: '#00F5FF' }}>Touch</span>
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 48, fontWeight: 300 }}>
          Ready to integrate AIO AI into your world? Let's build the future together.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(0,245,255,0.12)', borderRadius: 20, padding: 40 }}
      >
        {sent ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 18, color: '#00F5FF', marginBottom: 10 }}>Message Transmitted</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 300 }}>AIO AI will process your request within 24 hours.</div>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" style={{ ...inputStyle, flex: 1 }} />
              <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email address" style={{ ...inputStyle, flex: 1 }} />
            </div>
            <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell us about your project..." rows={5} style={{ ...inputStyle, resize: 'vertical' }} />

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Email Submit */}
              <motion.button
                whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,245,255,0.3)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                style={{
                  background: 'linear-gradient(135deg, #00F5FF, #7B61FF)',
                  color: '#0B0F1A', border: 'none', padding: '15px 36px',
                  borderRadius: 10, fontFamily: 'Poppins, sans-serif',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Send Message
              </motion.button>

              {/* WhatsApp Button */}
              <motion.button
                whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(37,211,102,0.35)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleWhatsApp}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'linear-gradient(135deg, #25D366, #128C7E)',
                  color: '#fff', border: 'none', padding: '15px 28px',
                  borderRadius: 10, fontFamily: 'Poppins, sans-serif',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32" fill="white">
                  <path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.736 5.468 2.027 7.77L0 32l8.43-2.01A15.938 15.938 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.747-1.835l-.483-.286-4.998 1.192 1.23-4.865-.314-.497A13.267 13.267 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.87c-.398-.199-2.355-1.162-2.72-1.294-.365-.133-.63-.199-.896.199-.265.398-1.029 1.294-1.261 1.56-.232.265-.465.298-.863.1-.398-.2-1.681-.62-3.202-1.976-1.183-1.056-1.982-2.36-2.214-2.758-.232-.398-.025-.613.174-.81.179-.178.398-.465.597-.697.2-.232.266-.398.398-.663.133-.265.067-.497-.033-.696-.1-.199-.896-2.161-1.228-2.958-.323-.776-.651-.671-.896-.683-.232-.01-.497-.013-.763-.013-.265 0-.696.1-1.061.497-.365.398-1.394 1.362-1.394 3.322s1.427 3.854 1.626 4.12c.199.265 2.808 4.287 6.804 6.015.951.41 1.693.655 2.271.839.954.304 1.823.261 2.51.158.765-.114 2.355-.963 2.688-1.893.332-.93.332-1.727.232-1.893-.1-.166-.365-.265-.763-.464z" />
                </svg>
                Text on WhatsApp
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </section>
  )
}
