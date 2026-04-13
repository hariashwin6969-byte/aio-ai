import { useState, useEffect } from 'react'
import LoadingScreen from './components/LoadingScreen'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import Demo from './components/Demo'
import Technology from './components/Technology'
import Pricing from './components/Pricing'
import Testimonials from './components/Testimonials'
import Globe from './components/Globe'
import FutureVision from './components/FutureVision'
import Contact from './components/Contact'
import Footer from './components/Footer'
import CursorGlow from './components/CursorGlow'

export default function App() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 2600)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <CursorGlow />
      {!loaded && <LoadingScreen />}
      <div style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.6s ease' }}>
        <Navbar />
        <Hero />
        <Features />
        <Demo />
        <Technology />
        <Globe />
        <Pricing />
        <Testimonials />
        <FutureVision />
        <Contact />
        <Footer />
      </div>
    </>
  )
}
