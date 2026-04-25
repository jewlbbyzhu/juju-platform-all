import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Hero from '@/components/marketing/Hero'

describe('Hero', () => {
  it('renders hero section with title', () => {
    render(<Hero />)
    expect(screen.getByText('让每一次聚会都')).toBeInTheDocument()
    expect(screen.getByText('充满惊喜')).toBeInTheDocument()
  })

  it('renders download button', () => {
    render(<Hero />)
    const downloadButton = screen.getByText('立即下载')
    expect(downloadButton).toBeInTheDocument()
    expect(downloadButton.closest('a')).toHaveAttribute('href', '/download')
  })

  it('renders learn more button', () => {
    render(<Hero />)
    const learnMoreButton = screen.getByText('了解更多')
    expect(learnMoreButton).toBeInTheDocument()
    expect(learnMoreButton.closest('button')).toBeInTheDocument()
  })
})
