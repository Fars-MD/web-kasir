import type { VercelRequest, VercelResponse } from '@vercel/node'
import { withSecurity } from '../../../lib/security'

async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return res.status(404).json({ error: 'Barcode lookup not supported' })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withSecurity(handler, { methods: ['GET'] })
