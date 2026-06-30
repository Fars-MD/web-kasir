import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import productRoutes from './routes/products'
import transactionRoutes from './routes/transactions'
import categoryRoutes from './routes/categories'
import dashboardRoutes from './routes/dashboard'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/products', productRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
