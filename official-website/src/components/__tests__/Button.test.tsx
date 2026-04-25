import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByText('Click me')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    const button = screen.getByText('Click me')
    expect(button).toBeDisabled()
  })
})
