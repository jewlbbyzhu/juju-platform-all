import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'
import { calculateGrowthRate, getTrendType } from '@/utils/dashboard'

/**
 * Feature: web-admin-platform, Property 2: 数据增长率计算正确性
 * 
 * Property: For any combination of today's data and yesterday's data,
 * the growth rate calculation should equal (today - yesterday) / yesterday * 100%
 * 
 * Validates: Requirements 2.2
 */
describe('Property Test: Dashboard Growth Rate Calculation', () => {
  test('Property 2: 数据增长率计算正确性', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary positive numbers for current and previous values
        fc.record({
          current: fc.double({ min: 0, max: 1000000, noNaN: true }),
          previous: fc.double({ min: 0, max: 1000000, noNaN: true })
        }),
        ({ current, previous }) => {
          const growthRate = calculateGrowthRate(current, previous)
          
          // Edge case: when previous is 0 or very small (below threshold)
          const threshold = 1e-10
          if (previous === 0 || Math.abs(previous) < threshold) {
            if (current > 0) {
              expect(growthRate).toBe(100)
            } else {
              expect(growthRate).toBe(0)
            }
            return true
          }
          
          // Normal case: verify the formula
          const expectedRate = ((current - previous) / previous) * 100
          
          // Allow small floating point differences
          const tolerance = 0.0001
          expect(Math.abs(growthRate - expectedRate)).toBeLessThan(tolerance)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Growth rate should be positive when current > previous', () => {
    fc.assert(
      fc.property(
        fc.record({
          previous: fc.double({ min: 1, max: 1000000, noNaN: true }),
          increase: fc.double({ min: 0.01, max: 1000000, noNaN: true })
        }),
        ({ previous, increase }) => {
          const current = previous + increase
          const growthRate = calculateGrowthRate(current, previous)
          
          expect(growthRate).toBeGreaterThan(0)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Growth rate should be negative when current < previous', () => {
    fc.assert(
      fc.property(
        fc.record({
          previous: fc.double({ min: 1, max: 1000000, noNaN: true }),
          decrease: fc.double({ min: 0.01, max: 1, noNaN: true })
        }),
        ({ previous, decrease }) => {
          const current = previous * (1 - decrease)
          const growthRate = calculateGrowthRate(current, previous)
          
          expect(growthRate).toBeLessThan(0)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Growth rate should be 0 when current equals previous', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 1, max: 1000000, noNaN: true }), // Exclude very small numbers
        (value) => {
          const growthRate = calculateGrowthRate(value, value)
          
          expect(Math.abs(growthRate)).toBeLessThan(0.0001)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Trend type should match growth rate sign', () => {
    fc.assert(
      fc.property(
        fc.record({
          current: fc.double({ min: 0, max: 1000000, noNaN: true }),
          previous: fc.double({ min: 1, max: 1000000, noNaN: true })
        }),
        ({ current, previous }) => {
          const growthRate = calculateGrowthRate(current, previous)
          const trendType = getTrendType(growthRate)
          
          if (growthRate > 0.1) {
            expect(trendType).toBe('up')
          } else if (growthRate < -0.1) {
            expect(trendType).toBe('down')
          } else {
            expect(trendType).toBe('stable')
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
