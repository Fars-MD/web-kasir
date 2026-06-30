import { db } from '../../lib/db'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    try {
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const [todayStats, weekStats, monthStats, productCount, recentTx, todayProfit, weekProfit, monthProfit, todayPcs, weekPcs, monthPcs] = await Promise.all([
        db.execute({ sql: `SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM "Transaction" WHERE "createdAt" >= ? AND status = 'completed'`, args: [todayStart] }),
        db.execute({ sql: `SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM "Transaction" WHERE "createdAt" >= ? AND status = 'completed'`, args: [weekStart] }),
        db.execute({ sql: `SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM "Transaction" WHERE "createdAt" >= ? AND status = 'completed'`, args: [monthStart] }),
        db.execute('SELECT COUNT(*) as count FROM "Product"'),
        db.execute({ sql: `SELECT id, total, "tabLabel", "createdAt", "paymentMethod" FROM "Transaction" ORDER BY "createdAt" DESC LIMIT 10`, args: [] }),
        db.execute({ sql: `SELECT COALESCE(SUM(ti.quantity * (p."sellPrice" - p."costPrice")), 0) as profit FROM "TransactionItem" ti JOIN "Product" p ON ti."productId" = p.id JOIN "Transaction" t ON ti."transactionId" = t.id WHERE t."createdAt" >= ? AND t.status = 'completed'`, args: [todayStart] }),
        db.execute({ sql: `SELECT COALESCE(SUM(ti.quantity * (p."sellPrice" - p."costPrice")), 0) as profit FROM "TransactionItem" ti JOIN "Product" p ON ti."productId" = p.id JOIN "Transaction" t ON ti."transactionId" = t.id WHERE t."createdAt" >= ? AND t.status = 'completed'`, args: [weekStart] }),
        db.execute({ sql: `SELECT COALESCE(SUM(ti.quantity * (p."sellPrice" - p."costPrice")), 0) as profit FROM "TransactionItem" ti JOIN "Product" p ON ti."productId" = p.id JOIN "Transaction" t ON ti."transactionId" = t.id WHERE t."createdAt" >= ? AND t.status = 'completed'`, args: [monthStart] }),
        db.execute({ sql: `SELECT COALESCE(SUM(CASE WHEN ti."unitType" = 'pack' THEN ti.quantity * p."pcsPerPack" ELSE ti.quantity END), 0) as total_pcs FROM "TransactionItem" ti JOIN "Product" p ON ti."productId" = p.id JOIN "Transaction" t ON ti."transactionId" = t.id WHERE t."createdAt" >= ? AND t.status = 'completed'`, args: [todayStart] }),
        db.execute({ sql: `SELECT COALESCE(SUM(CASE WHEN ti."unitType" = 'pack' THEN ti.quantity * p."pcsPerPack" ELSE ti.quantity END), 0) as total_pcs FROM "TransactionItem" ti JOIN "Product" p ON ti."productId" = p.id JOIN "Transaction" t ON ti."transactionId" = t.id WHERE t."createdAt" >= ? AND t.status = 'completed'`, args: [weekStart] }),
        db.execute({ sql: `SELECT COALESCE(SUM(CASE WHEN ti."unitType" = 'pack' THEN ti.quantity * p."pcsPerPack" ELSE ti.quantity END), 0) as total_pcs FROM "TransactionItem" ti JOIN "Product" p ON ti."productId" = p.id JOIN "Transaction" t ON ti."transactionId" = t.id WHERE t."createdAt" >= ? AND t.status = 'completed'`, args: [monthStart] }),
      ])

      return res.json({
        today: { total: (todayStats.rows[0] as any).total, count: Number((todayStats.rows[0] as any).count), profit: (todayProfit.rows[0] as any).profit, totalPcs: Number((todayPcs.rows[0] as any).total_pcs) },
        week: { total: (weekStats.rows[0] as any).total, count: Number((weekStats.rows[0] as any).count), profit: (weekProfit.rows[0] as any).profit, totalPcs: Number((weekPcs.rows[0] as any).total_pcs) },
        month: { total: (monthStats.rows[0] as any).total, count: Number((monthStats.rows[0] as any).count), profit: (monthProfit.rows[0] as any).profit, totalPcs: Number((monthPcs.rows[0] as any).total_pcs) },
        productCount: Number((productCount.rows[0] as any).count),
        recentTransactions: recentTx.rows,
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Failed to fetch dashboard stats' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
