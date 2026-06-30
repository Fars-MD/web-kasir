export interface Category {
  id: string
  name: string
  color: string
  unitLabel: string
  _count?: { products: number }
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  categoryId: string
  tags: string
  description: string
  costPrice: number
  sellPrice: number
  packPrice: number
  pcsPerPack: number
  stock: number
  minStock: number
  imageUrl: string | null
  category: Category
  createdAt: string
  updatedAt: string
}

export interface TransactionItem {
  id?: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
  discount: number
}

export interface Transaction {
  id: string
  subtotal: number
  discount: number
  total: number
  paymentMethod: 'cash' | 'qris' | 'transfer'
  amountPaid: number | null
  change: number | null
  cashierId: string
  tabLabel: string
  status: string
  items: TransactionItem[]
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  costPrice: number
  subtotal: number
  discount: number
  unitType: 'pcs' | 'pack'
  unitLabel: string
}

export interface Tab {
  id: string
  label: string
  cart: CartItem[]
  discount: number
}

export interface DashboardStats {
  today: { total: number; count: number; profit: number; totalPcs: number }
  week: { total: number; count: number; profit: number; totalPcs: number }
  month: { total: number; count: number; profit: number; totalPcs: number }
  productCount: number
  recentTransactions: {
    id: string
    total: number
    tabLabel: string
    createdAt: string
    paymentMethod: string
  }[]
}
