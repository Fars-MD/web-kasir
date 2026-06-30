import { Router, Request, Response } from 'express'
import prisma from '../db'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, cashierId, paymentMethod } = req.query
    const where: any = {}

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      }
    }
    if (cashierId) where.cashierId = cashierId
    if (paymentMethod) where.paymentMethod = paymentMethod

    const transactions = await prisma.transaction.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json(transactions)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    })
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' })
    res.json(transaction)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const { items, subtotal, discount, total, paymentMethod, amountPaid, change, cashierId, tabLabel } = req.body

    const transaction = await prisma.transaction.create({
      data: {
        subtotal,
        discount: discount || 0,
        total,
        paymentMethod: paymentMethod || 'cash',
        amountPaid,
        change,
        cashierId: cashierId || 'admin',
        tabLabel: tabLabel || 'Tab 1',
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
            discount: item.discount || 0,
          })),
        },
      },
      include: { items: true },
    })

    // Update stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    res.status(201).json(transaction)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create transaction' })
  }
})

export default router
