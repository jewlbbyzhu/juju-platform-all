<template>
  <div class="data-table">
    <!-- Table toolbar -->
    <div v-if="showToolbar" class="table-toolbar">
      <div class="toolbar-left">
        <slot name="toolbar-left">
          <el-button
            v-if="showRefresh"
            :icon="Refresh"
            @click="handleRefresh"
          >
            刷新
          </el-button>
        </slot>
      </div>
      <div class="toolbar-right">
        <slot name="toolbar-right">
          <el-button
            v-if="showExport"
            :icon="Download"
            @click="handleExport"
          >
            导出
          </el-button>
        </slot>
      </div>
    </div>

    <!-- Selection info -->
    <div v-if="selection && selectedRows.length > 0" class="selection-info">
      <span>已选择 {{ selectedRows.length }} 项</span>
      <el-button text type="primary" @click="handleClearSelection">
        清空选择
      </el-button>
      <slot name="batch-actions" :selected-rows="selectedRows" />
    </div>

    <!-- Table -->
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="data"
      :border="border"
      :stripe="stripe"
      :height="height"
      :max-height="maxHeight"
      :row-key="rowKey"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <!-- Selection column -->
      <el-table-column
        v-if="selection"
        type="selection"
        width="55"
        :reserve-selection="reserveSelection"
      />

      <!-- Index column -->
      <el-table-column
        v-if="showIndex"
        type="index"
        label="序号"
        width="60"
        :index="indexMethod"
      />

      <!-- Data columns -->
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :min-width="column.minWidth"
        :fixed="column.fixed"
        :sortable="column.sortable"
        :align="column.align || 'left'"
        :show-overflow-tooltip="column.showOverflowTooltip !== false"
      >
        <template #default="scope">
          <slot
            v-if="column.slot"
            :name="column.slot"
            :row="scope.row"
            :column="column"
            :$index="scope.$index"
          />
          <span v-else-if="column.formatter">
            {{ column.formatter(scope.row[column.prop], scope.row, column) }}
          </span>
          <span v-else>
            {{ scope.row[column.prop] }}
          </span>
        </template>
      </el-table-column>

      <!-- Actions column -->
      <el-table-column
        v-if="actions && actions.length > 0"
        label="操作"
        :width="actionsWidth"
        :fixed="actionsFixed"
        align="center"
      >
        <template #default="scope">
          <slot name="actions" :row="scope.row" :$index="scope.$index">
            <template v-for="action in getVisibleActions(scope.row)" :key="action.label">
              <el-button
                v-if="!action.hidden || !action.hidden(scope.row)"
                :type="action.type || 'primary'"
                :size="action.size || 'small'"
                :icon="action.icon"
                :disabled="action.disabled && action.disabled(scope.row)"
                :link="action.link !== false"
                @click="action.handler(scope.row, scope.$index)"
              >
                {{ action.label }}
              </el-button>
            </template>
          </slot>
        </template>
      </el-table-column>

      <!-- Empty state -->
      <template #empty>
        <slot name="empty">
          <el-empty description="暂无数据" />
        </slot>
      </template>
    </el-table>

    <!-- Pagination -->
    <div v-if="pagination" class="table-pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="currentPageSize"
        :page-sizes="pageSizes"
        :total="total"
        :layout="paginationLayout"
        :background="paginationBackground"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Component } from 'vue'
import { Refresh, Download } from '@element-plus/icons-vue'

// Props
interface TableColumn {
  prop: string
  label: string
  width?: number | string
  minWidth?: number | string
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean | 'custom'
  align?: 'left' | 'center' | 'right'
  showOverflowTooltip?: boolean
  formatter?: (value: any, row: any, column: TableColumn) => string
  slot?: string
}

interface TableAction {
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'large' | 'default' | 'small'
  icon?: Component
  handler: (row: any, index: number) => void
  disabled?: (row: any) => boolean
  hidden?: (row: any) => boolean
  link?: boolean
}

interface Props {
  data: any[]
  columns: TableColumn[]
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
  actions?: TableAction[]
  actionsWidth?: number | string
  actionsFixed?: boolean | 'left' | 'right'
  pagination?: boolean
  total?: number
  page?: number
  pageSize?: number
  pageSizes?: number[]
  paginationLayout?: string
  paginationBackground?: boolean
  showToolbar?: boolean
  showRefresh?: boolean
  showExport?: boolean
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
  actionsWidth: 180,
  actionsFixed: 'right',
  pagination: true,
  total: 0,
  page: 1,
  pageSize: 20,
  pageSizes: () => [10, 20, 50, 100],
  paginationLayout: 'total, sizes, prev, pager, next, jumper',
  paginationBackground: true,
  showToolbar: true,
  showRefresh: true,
  showExport: false,
})

// Emits
const emit = defineEmits<{
  refresh: []
  export: []
  selectionChange: [rows: any[]]
  sortChange: [{ prop: string; order: string | null }]
  pageChange: [page: number]
  pageSizeChange: [pageSize: number]
}>()

// Refs
const tableRef = ref()
const selectedRows = ref<any[]>([])
const currentPage = ref(props.page)
const currentPageSize = ref(props.pageSize)

// Watch props changes
watch(() => props.page, (val) => {
  currentPage.value = val
})

watch(() => props.pageSize, (val) => {
  currentPageSize.value = val
})

// Computed
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

const getVisibleActions = (row: any) => {
  return props.actions.filter(action => {
    if (action.hidden) {
      return !action.hidden(row)
    }
    return true
  })
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
})
</script>

<style scoped lang="scss">
.data-table {
  .table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px 16px;
    background-color: var(--el-bg-color);
    border-radius: 4px;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .selection-info {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
    padding: 12px 16px;
    background-color: var(--el-color-primary-light-9);
    border-radius: 4px;
    color: var(--el-color-primary);
  }

  .table-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>
