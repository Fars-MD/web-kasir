import { Router, Request, Response } from 'express'
import prisma from '../db'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    })
    res.json(products)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

router.get('/tags/all', async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({ select: { tags: true } })
    const allTags = new Set<string>()
    products.forEach((p) => {
      if (p.tags) {
        p.tags.split(',').forEach((tag) => {
          const trimmed = tag.trim()
          if (trimmed) allTags.add(trimmed)
        })
      }
    })
    res.json(Array.from(allTags).sort())
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tags' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    })
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

router.get('/barcode/:barcode', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { barcode: req.params.barcode },
      include: { category: true },
    })
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const { sku, barcode, name, categoryId, tags, description, costPrice, sellPrice, stock, minStock, imageUrl } = req.body
    const product = await prisma.product.create({
      data: { sku, barcode, name, categoryId, tags: tags || "", description, costPrice, sellPrice, stock, minStock, imageUrl },
      include: { category: true },
    })
    res.status(201).json(product)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'SKU or barcode already exists' })
    }
    res.status(500).json({ error: 'Failed to create product' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { sku, barcode, name, categoryId, tags, description, costPrice, sellPrice, stock, minStock, imageUrl } = req.body
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { sku, barcode, name, categoryId, tags: tags || "", description, costPrice, sellPrice, stock, minStock, imageUrl },
      include: { category: true },
    })
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } })
    res.json({ message: 'Product deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

export default router
