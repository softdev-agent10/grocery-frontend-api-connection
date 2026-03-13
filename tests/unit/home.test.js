import { render, screen } from '@testing-library/react'
import Home from '../../pages/index'

describe('Home Page', () => {
  it('renders welcome message', () => {
    render(<Home />)
    expect(screen.getByText('Welcome')).toBeInTheDocument()
  })

  it('displays correct title', () => {
    render(<Home />)
    expect(document.title).toBe('Grocery App')
  })
})