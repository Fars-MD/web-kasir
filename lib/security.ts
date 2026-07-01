import type { VercelRequest, VercelResponse } from '@vercel/node'

type AllowedMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface SecurityOptions {
  methods?: AllowedMethod[]
  rateLimit?: boolean
  rateLimitMax?: number
  rateLimitWindow?: number
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

const BOT_PATTERNS = [
  /GPTBot|ChatGPT-User|OpenAI|OAI-SearchBot/i,
  /Claude|Anthropic/i,
  /PerplexityBot/i,
  /DataForSeoBot/i,
  /PetalBot/i,
  /SemrushBot/i,
  /AhrefsBot/i,
  /MozBot|rogerbot|dotbot/i,
  /python-requests|python-httpx|python-urllib/i,
  /curl\/(?:8|9|10)/i,
  /wget\/(?:8|9|10)/i,
  /scrapy|scraper|spider|heritrix|httrack/i,
  /nmap|nikto|sqlmap|masscan|zmap/i,
  /go-http-client/i,
  /Java\/[0-9.]+/i,
]

function detectBot(ua: string): boolean {
  if (!ua || ua.length < 10) return true
  return BOT_PATTERNS.some((p) => p.test(ua))
}

function sanitizeValue(val: string): string {
  return val
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:\s*text\/html/gi, '')
    .replace(/\\u003C|\\u003E/g, '')
    .trim()
}

function isIpWhitelisted(ip: string): boolean {
  const trusted = (process.env.TRUSTED_IPS || '').split(',').filter(Boolean)
  return trusted.includes(ip)
}

export function withSecurity(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<any>,
  options?: SecurityOptions
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '0')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')

    const origin = (req.headers.origin || '') as string
    const allowedOrigins = [
      'https://kasirku-flame.vercel.app',
      'http://localhost:5173',
      'http://localhost:4173',
    ]
    if (allowedOrigins.includes(origin) || !origin) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*')
    } else {
      res.setHeader('Access-Control-Allow-Origin', 'https://kasirku-flame.vercel.app')
    }
    const methods = options?.methods || ['GET']
    res.setHeader('Access-Control-Allow-Methods', [...methods, 'OPTIONS'].join(', '))
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
    res.setHeader('Access-Control-Max-Age', '86400')

    if (req.method === 'OPTIONS') {
      res.status(200).end()
      return
    }

    if (req.method && !methods.includes(req.method as AllowedMethod)) {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    if (options?.rateLimit !== false) {
      const ip = ((req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown').split(',')[0].trim()
      if (!isIpWhitelisted(ip)) {
        const key = `${ip}:${req.url}`
        const maxReqs = options?.rateLimitMax || 30
        const windowMs = options?.rateLimitWindow || 60000
        const now = Date.now()
        const entry = rateLimitStore.get(key)
        if (entry && now < entry.resetAt) {
          entry.count++
          if (entry.count > maxReqs) {
            res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000).toString())
            res.status(429).json({ error: 'Too many requests. Coba lagi nanti.' })
            return
          }
        } else {
          rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
        }
        if (rateLimitStore.size > 10000) {
          const cutoff = now - 120000
          for (const [k, v] of rateLimitStore) {
            if (v.resetAt < cutoff) rateLimitStore.delete(k)
          }
        }
      }
    }

    const ua = (req.headers['user-agent'] || '') as string
    if (detectBot(ua)) {
      res.status(403).json({ error: 'Access denied' })
      return
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const ct = (req.headers['content-type'] || '') as string
      if (!ct.includes('application/json')) {
        res.status(415).json({ error: 'Content-Type must be application/json' })
        return
      }
      const contentLength = req.headers['content-length']
      if (contentLength && parseInt(contentLength) > 1_000_000) {
        res.status(413).json({ error: 'Request body too large (max 1MB)' })
        return
      }
      if (req.body && typeof req.body === 'object') {
        for (const key of Object.keys(req.body)) {
          if (typeof req.body[key] === 'string') {
            req.body[key] = sanitizeValue(req.body[key])
          }
        }
      }
    }

    return handler(req, res)
  }
}

export function sanitizeInput(val: unknown): string {
  if (typeof val !== 'string') return ''
  return sanitizeValue(val)
}
