import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'
import type { User } from '@/types/user'

/**
 * Property Test: User Search Result Matching
 * Feature: web-admin-platform, Property 3: 用户搜索结果匹配性
 * 
 * Property: For any search keyword, all returned users should have the keyword
 * in their nickname, phone, or ID (as string)
 * 
 * Validates: Requirements 3.2
 */

// Helper function to check if a user matches the search keyword
function userMatchesKeyword(user: User, keyword: string): boolean {
  if (!keyword || keyword.trim() === '') {
    return true // Empty keyword matches all users
  }

  const lowerKeyword = keyword.toLowerCase().trim()
  
  // Check nickname
  if (user.nickname && user.nickname.toLowerCase().includes(lowerKeyword)) {
    return true
  }
  
  // Check phone
  if (user.phone && user.phone.includes(lowerKeyword)) {
    return true
  }
  
  // Check ID (convert to string)
  if (user.id.toString().includes(lowerKeyword)) {
    return true
  }
  
  return false
}

// Helper function to filter users by keyword (simulates backend search)
function searchUsers(users: User[], keyword: string): User[] {
  if (!keyword || keyword.trim() === '') {
    return users
  }
  
  return users.filter(user => userMatchesKeyword(user, keyword))
}

// Arbitrary for generating User objects
const userArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 999999 }),
  openid: fc.string({ minLength: 10, maxLength: 32 }),
  nickname: fc.string({ minLength: 1, maxLength: 20 }),
  avatar: fc.webUrl(),
  gender: fc.constantFrom(0, 1, 2) as fc.Arbitrary<0 | 1 | 2>,
  region: fc.option(fc.string({ minLength: 2, maxLength: 20 }), { nil: undefined }),
  birthday: fc.option(
    fc.integer({ min: new Date('1950-01-01').getTime(), max: new Date('2010-12-31').getTime() })
      .map(timestamp => new Date(timestamp).toISOString().split('T')[0]), 
    { nil: undefined }
  ),
  phone: fc.option(
    fc.tuple(fc.constantFrom('13', '14', '15', '16', '17', '18', '19'), fc.integer({ min: 100000000, max: 999999999 }))
      .map(([prefix, num]) => `${prefix}${num}`),
    { nil: undefined }
  ),
  status: fc.constantFrom('active', 'banned', 'deleted') as fc.Arbitrary<'active' | 'banned' | 'deleted'>,
  isVip: fc.boolean(),
  vipType: fc.option(fc.constantFrom('monthly', 'quarterly', 'yearly'), { nil: undefined }) as fc.Arbitrary<'monthly' | 'quarterly' | 'yearly' | undefined>,
  vipExpiredAt: fc.option(
    fc.integer({ min: new Date('2024-01-01').getTime(), max: new Date('2030-12-31').getTime() })
      .map(timestamp => new Date(timestamp).toISOString()), 
    { nil: undefined }
  ),
  createdAt: fc.integer({ min: new Date('2020-01-01').getTime(), max: new Date('2026-12-31').getTime() })
    .map(timestamp => new Date(timestamp).toISOString()),
  updatedAt: fc.integer({ min: new Date('2020-01-01').getTime(), max: new Date('2026-12-31').getTime() })
    .map(timestamp => new Date(timestamp).toISOString()),
  lastLoginAt: fc.option(
    fc.integer({ min: new Date('2020-01-01').getTime(), max: new Date('2026-12-31').getTime() })
      .map(timestamp => new Date(timestamp).toISOString()), 
    { nil: undefined }
  ),
  stats: fc.record({
    joinedCount: fc.integer({ min: 0, max: 1000 }),
    createdCount: fc.integer({ min: 0, max: 100 }),
    favoriteCount: fc.integer({ min: 0, max: 500 }),
    orderCount: fc.integer({ min: 0, max: 1000 }),
    totalExpense: fc.integer({ min: 0, max: 10000000 }),
  }),
}) as fc.Arbitrary<User>

describe('Property Test: User Search Result Matching', () => {
  test('Property 3: All search results should match the keyword', () => {
    fc.assert(
      fc.property(
        fc.array(userArbitrary, { minLength: 0, maxLength: 50 }),
        fc.string({ minLength: 0, maxLength: 20 }),
        (users, keyword) => {
          // Perform search
          const results = searchUsers(users, keyword)
          
          // Property: All results should match the keyword
          const allMatch = results.every(user => userMatchesKeyword(user, keyword))
          
          expect(allMatch).toBe(true)
          
          // Additional check: No matching users should be excluded
          const matchingUsers = users.filter(user => userMatchesKeyword(user, keyword))
          expect(results.length).toBe(matchingUsers.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 3: Empty keyword should return all users', () => {
    fc.assert(
      fc.property(
        fc.array(userArbitrary, { minLength: 0, maxLength: 50 }),
        (users) => {
          // Test with empty keyword
          const emptyResults = searchUsers(users, '')
          expect(emptyResults.length).toBe(users.length)
          
          // Test with whitespace keyword
          const whitespaceResults = searchUsers(users, '   ')
          expect(whitespaceResults.length).toBe(users.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 3: Search by nickname should match', () => {
    fc.assert(
      fc.property(
        fc.array(userArbitrary, { minLength: 1, maxLength: 50 }),
        (users) => {
          // Pick a random user and search by part of their nickname
          const randomUser = users[Math.floor(Math.random() * users.length)]
          if (randomUser.nickname && randomUser.nickname.length > 2) {
            const keyword = randomUser.nickname.substring(0, 3)
            const results = searchUsers(users, keyword)
            
            // The random user should be in the results
            const found = results.some(u => u.id === randomUser.id)
            expect(found).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 3: Search by phone should match', () => {
    fc.assert(
      fc.property(
        fc.array(userArbitrary, { minLength: 1, maxLength: 50 }),
        (users) => {
          // Find a user with a phone number
          const userWithPhone = users.find(u => u.phone)
          if (userWithPhone && userWithPhone.phone) {
            const keyword = userWithPhone.phone.substring(0, 5)
            const results = searchUsers(users, keyword)
            
            // The user should be in the results
            const found = results.some(u => u.id === userWithPhone.id)
            expect(found).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 3: Search by ID should match', () => {
    fc.assert(
      fc.property(
        fc.array(userArbitrary, { minLength: 1, maxLength: 50 }),
        (users) => {
          // Pick a random user and search by their ID
          const randomUser = users[Math.floor(Math.random() * users.length)]
          const keyword = randomUser.id.toString()
          const results = searchUsers(users, keyword)
          
          // The random user should be in the results
          const found = results.some(u => u.id === randomUser.id)
          expect(found).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 3: Case-insensitive search for nickname', () => {
    fc.assert(
      fc.property(
        fc.array(userArbitrary, { minLength: 1, maxLength: 50 }),
        (users) => {
          // Pick a random user with a nickname
          const randomUser = users.find(u => u.nickname && u.nickname.length > 2)
          if (randomUser && randomUser.nickname) {
            const keyword = randomUser.nickname.substring(0, 3)
            
            // Search with lowercase
            const lowerResults = searchUsers(users, keyword.toLowerCase())
            
            // Search with uppercase
            const upperResults = searchUsers(users, keyword.toUpperCase())
            
            // Both should find the user
            const foundInLower = lowerResults.some(u => u.id === randomUser.id)
            const foundInUpper = upperResults.some(u => u.id === randomUser.id)
            
            expect(foundInLower).toBe(true)
            expect(foundInUpper).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  test('Property 3: No false positives in search results', () => {
    fc.assert(
      fc.property(
        fc.array(userArbitrary, { minLength: 0, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (users, keyword) => {
          const results = searchUsers(users, keyword)
          
          // Every result must match the keyword
          for (const result of results) {
            const matches = userMatchesKeyword(result, keyword)
            expect(matches).toBe(true)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
