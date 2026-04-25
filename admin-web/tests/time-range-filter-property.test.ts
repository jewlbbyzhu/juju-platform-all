import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Helper function to check if a date is within a time range
 * @param date - Date to check (YYYY-MM-DD format)
 * @param startDate - Start date (YYYY-MM-DD format)
 * @param endDate - End date (YYYY-MM-DD format)
 * @returns true if date is within range (inclusive)
 */
function isDateInRange(date: string, startDate: string, endDate: string): boolean {
  const dateTime = new Date(date).getTime()
  const startTime = new Date(startDate).getTime()
  const endTime = new Date(endDate).getTime()
  
  return dateTime >= startTime && dateTime <= endTime
}

/**
 * Helper function to filter data by time range
 * @param data - Array of data with date field
 * @param startDate - Start date (YYYY-MM-DD format)
 * @param endDate - End date (YYYY-MM-DD format)
 * @returns Filtered data within the time range
 */
function filterByTimeRange<T extends { date: string }>(
  data: T[],
  startDate: string,
  endDate: string
): T[] {
  return data.filter(item => isDateInRange(item.date, startDate, endDate))
}

/**
 * Helper function to generate a valid date string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Date string in YYYY-MM-DD format
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

describe('Time Range Filter Property Tests', () => {
  test('Property 9: 时间范围数据筛选', () => {
    // Feature: web-admin-platform, Property 9: 时间范围数据筛选
    fc.assert(fc.property(
      fc.record({
        // Generate a valid time range
        startTimestamp: fc.integer({ 
          min: new Date('2020-01-01').getTime(), 
          max: new Date('2025-12-31').getTime() 
        }),
        durationDays: fc.integer({ min: 1, max: 365 }),
        // Generate data points
        dataPoints: fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            value: fc.integer({ min: 0, max: 1000000 }),
            timestamp: fc.integer({ 
              min: new Date('2020-01-01').getTime(), 
              max: new Date('2026-12-31').getTime() 
            })
          }),
          { minLength: 0, maxLength: 100 }
        )
      }),
      (testData) => {
        // Calculate end date
        const endTimestamp = testData.startTimestamp + (testData.durationDays * 24 * 60 * 60 * 1000)
        const startDate = formatDate(testData.startTimestamp)
        const endDate = formatDate(endTimestamp)
        
        // Convert data points to have date strings
        const dataWithDates = testData.dataPoints.map(point => ({
          ...point,
          date: formatDate(point.timestamp)
        }))
        
        // Filter data by time range
        const filteredData = filterByTimeRange(dataWithDates, startDate, endDate)
        
        // Property: All filtered data should be within the time range
        filteredData.forEach(item => {
          const itemTime = new Date(item.date).getTime()
          const startTime = new Date(startDate).getTime()
          const endTime = new Date(endDate).getTime()
          
          expect(itemTime).toBeGreaterThanOrEqual(startTime)
          expect(itemTime).toBeLessThanOrEqual(endTime)
        })
        
        // Property: No data outside the range should be included
        const excludedData = dataWithDates.filter(
          item => !filteredData.some(filtered => filtered.id === item.id)
        )
        excludedData.forEach(item => {
          const itemTime = new Date(item.date).getTime()
          const startTime = new Date(startDate).getTime()
          const endTime = new Date(endDate).getTime()
          
          const isOutsideRange = itemTime < startTime || itemTime > endTime
          expect(isOutsideRange).toBe(true)
        })
        
        // Property: Filtered count should be <= total count
        expect(filteredData.length).toBeLessThanOrEqual(dataWithDates.length)
      }
    ), { numRuns: 100 })
  })

  test('Property 10: Time range boundary inclusiveness', () => {
    // Feature: web-admin-platform, Property 10: Time range boundary inclusiveness
    fc.assert(fc.property(
      fc.record({
        startTimestamp: fc.integer({ 
          min: new Date('2020-01-01').getTime(), 
          max: new Date('2025-12-31').getTime() 
        }),
        durationDays: fc.integer({ min: 1, max: 30 })
      }),
      (testData) => {
        const endTimestamp = testData.startTimestamp + (testData.durationDays * 24 * 60 * 60 * 1000)
        const startDate = formatDate(testData.startTimestamp)
        const endDate = formatDate(endTimestamp)
        
        // Create data points at boundaries
        const boundaryData = [
          { id: 1, date: startDate, value: 100 },
          { id: 2, date: endDate, value: 200 },
          { id: 3, date: formatDate(testData.startTimestamp - 24 * 60 * 60 * 1000), value: 300 }, // Day before
          { id: 4, date: formatDate(endTimestamp + 24 * 60 * 60 * 1000), value: 400 } // Day after
        ]
        
        const filtered = filterByTimeRange(boundaryData, startDate, endDate)
        
        // Property: Start date should be included
        const hasStartDate = filtered.some(item => item.date === startDate)
        expect(hasStartDate).toBe(true)
        
        // Property: End date should be included
        const hasEndDate = filtered.some(item => item.date === endDate)
        expect(hasEndDate).toBe(true)
        
        // Property: Day before should be excluded
        const dayBefore = formatDate(testData.startTimestamp - 24 * 60 * 60 * 1000)
        const hasDayBefore = filtered.some(item => item.date === dayBefore)
        expect(hasDayBefore).toBe(false)
        
        // Property: Day after should be excluded
        const dayAfter = formatDate(endTimestamp + 24 * 60 * 60 * 1000)
        const hasDayAfter = filtered.some(item => item.date === dayAfter)
        expect(hasDayAfter).toBe(false)
      }
    ), { numRuns: 100 })
  })

  test('Property 11: Empty time range handling', () => {
    // Feature: web-admin-platform, Property 11: Empty time range handling
    fc.assert(fc.property(
      fc.record({
        timestamp: fc.integer({ 
          min: new Date('2020-01-01').getTime(), 
          max: new Date('2025-12-31').getTime() 
        }),
        dataPoints: fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            value: fc.integer({ min: 0, max: 10000 }),
            timestamp: fc.integer({ 
              min: new Date('2020-01-01').getTime(), 
              max: new Date('2026-12-31').getTime() 
            })
          }),
          { minLength: 1, maxLength: 50 }
        )
      }),
      (testData) => {
        const date = formatDate(testData.timestamp)
        
        // Convert data points to have date strings
        const dataWithDates = testData.dataPoints.map(point => ({
          ...point,
          date: formatDate(point.timestamp)
        }))
        
        // Filter with same start and end date (single day)
        const singleDayFiltered = filterByTimeRange(dataWithDates, date, date)
        
        // Property: Only data from that specific day should be included
        singleDayFiltered.forEach(item => {
          expect(item.date).toBe(date)
        })
        
        // Property: All data from that day should be included
        const expectedCount = dataWithDates.filter(item => item.date === date).length
        expect(singleDayFiltered.length).toBe(expectedCount)
      }
    ), { numRuns: 100 })
  })

  test('Property 12: Time range filter idempotence', () => {
    // Feature: web-admin-platform, Property 12: Time range filter idempotence
    fc.assert(fc.property(
      fc.record({
        startTimestamp: fc.integer({ 
          min: new Date('2020-01-01').getTime(), 
          max: new Date('2025-12-31').getTime() 
        }),
        durationDays: fc.integer({ min: 1, max: 90 }),
        dataPoints: fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            value: fc.integer({ min: 0, max: 1000000 }),
            timestamp: fc.integer({ 
              min: new Date('2020-01-01').getTime(), 
              max: new Date('2026-12-31').getTime() 
            })
          }),
          { minLength: 0, maxLength: 100 }
        )
      }),
      (testData) => {
        const endTimestamp = testData.startTimestamp + (testData.durationDays * 24 * 60 * 60 * 1000)
        const startDate = formatDate(testData.startTimestamp)
        const endDate = formatDate(endTimestamp)
        
        const dataWithDates = testData.dataPoints.map(point => ({
          ...point,
          date: formatDate(point.timestamp)
        }))
        
        // Filter once
        const filtered1 = filterByTimeRange(dataWithDates, startDate, endDate)
        
        // Filter the filtered data again with the same range
        const filtered2 = filterByTimeRange(filtered1, startDate, endDate)
        
        // Property: Filtering twice should produce the same result (idempotence)
        expect(filtered2.length).toBe(filtered1.length)
        expect(filtered2).toEqual(filtered1)
      }
    ), { numRuns: 100 })
  })

  test('Property 13: Time range subset relationship', () => {
    // Feature: web-admin-platform, Property 13: Time range subset relationship
    fc.assert(fc.property(
      fc.record({
        startTimestamp: fc.integer({ 
          min: new Date('2020-01-01').getTime(), 
          max: new Date('2025-01-01').getTime() 
        }),
        outerDuration: fc.integer({ min: 30, max: 365 }),
        innerOffset: fc.integer({ min: 1, max: 10 }),
        innerDuration: fc.integer({ min: 1, max: 20 }),
        dataPoints: fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            value: fc.integer({ min: 0, max: 1000000 }),
            timestamp: fc.integer({ 
              min: new Date('2020-01-01').getTime(), 
              max: new Date('2026-12-31').getTime() 
            })
          }),
          { minLength: 0, maxLength: 100 }
        )
      }),
      (testData) => {
        // Outer range
        const outerEndTimestamp = testData.startTimestamp + (testData.outerDuration * 24 * 60 * 60 * 1000)
        const outerStartDate = formatDate(testData.startTimestamp)
        const outerEndDate = formatDate(outerEndTimestamp)
        
        // Inner range (subset of outer range)
        const innerStartTimestamp = testData.startTimestamp + (testData.innerOffset * 24 * 60 * 60 * 1000)
        const innerEndTimestamp = Math.min(
          innerStartTimestamp + (testData.innerDuration * 24 * 60 * 60 * 1000),
          outerEndTimestamp
        )
        const innerStartDate = formatDate(innerStartTimestamp)
        const innerEndDate = formatDate(innerEndTimestamp)
        
        const dataWithDates = testData.dataPoints.map(point => ({
          ...point,
          date: formatDate(point.timestamp)
        }))
        
        // Filter with outer range
        const outerFiltered = filterByTimeRange(dataWithDates, outerStartDate, outerEndDate)
        
        // Filter with inner range
        const innerFiltered = filterByTimeRange(dataWithDates, innerStartDate, innerEndDate)
        
        // Property: Inner filtered should be a subset of outer filtered
        expect(innerFiltered.length).toBeLessThanOrEqual(outerFiltered.length)
        
        // Property: All items in inner filtered should also be in outer filtered
        innerFiltered.forEach(innerItem => {
          const existsInOuter = outerFiltered.some(outerItem => outerItem.id === innerItem.id)
          expect(existsInOuter).toBe(true)
        })
      }
    ), { numRuns: 100 })
  })
})
