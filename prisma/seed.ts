import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create categories
  const clothing = await prisma.category.create({
    data: { name: 'Pakaian', color: '#6D28D9' },
  })
  const accessories = await prisma.category.create({
    data: { name: 'Aksesoris', color: '#10B981' },
  })
  const electronics = await prisma.category.create({
    data: { name: 'Elektronik', color: '#F59E0B' },
  })

  // Create products
  const products = [
    { sku: 'KP001', barcode: '8991234567890', name: 'Kaos Polos M', categoryId: clothing.id, costPrice: 25000, sellPrice: 40000, stock: 50, minStock: 10 },
    { sku: 'KP002', barcode: '8991234567891', name: 'Kaos Polos L', categoryId: clothing.id, costPrice: 25000, sellPrice: 40000, stock: 45, minStock: 10 },
    { sku: 'KP003', barcode: '8991234567892', name: 'Kaos Polos XL', categoryId: clothing.id, costPrice: 28000, sellPrice: 45000, stock: 30, minStock: 10 },
    { sku: 'CJ001', barcode: '8991234567893', name: 'Celana Jeans', categoryId: clothing.id, costPrice: 150000, sellPrice: 250000, stock: 20, minStock: 5 },
    { sku: 'TB001', barcode: '8991234567894', name: 'Topi Baseball', categoryId: accessories.id, costPrice: 25000, sellPrice: 45000, stock: 35, minStock: 8 },
    { sku: 'JH001', barcode: '8991234567895', name: 'Jaket Hoodie', categoryId: clothing.id, costPrice: 100000, sellPrice: 180000, stock: 15, minStock: 5 },
    { sku: 'TS001', barcode: '8991234567896', name: 'Tas Selempang', categoryId: accessories.id, costPrice: 40000, sellPrice: 75000, stock: 25, minStock: 5 },
    { sku: 'SP001', barcode: '8991234567897', name: 'Sepatu Sneakers', categoryId: clothing.id, costPrice: 200000, sellPrice: 350000, stock: 10, minStock: 3 },
    { sku: 'EL001', barcode: '8991234567898', name: 'Headphone Bluetooth', categoryId: electronics.id, costPrice: 150000, sellPrice: 250000, stock: 8, minStock: 3 },
    { sku: 'EL002', barcode: '8991234567899', name: 'Charger HP 20W', categoryId: electronics.id, costPrice: 50000, sellPrice: 85000, stock: 40, minStock: 10 },
    { sku: 'KP004', barcode: '8991234567900', name: 'Kaos Polos S', categoryId: clothing.id, costPrice: 25000, sellPrice: 40000, stock: 4, minStock: 10 },
    { sku: 'TB002', barcode: '8991234567901', name: 'Topi Dadu', categoryId: accessories.id, costPrice: 20000, sellPrice: 35000, stock: 30, minStock: 8 },
  ]

  for (const product of products) {
    await prisma.product.create({ data: product })
  }

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
