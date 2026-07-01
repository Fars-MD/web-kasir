import { db } from '../../lib/db'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { withSecurity } from '../../lib/security'

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { startDate, endDate, cashierId, paymentMethod } = req.query
      let sql = 'SELECT * FROM "Transaction"'
      const args: any[] = []
      const conditions: string[] = []

      if (startDate && endDate) {
        conditions.push('"createdAt" >= ? AND "createdAt" <= ?')
        args.push(startDate as string, endDate as string)
      }
      if (cashierId && typeof cashierId === 'string') { conditions.push('"cashierId" = ?'); args.push(cashierId.slice(0, 50)) }
      if (paymentMethod && typeof paymentMethod === 'string') { conditions.push('"paymentMethod" = ?'); args.push(paymentMethod.slice(0, 20)) }

      if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ')
      sql += ' ORDER BY "createdAt" DESC'

      const txResult = await db.execute({ sql, args })
      const transactions = []
      for (const tx of txResult.rows) {
        const items = await db.execute({
          sql: 'SELECT * FROM "TransactionItem" WHERE "transactionId" = ?',
          args: [(tx as any).id],
        })
        transactions.push({ ...tx, items: items.rows })
      }
      return res.json(transactions)
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch transactions' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { items, discount, paymentMethod, amountPaid, cashierId, tabLabel } = req.body

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Transaksi harus punya minimal 1 item' })
      }
      if (items.length > 100) {
        return res.status(400).json({ error: 'Maksimal 100 item per transaksi' })
      }

      const validMethods = ['cash', 'qris', 'transfer']
      const method = validMethods.includes(paymentMethod) ? paymentMethod : 'cash'

      let serverSubtotal = 0
      const validItems = []

      for (const item of items) {
        if (!item.productId || typeof item.productId !== 'string') {
          return res.status(400).json({ error: 'Item tidak valid' })
        }
        if (typeof item.quantity !== 'number' || item.quantity < 1 || item.quantity > 10000) {
          return res.status(400).json({ error: 'Jumlah item tidak valid' })
        }

        const product = await db.execute({
          sql: 'SELECT id, name, "sellPrice", "packPrice", "costPrice", "pcsPerPack", stock FROM "Product" WHERE id = ?',
          args: [item.productId]
        })
        if (product.rows.length === 0) {
          return res.status(400).json({ error: `Produk ${item.productId} tidak ditemukan` })
        }
        const p = product.rows[0] as any
        const unitType = item.unitType === 'pack' && Number(p.packPrice) > 0 ? 'pack' : 'pcs'
        const pcsPerPack = Math.max(1, Number(p.pcsPerPack) || 1)
        const stockQty = unitType === 'pack' ? item.quantity * pcsPerPack : item.quantity
        if (p.stock < stockQty) {
          return res.status(400).json({ error: `Stok "${p.name}" tidak cukup (sisa: ${p.stock}, butuh: ${stockQty})` })
        }

        const unitPrice = unitType === 'pack' ? Number(p.packPrice) : Number(p.sellPrice)
        const itemSubtotal = unitPrice * item.quantity
        serverSubtotal += itemSubtotal
        validItems.push({ ...item, unitType, unitPrice, subtotal: itemSubtotal, productName: p.name, stockQty })
      }

      const serverDiscount = typeof discount === 'number' && discount >= 0 ? Math.min(discount, serverSubtotal) : 0
      const serverTotal = Math.max(0, serverSubtotal - serverDiscount)
      const serverAmountPaid = typeof amountPaid === 'number' && amountPaid >= 0 ? amountPaid : serverTotal
      const serverChange = method === 'cash' ? Math.max(0, serverAmountPaid - serverTotal) : 0

      const id = crypto.randomUUID()
      const now = new Date().toISOString()
      const cleanCashierId = cashierId ? String(cashierId).slice(0, 50) : 'admin'
      const cleanTabLabel = tabLabel ? String(tabLabel).slice(0, 50) : 'Tab 1'

      await db.execute({
        sql: `INSERT INTO "Transaction" (id, subtotal, discount, total, "paymentMethod", "amountPaid", "change", "cashierId", "tabLabel", status, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)`,
        args: [id, serverSubtotal, serverDiscount, serverTotal, method, serverAmountPaid, serverChange, cleanCashierId, cleanTabLabel, now, now],
      })

      for (const item of validItems) {
        const itemId = crypto.randomUUID()
        await db.execute({
          sql: `INSERT INTO "TransactionItem" (id, "transactionId", "productId", "productName", quantity, "unitPrice", subtotal, discount, "unitType", createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
          args: [itemId, id, item.productId, item.productName, item.quantity, item.unitPrice, item.subtotal, item.unitType || 'pcs', now],
        })
        await db.execute({
          sql: 'UPDATE "Product" SET stock = stock - ? WHERE id = ? AND stock >= ?',
          args: [(item as any).stockQty, item.productId, (item as any).stockQty],
        })
      }

      return res.status(201).json({
        id, subtotal: serverSubtotal, discount: serverDiscount, total: serverTotal,
        paymentMethod: method, amountPaid: serverAmountPaid, change: serverChange,
        cashierId: cleanCashierId, tabLabel: cleanTabLabel, items: validItems, createdAt: now
      })
    } catch (error) {
      return res.status(500).json({ error: 'Failed to create transaction' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withSecurity(handler, { methods: ['GET', 'POST'], rateLimitMax: 20 })
