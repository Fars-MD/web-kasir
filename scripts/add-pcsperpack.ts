import { createClient } from '@libsql/client'

const db = createClient({
  url: 'libsql://toko-zhafar-zhafar.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE3ODMzOTExMDIsImdpZCI6IjQyMTRmZjlkLWI4MjYtNDJlNC05MjVhLWYzZGE0NzRhMTEzYyIsImlhdCI6MTc4Mjc4NjMwMiwia2lkIjoiY2QyUnBxa1RNX1JSUEtrNy1PS3V4NklQS0p4MzI2TjhTbHJ1VUdWcUpBTSIsInJpZCI6IjUxYjA3NmZjLTQxMmMtNGE4NC05ZjlhLTdiYzRkODA5ZThjNyJ9.-2dbM3AXG4MRxhPlTy1BKDHbdGQ-IUwgUa1wlDs1rUnrGcZHh1OFdQvLChWNW-nouKqY9pER6LD3tB1i6546DA',
})

async function main() {
  await db.execute(`ALTER TABLE "Product" ADD COLUMN "pcsPerPack" INTEGER NOT NULL DEFAULT 1`)
  console.log('Added pcsPerPack column!')
}

main().catch(console.error)
