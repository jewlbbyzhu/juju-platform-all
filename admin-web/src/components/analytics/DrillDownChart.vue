<template>
  <div class="drill-down-chart">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item
          v-for="(level, index) in breadcrumbLevels"
          :key="index"
          @click="handleBreadcrumbClick(index)"
        >
          {{ level.label }}
        </el-breadcrumb-item>
      </el-breadcrumb>
      
      <el-button
        v-if="canDrillUp"
        :icon="ArrowUp"
        size="small"
        @click="handleDrillUp"
      >
        返回上一级
      </el-button>
    </div>
    
    <AnalyticsChart
      ref="chartRef"
      :title="currentTitle"
      :data="currentData"
      :chart-type="chartType"
      :loading="loading"
      :drill-down-enabled="canDrillDown"
      :export-enabled="true"
      :x-axis-key="xAxisKey"
      :y-axis-key="yAxisKey"
      :series-name="seriesName"
      @drill-down="handleDrillDown"
      @chart-click="handleChartClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElBreadcrumb, ElBreadcrumbItem, ElButton } from 'element-plus'
import { ArrowUp } from '@element-plus/icons-vue'
import AnalyticsChart from './AnalyticsChart.vue'
import type { ChartType } from '@/types/analytics'

interface DrillLevel {
  label: string
  data: any[]
  filters: Record<string, any>
}

interface Props {
  title: string
  data: any[]
  chartType?: ChartType
  loading?: boolean
  xAxisKey?: string
  yAxisKey?: string
  seriesName?: string
  maxDepth?: number
}

const props = withDefaults(defineProps<Props>(), {
  chartType: 'bar',
  loading: false,
  xAxisKey: 'label',
  yAxisKey: 'value',
  seriesName: '数据',
  maxDepth: 3
})

const emit = defineEmits<{
  drillDown: [data: { level: number; filters: Record<string, any>; clickedData: any }]
  drillUp: [level: number]
  levelChange: [level: number]
}>()

const chartRef = ref<InstanceType<typeof AnalyticsChart>>()
const drillLevels = ref<DrillLevel[]>([
  {
    label: props.title,
    data: props.data,
    filters: {}
  }
])
const currentLevel = ref(0)

// Computed properties
const breadcrumbLevels = computed(() => {
  return drillLevels.value.slice(0, currentLevel.value + 1)
})

const currentTitle = computed(() => {
  return drillLevels.value[currentLevel.value]?.label || props.title
})

const currentData = computed(() => {
  return drillLevels.value[currentLevel.value]?.data || []
})

const canDrillDown = computed(() => {
  return currentLevel.value < props.maxDepth - 1
})

const canDrillUp = computed(() => {
  return currentLevel.value > 0
})

// Handle drill down
const handleDrillDown = (data: any) => {
  if (!canDrillDown.value) {
    return
  }
  
  // This would typically fetch data from API based on the clicked item
  // For now, we'll emit an event for the parent to handle
  emit('drillDown', {
    level: currentLevel.value + 1,
    filters: drillLevels.value[currentLevel.value].filters,
    clickedData: data
  })
}

// Handle drill up
const handleDrillUp = () => {
  if (!canDrillUp.value) {
    return
  }
  
  currentLevel.value--
  emit('drillUp', currentLevel.value)
  emit('levelChange', currentLevel.value)
}

// Handle breadcrumb click
const handleBreadcrumbClick = (index: number) => {
  if (index < currentLevel.value) {
    currentLevel.value = index
    emit('levelChange', currentLevel.value)
  }
}

// Handle chart click
const handleChartClick = (params: any) => {
  if (canDrillDown.value) {
    handleDrillDown(params.data)
  }
}

// Add drill level (called by parent after fetching drill-down data)
const addDrillLevel = (label: string, data: any[], filters: Record<string, any>) => {
  // Remove any levels after current level
  drillLevels.value = drillLevels.value.slice(0, currentLevel.value + 1)
  
  // Add new level
  drillLevels.value.push({
    label,
    data,
    filters
  })
  
  // Move to new level
  currentLevel.value++
  emit('levelChange', currentLevel.value)
}

// Reset to root level
const resetToRoot = () => {
  currentLevel.value = 0
  drillLevels.value = drillLevels.value.slice(0, 1)
  emit('levelChange', currentLevel.value)
}

// Update current level data
const updateCurrentData = (data: any[]) => {
  if (drillLevels.value[currentLevel.value]) {
    drillLevels.value[currentLevel.value].data = data
  }
}

// Expose methods
defineExpose({
  addDrillLevel,
  resetToRoot,
  updateCurrentData,
  getCurrentLevel: () => currentLevel.value,
  resize: () => chartRef.value?.resize()
})
</script>

<style scoped lang="scss">
.drill-down-chart {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .breadcrumb {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f5f5f5;
    border-radius: 4px;
    margin-bottom: 16px;
    
    .el-breadcrumb {
      flex: 1;
      
      :deep(.el-breadcrumb__item) {
        cursor: pointer;
        
        &:hover {
          color: #409eff;
        }
      }
    }
  }
}
</style>
