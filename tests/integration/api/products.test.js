import { createServer } from '../../../mocks/server'

describe('Products API Integration', () => {
  it('fetches product list successfully', async () => {
    const response = await fetch('/api/products')
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.products).toHaveLength(10)
  })
})