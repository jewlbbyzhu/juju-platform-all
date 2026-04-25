import type { Component } from 'vue'

/**
 * Menu item configuration
 */
export interface MenuItem {
  id: string
  title: string
  path: string
  icon?: Component
  permission?: string
  children?: MenuItem[]
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/**
 * Pagination response
 */
export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  code?: number
}

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc'

/**
 * Filter operator
 */
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in'

/**
 * Filter condition
 */
export interface FilterCondition {
  field: string
  operator: FilterOperator
  value: any
}

/**
 * Table column configuration
 */
export interface TableColumn {
  prop: string
  label: string
  width?: string | number
  minWidth?: string | number
  sortable?: boolean
  filterable?: boolean
  formatter?: (row: any, column: any, cellValue: any) => string
}
