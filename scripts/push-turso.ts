import { createClient } from '@libsql/client'

const db = createClient({
  url: 'libsql://toko-zhafar-zhafar.aws-ap-northeast-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE3ODMzOTExMDIsImdpZCI6IjQyMTRmZjlkLWI4MjYtNDJlNC05MjVhLWYzZGE0NzRhMTEzYyIsImlhdCI6MTc4Mjc4NjMwMiwia2lkIjoiY2QyUnBxa1RNX1JSUEtrNy1PS3V4NklQS0p4MzI2TjhTbHJ1VUdWcUpBTSIsInJpZCI6IjUxYjA3NmZjLTQxMmMtNGE4NC05ZjlhLTdiYzRkODA5ZThjNyJ9.-2dbM3AXG4MRxhPlTy1BKDHbdGQ-IUwgUa1wlDs1rUnrGcZHh1OFdQvLChWNW-nouKqY9pER6LD3tB1i6546DA',
})

const schema = `
DROP TABLE IF EXISTS "TransactionItem";
DROP TABLE IF EXISTS "Transaction";
DROP TABLE IF EXISTS "Product";
DROP TABLE IF EXISTS "Category";

CREATE TABLE "Category" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "color" TEXT NOT NULL DEFAULT '#6D28D9',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Product" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "tags" TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL DEFAULT '',
  "costPrice" INTEGER NOT NULL,
  "sellPrice" INTEGER NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "minStock" INTEGER NOT NULL DEFAULT 5,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "Transaction" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "subtotal" INTEGER NOT NULL,
  "discount" INTEGER NOT NULL DEFAULT 0,
  "total" INTEGER NOT NULL,
  "paymentMethod" TEXT NOT NULL DEFAULT 'cash',
  "amountPaid" INTEGER,
  "change" INTEGER,
  "cashierId" TEXT NOT NULL DEFAULT 'admin',
  "tabLabel" TEXT NOT NULL DEFAULT 'Tab 1',
  "status" TEXT NOT NULL DEFAULT 'completed',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "TransactionItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "transactionId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "productName" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitPrice" INTEGER NOT NULL,
  "subtotal" INTEGER NOT NULL,
  "discount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
`

async function main() {
  console.log('Resetting Turso schema...')
  const statements = schema.split(';').filter(s => s.trim())
  for (const stmt of statements) {
    if (stmt.trim()) {
      await db.execute(stmt.trim())
    }
  }
  console.log('Schema pushed successfully!')
}

main().catch(console.error)
