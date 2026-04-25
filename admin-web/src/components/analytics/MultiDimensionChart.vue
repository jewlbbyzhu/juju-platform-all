<template>
  <div class="multi-dimension-chart">
    <div class="chart-controls">
      <el-select
        v-model="selectedDimension"
        placeholder="选择维度"
        @change="handleDimensionChange"
      >
        <el-option
          v-for="dim in dimensions"
          :key="dim.value"
          :label="dim.label"
          :value="dim.value"
        />
      </el-select>
      
      <el-select
        v-model="selectedMetric"
        placeholder="选择指标"
        @change="handleMetricChange"
      >
        <el-option
          v-for="metric in metrics"
          :key="metric.value"
          :label="metric.label"
          :value="metric.value"
        />
      </el-select>
      
      <el-select
        v-model="selectedChartType"
        placeholder="图表类型"
        @change="handleChartTypeChange"
      >
        <el-option label="折线图" value="line" />
        <el-option label="柱状图" value="bar" />
        <el-option label="饼图" value="pie" />
        <el-option label="面积图" value="area" />
      </el-select>
    </div>
    
    <AnalyticsChart
      ref="chartRef"
      :title="chartTitle"
      :data="chartData"
      :chart-type="selectedChartType"
      :loading="loading"
      :drill-down-enabled="drillDownEnabled"
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
import { ref, computed, watch } from 'vue'
import { ElSelect, ElOption } from 'element-plus'
import AnalyticsChart from './AnalyticsChart.vue'
import type { ChartType, AnalyticsDimension } from '@/types/analytics'

interface Dimension {
  label: string
  value: AnalyticsDimension
}

interface Metric {
  label: string
  value: string
}

interface Props {
  dimensions: Dimension[]
  metrics: Metric[]
  data: Record<string, any[]>
  loading?: boolean
  drillDownEnabled?: boolean
  defaultDimension?: AnalyticsDimension
  defaultMetric?: string
  defaultChartType?: ChartType
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  drillDownEnabled: true,
  defaultChartType: 'line'
})

const emit = defineEmits<{
  dimensionChange: [dimension: AnalyticsDimension]
  metricChange: [metric: string]
  chartTypeChange: [chartType: ChartType]
  drillDown: [data: { dimension: AnalyticsDimension; metric: string; data: any }]
  chartClick: [params: any]
}>()

const chartRef = ref<InstanceType<typeof AnalyticsChart>>()
const selectedDimension = ref<AnalyticsDimension>(
  props.defaultDimension || props.dimensions[0]?.value || 'user'
)
const selectedMetric = ref<string>(
  props.defaultMetric || props.metrics[0]?.value || 'count'
)
const selectedChartType = ref<ChartType>(props.defaultChartType)

// Computed chart title
const chartTitle = computed(() => {
  const dimension = props.dimensions.find(d => d.value === selectedDimension.value)
  const metric = props.metrics.find(m => m.value === selectedMetric.value)
  return `${dimension?.label || ''} - ${metric?.label || ''}`
})

// Computed chart data
const chartData = computed(() => {
  const key = `${selectedDimension.value}_${selectedMetric.value}`
  return props.data[key] || props.data[selectedDimension.value] || []
})

// Computed axis keys
const xAxisKey = computed(() => {
  // Determine x-axis key based on dimension
  switch (selectedDimension.value) {
    case 'user':
    case 'party':
    case 'order':
    case 'revenue':
      return 'date'
    case 'region':
      return 'region'
    case 'category':
      return 'category'
    default:
      return 'label'
  }
})

const yAxisKey = computed(() => {
  return selectedMetric.value
})

const seriesName = computed(() => {
  const metric = props.metrics.find(m => m.value === selectedMetric.value)
  return metric?.label || '数据'
})

// Handle dimension change
const handleDimensionChange = (dimension: AnalyticsDimension) => {
  emit('dimensionChange', dimension)
}

// Handle metric change
const handleMetricChange = (metric: string) => {
  emit('metricChange', metric)
}

// Handle chart type change
const handleChartTypeChange = (chartType: ChartType) => {
  emit('chartTypeChange', chartType)
}

// Handle drill down
const handleDrillDown = (data: any) => {
  emit('drillDown', {
    dimension: selectedDimension.value,
    metric: selectedMetric.value,
    data
  })
}

// Handle chart click
const handleChartClick = (params: any) => {
  emit('chartClick', params)
}

// Watch for default changes
watch(
  () => props.defaultDimension,
  (newDimension) => {
    if (newDimension) {
      selectedDimension.value = newDimension
    }
  }
)

watch(
  () => props.defaultMetric,
  (newMetric) => {
    if (newMetric) {
      selectedMetric.value = newMetric
    }
  }
)

// Expose methods
defineExpose({
  resize: () => chartRef.value?.resize(),
  getDimension: () => selectedDimension.value,
  getMetric: () => selectedMetric.value,
  getChartType: () => selectedChartType.value
})
</script>

<style scoped lang="scss">
.multi-dimension-chart {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .chart-controls {
    display: flex;
    gap: 12px;
    padding: 16px;
    background: #f5f5f5;
    border-radius: 4px;
    margin-bottom: 16px;
    
    .el-select {
      flex: 1;
      max-width: 200px;
    }
  }
}
</style>
