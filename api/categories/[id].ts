import { db } from '../../lib/db'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const urlParts = (req.url || '').split('?')[0].split('/')
  const id = urlParts[urlParts.length - 1]

  if (!id || id.length < 3) {
    return res.status(400).json({ error: 'Invalid category ID' })
  }

  if (req.method === 'DELETE') {
    try {
      const products = await db.execute({
        sql: 'SELECT COUNT(*) as cnt FROM "Product" WHERE "categoryId" = ?',
        args: [id]
      })
      if ((products.rows[0] as any).cnt > 0) {
        return res.status(400).json({ error: 'Kategori tidak bisa dihapus karena masih ada produk' })
      }
      await db.execute({ sql: 'DELETE FROM "Category" WHERE id = ?', args: [id] })
      return res.json({ message: 'Category deleted' })
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete category' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
