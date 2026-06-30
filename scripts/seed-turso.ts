import { createClient } from '@libsql/client'

const db = createClient({
  url: 'libsql://toko-zhafar-zhafar.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE3ODMzOTExMDIsImdpZCI6IjQyMTRmZjlkLWI4MjYtNDJlNC05MjVhLWYzZGE0NzRhMTEzYyIsImlhdCI6MTc4Mjc4NjMwMiwia2lkIjoiY2QyUnBxa1RNX1JSUEtrNy1PS3V4NklQS0p4MzI2TjhTbHJ1VUdWcUpBTSIsInJpZCI6IjUxYjA3NmZjLTQxMmMtNGE4NC05ZjlhLTdiYzRkODA5ZThjNyJ9.-2dbM3AXG4MRxhPlTy1BKDHbdGQ-IUwgUa1wlDs1rUnrGcZHh1OFdQvLChWNW-nouKqY9pER6LD3tB1i6546DA',
})

const categories = [
  { id: 'cat-minuman', name: 'Minuman', color: '#0284c7' },
  { id: 'cat-rokok', name: 'Rokok', color: '#9333ea' },
  { id: 'cat-makanan', name: 'Makanan', color: '#dc2626' },
  { id: 'cat-bahan-makanan', name: 'Bahan Makanan', color: '#059669' },
]

const products = [
  // Minuman (Air)
  { id: 'p1', name: 'Le Minerale', category: 'cat-minuman', stock: 50, min: 10, tags: 'air,mineral,le minerale' },
  { id: 'p2', name: 'Aqua', category: 'cat-minuman', stock: 50, min: 10, tags: 'air,mineral,aqua' },
  { id: 'p3', name: 'Nipis Madu', category: 'cat-minuman', stock: 50, min: 10, tags: 'air,mineral,nipis madu' },
  { id: 'p4', name: 'Le Minerale Gede', category: 'cat-minuman', stock: 50, min: 10, tags: 'air,mineral,le minerale,gede' },
  { id: 'p5', name: 'Aqua Gede', category: 'cat-minuman', stock: 50, min: 10, tags: 'air,mineral,aqua,gede' },
  { id: 'p6', name: 'Panther', category: 'cat-minuman', stock: 50, min: 10, tags: 'air,mineral,panther' },
  { id: 'p7', name: 'Arinda', category: 'cat-minuman', stock: 50, min: 10, tags: 'air,mineral,arinda' },
  { id: 'p8', name: 'Granita', category: 'cat-minuman', stock: 50, min: 10, tags: 'air,mineral,granita' },
  { id: 'p9', name: 'Yakult', category: 'cat-minuman', stock: 50, min: 10, tags: 'air,mineral,yakult' },

  // Rokok
  { id: 'p10', name: 'Surya 16', category: 'cat-rokok', stock: 50, min: 10, tags: 'rokok,surya' },
  { id: 'p11', name: 'Surya 12', category: 'cat-rokok', stock: 50, min: 10, tags: 'rokok,surya' },
  { id: 'p12', name: 'Mahayana/Wayang 12', category: 'cat-rokok', stock: 50, min: 10, tags: 'rokok,mahayana,wayang' },
  { id: 'p13', name: 'Mahayana/Wayang 16', category: 'cat-rokok', stock: 50, min: 10, tags: 'rokok,mahayana,wayang' },
  { id: 'p14', name: '76 Apel', category: 'cat-rokok', stock: 50, min: 10, tags: 'rokok,76,apel' },
  { id: 'p15', name: 'Neslite Max 12', category: 'cat-rokok', stock: 50, min: 10, tags: 'rokok,neslite' },
  { id: 'p16', name: 'Gudang Garam Filter', category: 'cat-rokok', stock: 50, min: 10, tags: 'rokok,gudang garam' },
  { id: 'p17', name: 'Djarum Super', category: 'cat-rokok', stock: 50, min: 10, tags: 'rokok,djarum' },
  { id: 'p18', name: 'Djarum Super Kretek', category: 'cat-rokok', stock: 50, min: 10, tags: 'rokok,djarum,kretek' },
  { id: 'p19', name: 'Juara', category: 'cat-rokok', stock: 50, min: 10, tags: 'rokok,juara' },
  { id: 'p20', name: 'Sampoerna Mild Putih', category: 'cat-rokok', stock: 50, min: 10, tags: 'rokok,sampoerna,mild' },
  { id: 'p21', name: 'Gudang Garam Merah', category: 'cat-rokok', stock: 50, min: 10, tags: 'rokok,gudang garam,merah' },

  // Makanan
  { id: 'p22', name: 'Malkist Ambon', category: 'cat-makanan', stock: 50, min: 10, tags: 'makanan,malkist,ambon' },
  { id: 'p23', name: 'Malkist Merah', category: 'cat-makanan', stock: 50, min: 10, tags: 'makanan,malkist,merah' },
  { id: 'p24', name: 'Malkist Ijo', category: 'cat-makanan', stock: 50, min: 10, tags: 'makanan,malkist,ijo' },

  // Bahan Makanan
  { id: 'p25', name: 'Masako', category: 'cat-bahan-makanan', stock: 50, min: 10, tags: 'bahan masakan,masako,penyedap' },
  { id: 'p26', name: 'Racik Ayam', category: 'cat-bahan-makanan', stock: 50, min: 10, tags: 'bahan masakan,racik,ayam' },
  { id: 'p27', name: 'Racik Ikan', category: 'cat-bahan-makanan', stock: 50, min: 10, tags: 'bahan masakan,racik,ikan' },
  { id: 'p28', name: 'Racik Tempe', category: 'cat-bahan-makanan', stock: 50, min: 10, tags: 'bahan masakan,racik,tempe' },
  { id: 'p29', name: 'Bawang Putih Bubuk', category: 'cat-bahan-makanan', stock: 50, min: 10, tags: 'bahan masakan,bawang putih,bubuk' },
]

async function seed() {
  console.log('Seeding Turso database...')

  // Delete all existing products
  await db.execute('DELETE FROM "Product"')
  console.log('🗑️  Deleted all existing products')

  // Delete existing categories and re-insert
  await db.execute('DELETE FROM "Category"')

  for (const cat of categories) {
    await db.execute({
      sql: 'INSERT OR IGNORE INTO "Category" (id, name, color, createdAt, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
      args: [cat.id, cat.name, cat.color],
    })
  }
  console.log(`✅ ${categories.length} categories inserted`)

  for (const p of products) {
    await db.execute({
      sql: `INSERT INTO "Product" (id, name, "categoryId", "costPrice", "sellPrice", stock, "minStock", tags, description, createdAt, updatedAt) 
            VALUES (?, ?, ?, 0, 0, ?, ?, ?, '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      args: [p.id, p.name, p.category, p.stock, p.min, p.tags],
    })
  }
  console.log(`✅ ${products.length} products inserted`)

  process.exit(0)
}

seed().catch(e => { console.error(e); process.exit(1) })
