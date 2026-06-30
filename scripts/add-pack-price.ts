import { createClient } from '@libsql/client'

const db = createClient({
  url: 'libsql://toko-zhafar-zhafar.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE3ODMzOTExMDIsImdpZCI6IjQyMTRmZjlkLWI4MjYtNDJlNC05MjVhLWYzZGE0NzRhMTEzYyIsImlhdCI6MTc4Mjc4NjMwMiwia2lkIjoiY2QyUnBxa1RNX1JSUEtrNy1PS3V4NklQS0p4MzI2TjhTbHJ1VUdWcUpBTSIsInJpZCI6IjUxYjA3NmZjLTQxMmMtNGE4NC05ZjlhLTdiYzRkODA5ZThjNyJ9.-2dbM3AXG4MRxhPlTy1BKDHbdGQ-IUwgUa1wlDs1rUnrGcZHh1OFdQvLChWNW-nouKqY9pER6LD3tB1i6546DA'
})

async function main() {
  try {
    await db.execute('ALTER TABLE "Product" ADD COLUMN "packPrice" INTEGER NOT NULL DEFAULT 0')
    console.log('Added packPrice column')
  } catch (e: any) {
    if (e.message?.includes('already exists')) {
      console.log('packPrice column already exists')
    } else throw e
  }

  // Verify
  const r = await db.execute('SELECT id, name, "costPrice", "sellPrice", "packPrice" FROM "Product" LIMIT 5')
  console.log('\nProducts:')
  r.rows.forEach((row: any) => console.log(` ${row.name}: modal=${row.costPrice} jual=${row.sellPrice} pack=${row.packPrice}`))
}

main().catch(console.error)
