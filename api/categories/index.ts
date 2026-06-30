import { db } from '../../lib/db'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    try {
      const result = await db.execute({
        sql: `SELECT c.*, (SELECT COUNT(*) FROM "Product" p WHERE p."categoryId" = c.id) as product_count
              FROM "Category" c ORDER BY c.name ASC`,
      })
      const categories = result.rows.map((r: any) => ({
        id: r.id, name: r.name, color: r.color, unitLabel: r.unitLabel || 'Pack',
        createdAt: r.createdAt, updatedAt: r.updatedAt,
        _count: { products: Number(r.product_count) },
      }))
      return res.json(categories)
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch categories' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, color, unitLabel } = req.body

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Nama kategori wajib diisi' })
      }
      if (name.trim().length > 100) {
        return res.status(400).json({ error: 'Nama kategori maks 100 karakter' })
      }

      const dupCheck = await db.execute({
        sql: 'SELECT id FROM "Category" WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))',
        args: [name.trim()]
      })
      if (dupCheck.rows.length > 0) {
        return res.status(409).json({ error: 'Kategori sudah ada' })
      }

      const id = crypto.randomUUID()
      const now = new Date().toISOString()
      const cleanColor = color && typeof color === 'string' ? color.slice(0, 7) : '#6D28D9'
      const cleanUnit = unitLabel && typeof unitLabel === 'string' ? unitLabel.slice(0, 50) : 'Pack'

      await db.execute({
        sql: 'INSERT INTO "Category" (id, name, color, "unitLabel", createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
        args: [id, name.trim(), cleanColor, cleanUnit, now, now],
      })
      return res.status(201).json({ id, name: name.trim(), color: cleanColor, unitLabel: cleanUnit, createdAt: now, updatedAt: now })
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create category' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
