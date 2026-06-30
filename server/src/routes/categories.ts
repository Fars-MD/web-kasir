import { Router, Request, Response } from 'express'
import prisma from '../db'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    })
    res.json(categories)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body
    const category = await prisma.category.create({
      data: { name, color },
    })
    res.status(201).json(category)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category name already exists' })
    }
    res.status(500).json({ error: 'Failed to create category' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } })
    res.json({ message: 'Category deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' })
  }
})

export default router
