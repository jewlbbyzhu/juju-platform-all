<template>
  <div class="data-table-enhanced">
    <!-- Toolbar -->
    <div v-if="showToolbar" class="table-toolbar-enhanced">
      <div class="toolbar-left">
        <slot name="toolbar-left">
          <el-button
            v-if="showRefresh"
            :icon="Refresh"
            @click="handleRefresh"
            :loading="loading"
          >
            刷新
          </el-button>
          <el-button
            v-if="showExport"
            :icon="Download"
            @click="handleExport"
            type="success"
            plain
          >
            导出
          </el-button>
        </slot>
      </div>
      <div class="toolbar-right">
        <slot name="toolbar-right">
          <!-- Column visibility toggle -->
          <el-dropdown v-if="showColumnToggle" trigger="click">
            <el-button :icon="View" plain>
              列显示
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="col in toggleableColumns"
                  :key="col.prop"
                  @click="toggleColumn(col.prop)"
                >
                  <el-icon v-if="visibleColumns.includes(col.prop)" class="check-icon">
                    <Check />
                  </el-icon>
                  <span class="column-toggle-label">{{ col.label }}</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-tooltip content="密度" placement="top">
            <el-dropdown trigger="click">
              <el-button :icon="Grid" plain circle />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="tableSize = 'default'">默认</el-dropdown-item>
                  <el-dropdown-item @click="tableSize = 'small'">紧凑</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-tooltip>
        </slot>
      </div>
    </div>

    <!-- Selection info -->
    <transition name="fade">
      <div v-if="selection && selectedRows.length > 0" class="selection-info-enhanced">
        <div class="selection-content">
          <el-icon class="selection-icon"><InfoFilled /></el-icon>
          <span>已选择 <strong>{{ selectedRows.length }}</strong> 项</span>
          <el-button text type="primary" size="small" @click="handleClearSelection">
            清空选择
          </el-button>
        </div>
        <div class="selection-actions">
          <slot name="batch-actions" :selected-rows="selectedRows" />
        </div>
      </div>
    </transition>

    <!-- Table -->
    <div class="table-wrapper" :class="{ 'has-border': border }">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="data"
        :border="border"
        :stripe="stripe"
        :height="height"
        :max-height="maxHeight"
        :row-key="rowKey"
        :size="tableSize"
        :highlight-current-row="highlightCurrentRow"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
        v-bind="$attrs"
      >
        <!-- Selection column -->
        <el-table-column
          v-if="selection"
          type="selection"
          width="50"
          :reserve-selection="reserveSelection"
          align="center"
          fixed="left"
        />

        <!-- Index column -->
        <el-table-column
          v-if="showIndex"
          type="index"
          label="#"
          width="50"
          :index="indexMethod"
          align="center"
          fixed="left"
        />

        <!-- Data columns -->
        <template v-for="column in visibleColumnsList" :key="column.prop">
          <el-table-column
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            :min-width="column.minWidth || getDefaultMinWidth(column)"
            :fixed="column.fixed"
            :sortable="column.sortable"
            :align="column.align || 'left'"
            :header-align="column.headerAlign || column.align || 'left'"
            :show-overflow-tooltip="column.showOverflowTooltip !== false"
            :class-name="column.className"
          >
            <template #header>
              <div class="column-header">
                <span>{{ column.label }}</span>
                <el-tooltip v-if="column.tooltip" :content="column.tooltip" placement="top">
                  <el-icon class="header-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
            </template>

            <template #default="scope">
              <!-- Custom slot -->
              <slot
                v-if="column.slot"
                :name="column.slot"
                :row="scope.row"
                :column="column"
                :$index="scope.$index"
              />
              <!-- Status tag -->
              <el-tag
                v-else-if="column.type === 'status'"
                :type="getStatusType(scope.row[column.prop], column.statusMap)"
                :size="tableSize === 'small' ? 'small' : 'default'"
                effect="light"
              >
                {{ getStatusText(scope.row[column.prop], column.statusMap) }}
              </el-tag>
              <!-- Date/time -->
              <span v-else-if="column.type === 'datetime'" class="datetime-cell">
                {{ formatDateTime(scope.row[column.prop], column.format) }}
              </span>
              <!-- Currency -->
              <span v-else-if="column.type === 'currency'" class="currency-cell">
                {{ formatCurrency(scope.row[column.prop]) }}
              </span>
              <!-- Number -->
              <span v-else-if="column.type === 'number'" class="number-cell">
                {{ formatNumber(scope.row[column.prop], column.decimals) }}
              </span>
              <!-- Image -->
              <el-avatar
                v-else-if="column.type === 'avatar'"
                :size="32"
                :src="scope.row[column.prop]"
                :icon="User"
              />
              <!-- Boolean -->
              <el-tag
                v-else-if="column.type === 'boolean'"
                :type="scope.row[column.prop] ? 'success' : 'info'"
                :size="tableSize === 'small' ? 'small' : 'default'"
                effect="light"
              >
                {{ scope.row[column.prop] ? (column.trueText || '是') : (column.falseText || '否') }}
              </el-tag>
              <!-- Formatter function -->
              <span v-else-if="column.formatter">
                {{ column.formatter(scope.row[column.prop], scope.row, column) }}
              </span>
              <!-- Default -->
              <span v-else class="cell-content" :title="scope.row[column.prop]">
                {{ scope.row[column.prop] || '-' }}
              </span>
            </template>
          </el-table-column>
        </template>

        <!-- Actions column -->
        <el-table-column
          v-if="visibleActions.length > 0"
          :label="actionsLabel"
          :width="actionsWidth"
          :min-width="getActionsMinWidth()"
          :fixed="actionsFixed"
          align="center"
          class-name="actions-column"
        >
          <template #default="scope">
            <slot name="actions" :row="scope.row" :$index="scope.$index">
              <div class="actions-wrapper">
                <template v-for="(action, index) in getVisibleActions(scope.row)" :key="action.key || action.label">
                  <!-- Main actions (first 2) -->
                  <el-button
                    v-if="index < 2"
                    :type="action.type || 'primary'"
                    :size="tableSize === 'small' ? 'small' : 'small'"
                    :icon="action.icon"
                    :disabled="action.disabled && action.disabled(scope.row)"
                    :link="action.link !== false"
                    @click.stop="handleAction(action, scope.row, scope.$index)"
                  >
                    {{ action.label }}
                  </el-button>
                  <!-- More actions dropdown -->
                  <el-dropdown v-else-if="index === 2" trigger="click" @command="(cmd) => handleMoreAction(cmd, scope.row, scope.$index)">
                    <el-button type="info" :size="tableSize === 'small' ? 'small' : 'small'" link>
                      更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item
                          v-for="moreAction in getVisibleActions(scope.row).slice(2)"
                          :key="moreAction.key || moreAction.label"
                          :command="moreAction"
                          :disabled="moreAction.disabled && moreAction.disabled(scope.row)"
                          :icon="moreAction.icon"
                        >
                          {{ moreAction.label }}
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
              </div>
            </slot>
          </template>
        </el-table-column>

        <!-- Empty state -->
        <template #empty>
          <slot name="empty">
            <div class="empty-state-enhanced">
              <el-icon class="empty-icon"><DocumentRemove /></el-icon>
              <p class="empty-title">暂无数据</p>
              <p class="empty-desc">当前列表为空，请尝试调整搜索条件或刷新数据</p>
              <el-button v-if="showRefresh" type="primary" plain @click="handleRefresh">
                刷新数据
              </el-button>
            </div>
          </slot>
        </template>
      </el-table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination" class="table-pagination-enhanced">
      <div class="pagination-info">
        <span class="info-text">
          显示第 {{ startIndex }} 到 {{ endIndex }} 条，共 {{ total }} 条
        </span>
      </div>
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="currentPageSize"
        :page-sizes="pageSizes"
        :total="total"
        :layout="paginationLayout"
        :background="paginationBackground"
        :pager-count="pagerCount"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Component } from 'vue'
import { Refresh, Download, View, Grid, Check, QuestionFilled, InfoFilled, ArrowDown, DocumentRemove, User } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'

// Enhanced column type
export interface TableColumnEnhanced {
  prop: string
  label: string
  width?: number | string
  minWidth?: number | string
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean | 'custom'
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
  showOverflowTooltip?: boolean
  slot?: string
  formatter?: (value: any, row: any, column: TableColumnEnhanced) => string
  // Enhanced features
  type?: 'status' | 'datetime' | 'currency' | 'number' | 'avatar' | 'boolean' | 'text'
  tooltip?: string
  statusMap?: Record<string, { type?: string; text: string; color?: string }>
  format?: string
  decimals?: number
  trueText?: string
  falseText?: string
  className?: string
  toggleable?: boolean
}

// Enhanced action type
export interface TableActionEnhanced {
  key?: string
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'large' | 'default' | 'small'
  icon?: Component
  handler: (row: any, index: number) => void | Promise<void>
  disabled?: (row: any) => boolean
  hidden?: (row: any) => boolean
  link?: boolean
  confirm?: boolean
  confirmTitle?: string
  confirmMessage?: string
  confirmType?: 'warning' | 'error' | 'info'
}

interface Props {
  data: any[]
  columns: TableColumnEnhanced[]
  loading?: boolean
  border?: boolean
  stripe?: boolean
  height?: number | string
  maxHeight?: number | string
  rowKey?: string
  selection?: boolean
  reserveSelection?: boolean
  showIndex?: boolean
  indexMethod?: (index: number) => number
  actions?: TableActionEnhanced[]
  actionsLabel?: string
  actionsWidth?: number | string
  actionsFixed?: boolean | 'left' | 'right'
  pagination?: boolean
  total?: number
  page?: number
  pageSize?: number
  pageSizes?: number[]
  paginationLayout?: string
  paginationBackground?: boolean
  pagerCount?: number
  showToolbar?: boolean
  showRefresh?: boolean
  showExport?: boolean
  showColumnToggle?: boolean
  highlightCurrentRow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  columns: () => [],
  loading: false,
  border: true,
  stripe: true,
  rowKey: 'id',
  selection: false,
  reserveSelection: false,
  showIndex: false,
  actions: () => [],
  actionsLabel: '操作',
  actionsWidth: 'auto',
  actionsFixed: 'right',
  pagination: true,
  total: 0,
  page: 1,
  pageSize: 20,
  pageSizes: () => [10, 20, 50, 100],
  paginationLayout: 'total, sizes, prev, pager, next, jumper',
  paginationBackground: true,
  pagerCount: 7,
  showToolbar: true,
  showRefresh: true,
  showExport: false,
  showColumnToggle: true,
  highlightCurrentRow: false,
})

// Emits
const emit = defineEmits<{
  refresh: []
  export: []
  selectionChange: [rows: any[]]
  sortChange: [{ prop: string; order: string | null }]
  pageChange: [page: number]
  pageSizeChange: [pageSize: number]
  rowClick: [row: any, column: any, event: Event]
}>()

// Refs
const tableRef = ref()
const selectedRows = ref<any[]>([])
const currentPage = ref(props.page)
const currentPageSize = ref(props.pageSize)
const tableSize = ref<'default' | 'small'>('default')
const visibleColumns = ref<string[]>([])

// Initialize visible columns
onMounted(() => {
  visibleColumns.value = props.columns
    .filter(col => col.toggleable !== false)
    .map(col => col.prop)
})

// Watch props changes
watch(() => props.page, (val) => {
  currentPage.value = val
})

watch(() => props.pageSize, (val) => {
  currentPageSize.value = val
})

// Computed
const toggleableColumns = computed(() => {
  return props.columns.filter(col => col.toggleable !== false)
})

const visibleColumnsList = computed(() => {
  return props.columns.filter(col => visibleColumns.value.includes(col.prop))
})

const visibleActions = computed(() => {
  return props.actions.filter(action => !action.hidden || !action.hidden({}))
})

const startIndex = computed(() => {
  if (props.pagination) {
    return (currentPage.value - 1) * currentPageSize.value + 1
  }
  return 1
})

const endIndex = computed(() => {
  if (props.pagination) {
    return Math.min(currentPage.value * currentPageSize.value, props.total)
  }
  return props.data.length
})

const indexMethod = computed(() => {
  if (props.indexMethod) {
    return props.indexMethod
  }
  return (index: number) => {
    return (currentPage.value - 1) * currentPageSize.value + index + 1
  }
})

// Methods
const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows
  emit('selectionChange', rows)
}

const handleClearSelection = () => {
  tableRef.value?.clearSelection()
}

const handleSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  emit('sortChange', { prop, order })
}

const handleRowClick = (row: any, column: any, event: Event) => {
  emit('rowClick', row, column, event)
}

const handleRefresh = () => {
  emit('refresh')
}

const handleExport = () => {
  emit('export')
}

const handleSizeChange = (pageSize: number) => {
  currentPageSize.value = pageSize
  emit('pageSizeChange', pageSize)
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  emit('pageChange', page)
}

const toggleColumn = (prop: string) => {
  const index = visibleColumns.value.indexOf(prop)
  if (index > -1) {
    if (visibleColumns.value.length > 1) {
      visibleColumns.value.splice(index, 1)
    } else {
      ElMessage.warning('至少需要保留一列')
    }
  } else {
    visibleColumns.value.push(prop)
    // Re-sort to match original order
    const orderMap = new Map(props.columns.map((col, idx) => [col.prop, idx]))
    visibleColumns.value.sort((a, b) => (orderMap.get(a) || 0) - (orderMap.get(b) || 0))
  }
}

const getStatusType = (value: string, statusMap?: Record<string, { type?: string; text: string }>) => {
  if (statusMap && statusMap[value]) {
    return statusMap[value].type || 'info'
  }
  return 'info'
}

const getStatusText = (value: string, statusMap?: Record<string, { type?: string; text: string }>) => {
  if (statusMap && statusMap[value]) {
    return statusMap[value].text
  }
  return value
}

const formatDateTime = (value: string | number | Date, format?: string) => {
  if (!value) return '-'
  return dayjs(value).format(format || 'YYYY-MM-DD HH:mm')
}

const formatCurrency = (value: number) => {
  if (value === undefined || value === null) return '-'
  return `¥${Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const formatNumber = (value: number, decimals = 0) => {
  if (value === undefined || value === null) return '-'
  return Number(value).toLocaleString('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

const getDefaultMinWidth = (column: TableColumnEnhanced) => {
  if (column.type === 'datetime') return 140
  if (column.type === 'currency') return 120
  if (column.type === 'status') return 100
  if (column.type === 'number') return 100
  return 80
}

const getActionsMinWidth = () => {
  const actionCount = visibleActions.value.length
  if (actionCount <= 1) return 80
  if (actionCount <= 2) return 140
  return 180
}

const getVisibleActions = (row: any) => {
  return props.actions.filter(action => {
    if (action.hidden) {
      return !action.hidden(row)
    }
    return true
  })
}

const handleAction = async (action: TableActionEnhanced, row: any, index: number) => {
  if (action.confirm) {
    try {
      await ElMessageBox.confirm(
        action.confirmMessage || `确定要${action.label}吗？`,
        action.confirmTitle || '确认操作',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: action.confirmType || 'warning',
          confirmButtonClass: 'el-button--danger'
        }
      )
      await action.handler(row, index)
    } catch (error) {
      // User cancelled
    }
  } else {
    await action.handler(row, index)
  }
}

const handleMoreAction = (action: TableActionEnhanced, row: any, index: number) => {
  handleAction(action, row, index)
}

// Expose methods
defineExpose({
  clearSelection: handleClearSelection,
  toggleRowSelection: (row: any, selected?: boolean) => {
    tableRef.value?.toggleRowSelection(row, selected)
  },
  toggleAllSelection: () => {
    tableRef.value?.toggleAllSelection()
  },
  setCurrentRow: (row: any) => {
    tableRef.value?.setCurrentRow(row)
  },
  getSelectionRows: () => {
    return selectedRows.value
  },
})
</script>

<style scoped lang="scss">
.data-table-enhanced {
  .table-toolbar-enhanced {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px 16px;
    background-color: var(--color-bg-surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-light);
    box-shadow: var(--shadow-sm);

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .selection-info-enhanced {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: linear-gradient(135deg, var(--color-primary-50) 0%, rgba(240, 78, 12, 0.05) 100%);
    border: 1px solid var(--color-primary-200);
    border-radius: var(--radius-lg);
    border-left: 4px solid var(--color-brand);

    .selection-content {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--color-brand);
      font-size: var(--font-size-sm);

      .selection-icon {
        font-size: 16px;
      }

      strong {
        font-weight: var(--font-weight-bold);
      }
    }

    .selection-actions {
      display: flex;
      gap: 8px;
    }
  }

  .table-wrapper {
    border-radius: var(--radius-lg);
    overflow: hidden;
    background-color: var(--color-bg-surface);
    box-shadow: var(--shadow-card);

    &.has-border {
      border: 1px solid var(--color-border-light);
    }
  }

  .column-header {
    display: flex;
    align-items: center;
    gap: 4px;

    .header-icon {
      color: var(--color-text-tertiary);
      font-size: 14px;
      cursor: help;
    }
  }

  .cell-content {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .datetime-cell {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
  }

  .currency-cell {
    font-family: var(--font-family-mono);
    font-weight: var(--font-weight-medium);
    color: var(--color-error-500);
  }

  .number-cell {
    font-family: var(--font-family-mono);
    text-align: right;
  }

  .actions-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .actions-column {
    :deep(.cell) {
      padding: 4px 0;
    }
  }

  .empty-state-enhanced {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;

    .empty-icon {
      font-size: 64px;
      color: var(--color-text-tertiary);
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0 0 8px;
    }

    .empty-desc {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin: 0 0 16px;
      max-width: 300px;
    }
  }

  .table-pagination-enhanced {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding: 12px 16px;
    background-color: var(--color-bg-surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-light);

    .pagination-info {
      .info-text {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
      }
    }
  }

  .check-icon {
    margin-right: 8px;
    color: var(--color-brand);
  }

  .column-toggle-label {
    font-size: var(--font-size-sm);
  }

  // Transitions
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

// Dark mode adjustments
.dark .data-table-enhanced {
  .selection-info-enhanced {
    background: linear-gradient(135deg, rgba(240, 78, 12, 0.15) 0%, rgba(240, 78, 12, 0.05) 100%);
  }
}
</style>