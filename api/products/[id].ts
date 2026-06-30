import { db } from '../../lib/db'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const urlParts = (req.url || '').split('?')[0].split('/')
  const id = urlParts[urlParts.length - 1]

  if (!id || id.length < 10) {
    return res.status(400).json({ error: 'Invalid product ID' })
  }

  if (req.method === 'GET') {
    try {
      const result = await db.execute({
        sql: `SELECT p.*, c.id as cat_id, c.name as cat_name, c.color as cat_color, c."unitLabel" as cat_unit_label
              FROM "Product" p
              LEFT JOIN "Category" c ON p."categoryId" = c.id
              WHERE p.id = ?`,
        args: [id],
      })
      if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' })
      const r = result.rows[0] as any
      return res.json({
        id: r.id, name: r.name,
        categoryId: r.categoryId, tags: r.tags, description: r.description,
        costPrice: r.costPrice, sellPrice: r.sellPrice, packPrice: r.packPrice || 0, pcsPerPack: r.pcsPerPack || 1, stock: r.stock,
        minStock: r.minStock, imageUrl: r.imageUrl,
        createdAt: r.createdAt, updatedAt: r.updatedAt,
        category: r.cat_id ? { id: r.cat_id, name: r.cat_name, color: r.cat_color, unitLabel: r.cat_unit_label || 'Pack' } : null,
      })
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch product' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const { name, categoryId, tags, description, costPrice, sellPrice, packPrice, pcsPerPack, stock, minStock, imageUrl } = req.body

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Nama produk wajib diisi' })
      }
      if (name.length > 255) {
        return res.status(400).json({ error: 'Nama produk maks 255 karakter' })
      }
      if (!categoryId || typeof categoryId !== 'string') {
        return res.status(400).json({ error: 'Kategori wajib dipilih' })
      }
      if (typeof sellPrice !== 'number' || sellPrice < 0 || sellPrice > 100000000) {
        return res.status(400).json({ error: 'Harga jual tidak valid' })
      }
      if (typeof costPrice !== 'number' || costPrice < 0 || costPrice > 100000000) {
        return res.status(400).json({ error: 'Harga modal tidak valid' })
      }
      if (typeof packPrice !== 'number' || packPrice < 0 || packPrice > 100000000) {
        return res.status(400).json({ error: 'Harga pack tidak valid' })
      }
      const cleanPcsPerPack = typeof pcsPerPack === 'number' && pcsPerPack >= 1 ? Math.round(pcsPerPack) : 1
      if (typeof stock !== 'number' || stock < 0 || stock > 100000) {
        return res.status(400).json({ error: 'Stok tidak valid' })
      }
      if (typeof minStock !== 'number' || minStock < 0) {
        return res.status(400).json({ error: 'Stok minimum tidak valid' })
      }
      if (imageUrl && typeof imageUrl === 'string' && imageUrl.length > 500000) {
        return res.status(400).json({ error: 'Ukuran foto terlalu besar' })
      }

      const catCheck = await db.execute({ sql: 'SELECT id FROM "Category" WHERE id = ?', args: [categoryId] })
      if (catCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Kategori tidak ditemukan' })
      }

      const dupCheck = await db.execute({
        sql: 'SELECT id, name FROM "Product" WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) AND id != ?',
        args: [name.trim(), id]
      })
      if (dupCheck.rows.length > 0) {
        return res.status(409).json({ error: `Produk "${(dupCheck.rows[0] as any).name}" sudah ada` })
      }

      const now = new Date().toISOString()
      const cleanTags = tags ? String(tags).slice(0, 500) : ''
      const cleanDesc = description ? String(description).slice(0, 1000) : ''

      await db.execute({
        sql: `UPDATE "Product" SET name=?, categoryId=?, tags=?, description=?, costPrice=?, sellPrice=?, packPrice=?, "pcsPerPack"=?, stock=?, minStock=?, imageUrl=?, updatedAt=? WHERE id=?`,
        args: [name.trim(), categoryId, cleanTags, cleanDesc, costPrice, sellPrice, packPrice || 0, cleanPcsPerPack, Math.round(stock), Math.round(minStock), imageUrl || null, now, id],
      })
      const cat = await db.execute({ sql: 'SELECT * FROM "Category" WHERE id = ?', args: [categoryId] })
      return res.json({
        id, name: name.trim(), categoryId, tags: cleanTags, description: cleanDesc,
        costPrice, sellPrice, packPrice: packPrice || 0, pcsPerPack: cleanPcsPerPack, stock: Math.round(stock), minStock: Math.round(minStock), imageUrl: imageUrl || null,
        updatedAt: now,
        category: cat.rows[0] || null,
      })
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update product' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const items = await db.execute({ sql: 'SELECT COUNT(*) as cnt FROM "TransactionItem" WHERE "productId" = ?', args: [id] })
      if ((items.rows[0] as any).cnt > 0) {
        return res.status(400).json({ error: 'Produk tidak bisa dihapus karena sudah ada di transaksi' })
      }
      await db.execute({ sql: 'DELETE FROM "Product" WHERE id = ?', args: [id] })
      return res.json({ message: 'Product deleted' })
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete product' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
