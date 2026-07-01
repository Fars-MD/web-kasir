import { db } from '../../lib/db'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { withSecurity } from '../../lib/security'

async function handler(req: VercelRequest, res: VercelResponse) {
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

export default withSecurity(handler, { methods: ['GET'] })
