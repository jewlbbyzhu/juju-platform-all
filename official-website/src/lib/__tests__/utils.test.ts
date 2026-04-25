import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('merges class names correctly', () => {
    const result = cn('foo', 'bar')
    expect(result).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    const result = cn('foo', false && 'bar', 'baz')
    expect(result).toBe('foo baz')
  })

  it('handles undefined and null values', () => {
    const result = cn('foo', undefined, null, 'bar')
    expect(result).toBe('foo bar')
  })
})
