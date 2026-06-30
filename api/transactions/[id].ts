import { db } from '../../lib/db'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const tx = await db.execute({ sql: 'SELECT * FROM "Transaction" WHERE id = ?', args: [id as string] })
      if (tx.rows.length === 0) return res.status(404).json({ error: 'Transaction not found' })
      const items = await db.execute({ sql: 'SELECT * FROM "TransactionItem" WHERE "transactionId" = ?', args: [id as string] })
      return res.json({ ...tx.rows[0], items: items.rows })
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch transaction' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
