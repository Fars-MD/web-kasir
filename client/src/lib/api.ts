const IS_TAURI = typeof window.__TAURI__ !== 'undefined'
const IS_MOBILE = IS_TAURI && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
const API_BASE = IS_MOBILE
  ? 'https://kasirku-flame.vercel.app/api'
  : IS_TAURI
    ? 'http://localhost:3001/api'
    : '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }
  return res.json()
}

export const api = {
  products: {
    list: () => request<any[]>('/products'),
    get: (id: string) => request<any>(`/products/${id}`),
    getByBarcode: (barcode: string) => request<any>(`/products/barcode/${barcode}`),
    tags: () => request<string[]>('/products/tags'),
    create: (data: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/products/${id}`, { method: 'DELETE' }),
  },
  transactions: {
    list: (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : ''
      return request<any[]>(`/transactions${query}`)
    },
    get: (id: string) => request<any>(`/transactions/${id}`),
    create: (data: any) => request<any>('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  },
  categories: {
    list: () => request<any[]>('/categories'),
    create: (data: any) => request<any>('/categories', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/categories/${id}`, { method: 'DELETE' }),
  },
  dashboard: {
    stats: () => request<any>('/dashboard/stats'),
  },
}
