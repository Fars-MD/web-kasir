import { Router, Request, Response } from 'express'
import prisma from '../db'

const router = Router()

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [todayStats, weekStats, monthStats, productCount, lowStockCount] = await Promise.all([
      prisma.transaction.aggregate({
        where: { createdAt: { gte: todayStart }, status: 'completed' },
        _sum: { total: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { createdAt: { gte: weekStart }, status: 'completed' },
        _sum: { total: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { createdAt: { gte: monthStart }, status: 'completed' },
        _sum: { total: true },
        _count: true,
      }),
      prisma.product.count(),
      prisma.product.findMany({ select: { stock: true, minStock: true } }).then(
        (products) => products.filter((p) => p.stock <= p.minStock).length
      ),
    ])

    const recentTransactions = await prisma.transaction.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        total: true,
        tabLabel: true,
        createdAt: true,
        paymentMethod: true,
      },
    })

    res.json({
      today: { total: todayStats._sum.total || 0, count: todayStats._count },
      week: { total: weekStats._sum.total || 0, count: weekStats._count },
      month: { total: monthStats._sum.total || 0, count: monthStats._count },
      productCount,
      lowStockCount,
      recentTransactions,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch dashboard stats' })
  }
})

export default router
