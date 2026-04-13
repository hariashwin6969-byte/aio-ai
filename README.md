# AIO AI – Combined Intelligence System

A premium, futuristic React + Vite website with live Claude AI integration.

## Quick Start

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## Features

- AI Loading Screen with animated boot sequence
- Full-screen Hero with particle animation & typing effect
- 6 Feature Cards with glassmorphism + hover effects
- **Live AI Demo** powered by Claude (Anthropic API)
- Rotating 3D Globe built with Canvas API
- Pricing Section with monthly/yearly toggle
- Testimonials Section
- Anti-Gravity Orbit Animation
- Contact Form with success state
- Cursor Glow effect
- Fully responsive

## Live AI Demo Setup

The Demo section calls the Anthropic API directly.
For production, route requests through a backend proxy to keep your API key safe.

Create a `.env` file:
```
VITE_ANTHROPIC_API_KEY=your_key_here
```

Then update `Demo.jsx` line with:
```js
'Authorization': `Bearer ${import.meta.env.VITE_ANTHROPIC_API_KEY}`
```

## Tech Stack

- React 18 + Vite 5
- Framer Motion (animations)
- React Icons
- Google Fonts: Orbitron + Poppins
- Anthropic Claude API (live AI)

## Color Palette

- Background: #0B0F1A
- Cyan: #00F5FF
- Purple: #7B61FF
- White: #FFFFFF
