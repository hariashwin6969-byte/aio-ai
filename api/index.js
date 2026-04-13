// ==========================================
// FILE: api/index.js
// ==========================================

// api/index.js — AIO AI backend
// Local:  text + vision via Ollama (gemma3:1b + llava)
// Cloud:  text + vision via OpenRouter (llama-4-scout, free)

import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 5001

app.use(cors())
app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: true, limit: '20mb' }))

const OLLAMA = 'http://127.0.0.1:11434'
const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions'
const OPENROUTER_TEXT_MODEL = 'meta-llama/llama-3.2-3b-instruct:free'
const OPENROUTER_VISION_MODEL = 'meta-llama/llama-3.2-11b-vision-instruct:free'

app.post('/api/chat', async (req, res) => {
  const { system, messages } = req.body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required and cannot be empty' })
  }

  const MAX_CONTENT_CHARS = 12000
  const processedMessages = messages.map(msg => {
    if (typeof msg.content === 'string' && msg.content.length > MAX_CONTENT_CHARS) {
      return { ...msg, content: msg.content.slice(0, MAX_CONTENT_CHARS) + '\n\n[... content truncated ...]' }
    }
    return msg
  })

  // --- CLOUD: OpenRouter ---
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const lastMessage = processedMessages[processedMessages.length - 1]
      const hasImages = !!(lastMessage.images && lastMessage.images.length > 0)

      // Build messages array for OpenRouter
      const orMessages = []

      if (system) {
        orMessages.push({ role: 'system', content: system })
      }

      // Prior history
      for (const m of processedMessages.slice(0, -1)) {
        orMessages.push({
          role: m.role === 'assistant' || m.role === 'model' ? 'assistant' : 'user',
          content: String(m.content || '')
        })
      }

      // Final user message — with image if present
      if (hasImages) {
        const contentParts = []
        // Add images as base64 url parts
        for (const img of lastMessage.images) {
          contentParts.push({
            type: 'image_url',
            image_url: {
              url: `data:${img.mimeType};base64,${img.base64}`
            }
          })
        }
        // Add text
        contentParts.push({
          type: 'text',
          text: String(lastMessage.content || '') || 'Please analyse this image in detail and describe everything you see.'
        })
        orMessages.push({ role: 'user', content: contentParts })
      } else {
        orMessages.push({
          role: 'user',
          content: String(lastMessage.content || '')
        })
      }

      console.log(`[AIO] OpenRouter → ${hasImages ? OPENROUTER_VISION_MODEL : OPENROUTER_TEXT_MODEL} | hasImages=${hasImages}`)

      const response = await fetch(OPENROUTER_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://aio-ai.vercel.app',
          'X-Title': 'AIO AI',
        },
        body: JSON.stringify({
          model: hasImages ? OPENROUTER_VISION_MODEL : OPENROUTER_TEXT_MODEL,
          messages: orMessages,
          max_tokens: 2048,
          temperature: 0.7,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error?.message || `OpenRouter error ${response.status}`)
      }

      const text = data.choices?.[0]?.message?.content || ''
      return res.json({ content: [{ text }] })

    } catch (err) {
      console.error('[AIO] OpenRouter error:', err.message)
      return res.status(500).json({ error: 'OpenRouter API failed: ' + err.message })
    }
  }

  // --- LOCAL: Ollama ---
  try {
    const lastMessage = processedMessages[processedMessages.length - 1]
    const hasImages = !!(lastMessage.images && lastMessage.images.length > 0)

    console.log(`[AIO] Ollama | hasImages=${hasImages}`)

    if (hasImages) {
      // Vision: LLaVA
      const prompt = (system ? `${system}\n\n` : '') +
        (String(lastMessage.content || '') || 'Please analyse this image and describe everything you see in detail.')
      const images = lastMessage.images.map(img => img.base64)

      console.log(`[AIO] → llava | images: ${images.length} | base64 len: ${images[0]?.length ?? 0}`)

      const ollamaRes = await fetch(`${OLLAMA}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llava',
          prompt,
          images,
          stream: false,
          options: { temperature: 0.7, top_p: 0.9, num_predict: 2048 },
        }),
      })

      const rawText = await ollamaRes.text()
      if (!ollamaRes.ok) throw new Error(`LLaVA error (${ollamaRes.status}): ${rawText.slice(0, 300)}`)

      const data = JSON.parse(rawText)
      const text = data.response?.trim() || ''
      if (!text) throw new Error('LLaVA returned empty — try a JPG or PNG image.')
      return res.json({ content: [{ text }] })

    } else {
      // Text: gemma3:1b
      const ollamaMessages = []
      if (system) ollamaMessages.push({ role: 'system', content: system })
      ollamaMessages.push(...processedMessages)

      console.log(`[AIO] → gemma3:1b`)

      const ollamaRes = await fetch(`${OLLAMA}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma3:1b',
          messages: ollamaMessages,
          stream: false,
          options: { temperature: 0.7, top_p: 0.9, top_k: 40, repeat_penalty: 1.1, num_ctx: 4096, num_predict: 2048 },
        }),
      })

      if (!ollamaRes.ok) {
        const err = await ollamaRes.text()
        throw new Error(`Ollama gemma error: ${err}`)
      }

      const data = await ollamaRes.json()
      return res.json({ content: [{ text: data.message?.content || '' }] })
    }

  } catch (err) {
    console.error('[AIO] Ollama error:', err.message)
    return res.status(500).json({ error: err.message || 'Failed to connect to Ollama. Is it running?' })
  }
})

app.get('/api/health', (_req, res) => {
  const isCloud = !!process.env.OPENROUTER_API_KEY
  res.json({
    status: 'ok',
    mode: isCloud ? 'cloud' : 'local',
    textModel: isCloud ? 'llama-3.2-3b (OpenRouter)' : 'gemma3:1b (Ollama)',
    visionModel: isCloud ? 'llama-3.2-11b-vision (OpenRouter)' : 'llava (Ollama)',
  })
})

export default app

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅  AIO AI backend → http://localhost:${PORT}`)
    console.log(`   Mode: ${process.env.OPENROUTER_API_KEY ? 'Cloud (OpenRouter)' : 'Local (Ollama)'}`)
  })
}
