import { ref, reactive, computed } from 'vue'
import type { Ref } from 'vue'

export interface TableParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: any
}

export interface UseTableOptions<T = any> {
  fetchData: (params: TableParams) => Promise<{
    list: T[]
    total: number
  }>
  immediate?: boolean
  defaultParams?: Partial<TableParams>
}

export function useTable<T = any>(options: UseTableOptions<T>) {
  const { fetchData, immediate = true, defaultParams = {} } = options

  // State
  const loading = ref(false)
  const data = ref<T[]>([]) as Ref<T[]>
  const total = ref(0)
  const params = reactive<TableParams>({
    page: 1,
    pageSize: 20,
    ...defaultParams,
  })

  // Computed
  const isEmpty = computed(() => data.value.length === 0)
  const hasData = computed(() => data.value.length > 0)

  // Methods
  const loadData = async () => {
    loading.value = true
    try {
      // 清理参数，移除undefined和空字符串值
      const cleanParams: TableParams = {
        page: params.page,
        pageSize: params.pageSize,
      }

      // 只添加有值的参数
      Object.keys(params).forEach((key) => {
        const value = params[key]
        if (key !== 'page' && key !== 'pageSize' && value !== undefined && value !== '' && value !== null) {
          cleanParams[key] = value
        }
      })

      const result = await fetchData(cleanParams)
      console.log('useTable fetchData result:', result)
      data.value = result.list || []
      total.value = result.total || 0
    } catch (error) {
      console.error('Failed to load table data:', error)
      data.value = []
      total.value = 0
      throw error
    } finally {
      loading.value = false
    }
  }

  const refresh = async () => {
    await loadData()
  }

  const reset = async () => {
    params.page = 1
    params.pageSize = 20
    Object.keys(defaultParams).forEach(key => {
      params[key] = defaultParams[key]
    })
    await loadData()
  }

  const handlePageChange = async (page: number) => {
    params.page = page
    await loadData()
  }

  const handlePageSizeChange = async (pageSize: number) => {
    params.page = 1
    params.pageSize = pageSize
    await loadData()
  }

  const handleSortChange = async ({ prop, order }: { prop: string; order: string | null }) => {
    if (order) {
      params.sortBy = prop
      params.sortOrder = order === 'ascending' ? 'asc' : 'desc'
    } else {
      delete params.sortBy
      delete params.sortOrder
    }
    params.page = 1
    await loadData()
  }

  const handleSearch = async (searchParams: Record<string, any>) => {
    Object.assign(params, searchParams)
    params.page = 1
    await loadData()
  }

  const handleFilter = async (filterParams: Record<string, any>) => {
    Object.assign(params, filterParams)
    params.page = 1
    await loadData()
  }

  // Initialize
  if (immediate) {
    loadData()
  }

  return {
    // State
    loading,
    data,
    total,
    params,
    
    // Computed
    isEmpty,
    hasData,
    
    // Methods
    loadData,
    refresh,
    reset,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleSearch,
    handleFilter,
  }
}

// Export types
export type UseTableReturn<T = any> = ReturnType<typeof useTable<T>>
