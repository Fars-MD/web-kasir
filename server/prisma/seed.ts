import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Hapus semua data lama
  await prisma.transactionItem.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  // Create categories
  const rokok = await prisma.category.create({
    data: { name: 'Rokok', color: '#EF4444' },
  })
  const bahanMasakan = await prisma.category.create({
    data: { name: 'Bahan Masakan', color: '#F59E0B' },
  })
  const minuman = await prisma.category.create({
    data: { name: 'Minuman', color: '#3B82F6' },
  })
  const sembako = await prisma.category.create({
    data: { name: 'Sembako', color: '#10B981' },
  })
  const snack = await prisma.category.create({
    data: { name: 'Snack & Mie Instan', color: '#8B5CF6' },
  })

  // Rokok
  const rokokProducts = [
    { sku: 'RK001', barcode: '8997001234501', name: 'Sampoerna A Mild', categoryId: rokok.id, tags: 'rokok,kretek,populer', costPrice: 28000, sellPrice: 32000, stock: 50, minStock: 10 },
    { sku: 'RK002', barcode: '8997001234502', name: 'Djarum Super', categoryId: rokok.id, tags: 'rokok,kretek,legendaris', costPrice: 22000, sellPrice: 25000, stock: 40, minStock: 10 },
    { sku: 'RK003', barcode: '8997001234503', name: 'Gudang Garam International', categoryId: rokok.id, tags: 'rokok,kretek,premium', costPrice: 30000, sellPrice: 34000, stock: 35, minStock: 10 },
    { sku: 'RK004', barcode: '8997001234504', name: 'Marlboro Red', categoryId: rokok.id, tags: 'rokok,import,populer', costPrice: 32000, sellPrice: 36000, stock: 30, minStock: 8 },
    { sku: 'RK005', barcode: '8997001234505', name: 'Surya 12', categoryId: rokok.id, tags: 'rokok,kretek,ekonomis', costPrice: 18000, sellPrice: 21000, stock: 60, minStock: 15 },
    { sku: 'RK006', barcode: '8997001234506', name: 'Malboro Lights', categoryId: rokok.id, tags: 'rokok,import,light', costPrice: 32000, sellPrice: 36000, stock: 25, minStock: 8 },
    { sku: 'RK007', barcode: '8997001234507', name: 'Djarum 76', categoryId: rokok.id, tags: 'rokok,kretek,ekonomis', costPrice: 15000, sellPrice: 18000, stock: 45, minStock: 10 },
    { sku: 'RK008', barcode: '8997001234508', name: 'LA Bold', categoryId: rokok.id, tags: 'rokok,kretek,ekonomis', costPrice: 16000, sellPrice: 19000, stock: 55, minStock: 10 },
  ]

  // Bahan Masakan
  const bahanProducts = [
    { sku: 'BM001', barcode: '8991234560001', name: 'Minyak Goreng Bimoli 1L', categoryId: bahanMasakan.id, tags: 'bahanmasak,minyak,populer', costPrice: 14000, sellPrice: 17000, stock: 30, minStock: 10 },
    { sku: 'BM002', barcode: '8991234560002', name: 'Minyak Goreng Tropical 1L', categoryId: bahanMasakan.id, tags: 'bahanmasak,minyak', costPrice: 13000, sellPrice: 16000, stock: 25, minStock: 8 },
    { sku: 'BM003', barcode: '8991234560003', name: 'Gula Pasir Gulaku 1kg', categoryId: bahanMasakan.id, tags: 'bahanmasak,gula,populer', costPrice: 15000, sellPrice: 18000, stock: 40, minStock: 10 },
    { sku: 'BM004', barcode: '8991234560004', name: 'Garam Dapur Refina 500g', categoryId: bahanMasakan.id, tags: 'bahanmasak,garam', costPrice: 4000, sellPrice: 6000, stock: 50, minStock: 15 },
    { sku: 'BM005', barcode: '8991234560005', name: 'Kecap Manis ABC 600ml', categoryId: bahanMasakan.id, tags: 'bahanmasak,kecap,populer', costPrice: 12000, sellPrice: 15000, stock: 35, minStock: 10 },
    { sku: 'BM006', barcode: '8991234560006', name: 'Saos Sambal ABC 335ml', categoryId: bahanMasakan.id, tags: 'bahanmasak,saos,sambal', costPrice: 8000, sellPrice: 11000, stock: 30, minStock: 8 },
    { sku: 'BM007', barcode: '8991234560007', name: 'Tepung Terigu Segitiga Biru 1kg', categoryId: bahanMasakan.id, tags: 'bahanmasak,tepung', costPrice: 9000, sellPrice: 12000, stock: 45, minStock: 10 },
    { sku: 'BM008', barcode: '8991234560008', name: 'Telur Ayam 1kg', categoryId: bahanMasakan.id, tags: 'bahanmasak,telur,populer', costPrice: 25000, sellPrice: 28000, stock: 20, minStock: 5 },
    { sku: 'BM009', barcode: '8991234560009', name: 'Beras Premium 5kg', categoryId: bahanMasakan.id, tags: 'bahanmasak,beras,pokok', costPrice: 55000, sellPrice: 62000, stock: 15, minStock: 5 },
    { sku: 'BM010', barcode: '8991234560010', name: 'Bawang Merah 250g', categoryId: bahanMasakan.id, tags: 'bahanmasak,bumbu', costPrice: 8000, sellPrice: 10000, stock: 20, minStock: 5 },
    { sku: 'BM011', barcode: '8991234560011', name: 'Bawang Putih 250g', categoryId: bahanMasakan.id, tags: 'bahanmasak,bumbu', costPrice: 7000, sellPrice: 9000, stock: 25, minStock: 5 },
    { sku: 'BM012', barcode: '8991234560012', name: 'Cabai Merah 250g', categoryId: bahanMasakan.id, tags: 'bahanmasak,bumbu,pedas', costPrice: 12000, sellPrice: 15000, stock: 15, minStock: 3 },
  ]

  // Minuman
  const minumanProducts = [
    { sku: 'MN001', barcode: '8991234561001', name: 'Aqua 600ml', categoryId: minuman.id, tags: 'minuman,air,mineral,populer', costPrice: 3000, sellPrice: 4000, stock: 100, minStock: 30 },
    { sku: 'MN002', barcode: '8991234561002', name: 'Aqua 1500ml', categoryId: minuman.id, tags: 'minuman,air,mineral', costPrice: 5000, sellPrice: 7000, stock: 50, minStock: 15 },
    { sku: 'MN003', barcode: '8991234561003', name: 'Coca Cola 390ml', categoryId: minuman.id, tags: 'minuman,soda,populer', costPrice: 4000, sellPrice: 6000, stock: 40, minStock: 10 },
    { sku: 'MN004', barcode: '8991234561004', name: 'Sprite 390ml', categoryId: minuman.id, tags: 'minuman,soda', costPrice: 4000, sellPrice: 6000, stock: 40, minStock: 10 },
    { sku: 'MN005', barcode: '8991234561005', name: 'Fanta Strawberry 390ml', categoryId: minuman.id, tags: 'minuman,soda', costPrice: 4000, sellPrice: 6000, stock: 35, minStock: 10 },
    { sku: 'MN006', barcode: '8991234561006', name: 'Teh Pucuk Harum 450ml', categoryId: minuman.id, tags: 'minuman,teh,populer', costPrice: 3000, sellPrice: 5000, stock: 60, minStock: 15 },
    { sku: 'MN007', barcode: '8991234561007', name: 'Teh Botol Sosro 450ml', categoryId: minuman.id, tags: 'minuman,teh', costPrice: 3500, sellPrice: 5500, stock: 50, minStock: 15 },
    { sku: 'MN008', barcode: '8991234561008', name: 'Kopi Kapal Api Sachet', categoryId: minuman.id, tags: 'minuman,kopi,sachet,populer', costPrice: 1500, sellPrice: 2500, stock: 100, minStock: 30 },
    { sku: 'MN009', barcode: '8991234561009', name: 'Kopi ABC Sachet', categoryId: minuman.id, tags: 'minuman,kopi,sachet', costPrice: 1500, sellPrice: 2500, stock: 100, minStock: 30 },
    { sku: 'MN010', barcode: '8991234561010', name: 'Indomilk Susu UHT 200ml', categoryId: minuman.id, tags: 'minuman,susu', costPrice: 3500, sellPrice: 5000, stock: 40, minStock: 10 },
    { sku: 'MN011', barcode: '8991234561011', name: 'Pocari Sweat 350ml', categoryId: minuman.id, tags: 'minuman,isotonic,olahraga', costPrice: 5000, sellPrice: 7000, stock: 30, minStock: 8 },
    { sku: 'MN012', barcode: '8991234561012', name: 'Extra Joss Sachet', categoryId: minuman.id, tags: 'minuman,energi,sachet', costPrice: 1200, sellPrice: 2000, stock: 80, minStock: 20 },
  ]

  // Sembako
  const sembakoProducts = [
    { sku: 'SB001', barcode: '8991234562001', name: 'Sabun Lifebuoy Batang', categoryId: sembako.id, tags: 'obat,sabun,kesehatan', costPrice: 3000, sellPrice: 4500, stock: 50, minStock: 15 },
    { sku: 'SB002', barcode: '8991234562002', name: 'Sabun Rinso 750ml', categoryId: sembako.id, tags: 'obat,deterjen,cuci', costPrice: 9000, sellPrice: 12000, stock: 30, minStock: 8 },
    { sku: 'SB003', barcode: '8991234562003', name: 'Minyak Kayu Putih 120ml', categoryId: sembako.id, tags: 'obat,minyak,kesehatan', costPrice: 15000, sellPrice: 18000, stock: 20, minStock: 5 },
    { sku: 'SB004', barcode: '8991234562004', name: 'Pasta Gigi Pepsodent 170g', categoryId: sembako.id, tags: 'obat,gigi,kesehatan', costPrice: 8000, sellPrice: 11000, stock: 35, minStock: 10 },
    { sku: 'SB005', barcode: '8991234562005', name: 'Tisu Paseo 250 sheet', categoryId: sembako.id, tags: 'sembako,tisu,kebutuhan', costPrice: 6000, sellPrice: 8500, stock: 40, minStock: 10 },
    { sku: 'SB006', barcode: '8991234562006', name: 'Baterai ABC AA (2pcs)', categoryId: sembako.id, tags: 'sembako,baterai,listrik', costPrice: 8000, sellPrice: 10000, stock: 25, minStock: 8 },
    { sku: 'SB007', barcode: '8991234562007', name: 'Gas Elpiji 3kg', categoryId: sembako.id, tags: 'sembako,gas,memasak,populer', costPrice: 18000, sellPrice: 20000, stock: 10, minStock: 3 },
    { sku: 'SB008', barcode: '8991234562008', name: 'Korek Api Gas', categoryId: sembako.id, tags: 'sembako,korek,api', costPrice: 2000, sellPrice: 3500, stock: 60, minStock: 15 },
  ]

  // Snack & Mie Instan
  const snackProducts = [
    { sku: 'SN001', barcode: '8991234563001', name: 'Indomie Goreng', categoryId: snack.id, tags: 'makanan,mieinstan,populer', costPrice: 2200, sellPrice: 3000, stock: 100, minStock: 30 },
    { sku: 'SN002', barcode: '8991234563002', name: 'Indomie Kuah Soto', categoryId: snack.id, tags: 'makanan,mieinstan', costPrice: 2200, sellPrice: 3000, stock: 80, minStock: 25 },
    { sku: 'SN003', barcode: '8991234563003', name: 'Indomie Kuah Ayam Bawang', categoryId: snack.id, tags: 'makanan,mieinstan', costPrice: 2200, sellPrice: 3000, stock: 80, minStock: 25 },
    { sku: 'SN004', barcode: '8991234563004', name: 'Mie Sedaap Goreng', categoryId: snack.id, tags: 'makanan,mieinstan', costPrice: 2200, sellPrice: 3000, stock: 70, minStock: 20 },
    { sku: 'SN005', barcode: '8991234563005', name: 'Pop Mie Cup', categoryId: snack.id, tags: 'makanan,mieinstan,cup', costPrice: 4500, sellPrice: 6000, stock: 30, minStock: 10 },
    { sku: 'SN006', barcode: '8991234563006', name: 'Chitato Sapi Panggang 68g', categoryId: snack.id, tags: 'makanan,keripik,premium', costPrice: 8000, sellPrice: 10500, stock: 25, minStock: 5 },
    { sku: 'SN007', barcode: '8991234563007', name: 'Lays Rumput Laut 68g', categoryId: snack.id, tags: 'makanan,keripik,import', costPrice: 7500, sellPrice: 10000, stock: 25, minStock: 5 },
    { sku: 'SN008', barcode: '8991234563008', name: 'Taro Net 38g', categoryId: snack.id, tags: 'makanan,keripik,ringan', costPrice: 2500, sellPrice: 4000, stock: 40, minStock: 10 },
    { sku: 'SN009', barcode: '8991234563009', name: 'Kerupuk Udang 200g', categoryId: snack.id, tags: 'makanan,kerupuk,lauk', costPrice: 8000, sellPrice: 10000, stock: 20, minStock: 5 },
    { sku: 'SN010', barcode: '8991234563010', name: 'Oreo Vanilla 137g', categoryId: snack.id, tags: 'makanan,biskuit,manis', costPrice: 7000, sellPrice: 9500, stock: 30, minStock: 8 },
  ]

  const allProducts = [
    ...rokokProducts,
    ...bahanProducts,
    ...minumanProducts,
    ...sembakoProducts,
    ...snackProducts,
  ]

  for (const product of allProducts) {
    await prisma.product.create({ data: product })
  }

  console.log(`Seed data created: ${allProducts.length} products across 5 categories`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
