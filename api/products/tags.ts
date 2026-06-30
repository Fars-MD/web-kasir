import { db } from '../../lib/db'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    try {
      const result = await db.execute({ sql: 'SELECT tags FROM "Product" WHERE tags <> ?', args: [''] })
      const allTags = new Set<string>()
      result.rows.forEach((r: any) => {
        if (r.tags) {
          r.tags.split(',').forEach((t: string) => {
            const trimmed = t.trim()
            if (trimmed) allTags.add(trimmed)
          })
        }
      })
      return res.json(Array.from(allTags).sort())
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch tags' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
