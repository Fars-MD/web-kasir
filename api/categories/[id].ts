import { db } from '../../lib/db'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { withSecurity } from '../../lib/security'

async function handler(req: VercelRequest, res: VercelResponse) {
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

export default withSecurity(handler, { methods: ['DELETE'] })
