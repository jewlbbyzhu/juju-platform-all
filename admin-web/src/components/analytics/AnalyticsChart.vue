<template>
  <div class="analytics-chart">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="chart-actions">
        <el-button
          v-if="drillDownEnabled"
          :icon="ZoomIn"
          size="small"
          @click="handleDrillDown"
        >
          钻取
        </el-button>
        <el-button
          v-if="exportEnabled"
          :icon="Download"
          size="small"
          @click="handleExport"
        >
          导出
        </el-button>
      </div>
    </div>
    
    <BaseChart
      ref="chartRef"
      :option="chartOption"
      :height="height"
      :loading="loading"
      :theme="theme"
      @chart-click="handleChartClick"
      @chart-ready="handleChartReady"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElButton, ElMessage } from 'element-plus'
import { ZoomIn, Download } from '@element-plus/icons-vue'
import BaseChart from '@/components/charts/BaseChart.vue'
import type { EChartsOption } from 'echarts'
import type { ChartType } from '@/types/analytics'

interface Props {
  title: string
  data: any[]
  chartType: ChartType
  height?: string
  loading?: boolean
  theme?: 'light' | 'dark'
  drillDownEnabled?: boolean
  exportEnabled?: boolean
  xAxisKey?: string
  yAxisKey?: string
  seriesName?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '400px',
  loading: false,
  theme: 'light',
  drillDownEnabled: false,
  exportEnabled: true,
  xAxisKey: 'date',
  yAxisKey: 'value',
  seriesName: '数据'
})

const emit = defineEmits<{
  drillDown: [data: any]
  export: []
  chartClick: [params: any]
}>()

const chartRef = ref<InstanceType<typeof BaseChart>>()

// Generate chart option based on chart type
const chartOption = computed<EChartsOption>(() => {
  const { data, chartType, xAxisKey, yAxisKey, seriesName } = props
  
  const baseOption: EChartsOption = {
    tooltip: {
      trigger: chartType === 'pie' ? 'item' : 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: [seriesName]
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  }
  
  switch (chartType) {
    case 'line':
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: data.map(item => item[xAxisKey]),
          boundaryGap: false
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: seriesName,
            type: 'line',
            data: data.map(item => item[yAxisKey]),
            smooth: true,
            areaStyle: {}
          }
        ]
      }
      
    case 'bar':
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: data.map(item => item[xAxisKey])
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: seriesName,
            type: 'bar',
            data: data.map(item => item[yAxisKey]),
            itemStyle: {
              borderRadius: [4, 4, 0, 0]
            }
          }
        ]
      }
      
    case 'pie':
      return {
        ...baseOption,
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        series: [
          {
            name: seriesName,
            type: 'pie',
            radius: '50%',
            data: data.map(item => ({
              name: item[xAxisKey],
              value: item[yAxisKey]
            })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      
    case 'area':
      return {
        ...baseOption,
        xAxis: {
          type: 'category',
          data: data.map(item => item[xAxisKey]),
          boundaryGap: false
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: seriesName,
            type: 'line',
            data: data.map(item => item[yAxisKey]),
            smooth: true,
            areaStyle: {
              opacity: 0.8
            }
          }
        ]
      }
      
    case 'scatter':
      return {
        ...baseOption,
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: seriesName,
            type: 'scatter',
            data: data.map(item => [item[xAxisKey], item[yAxisKey]]),
            symbolSize: 10
          }
        ]
      }
      
    default:
      return baseOption
  }
})

// Handle drill down
const handleDrillDown = () => {
  emit('drillDown', props.data)
}

// Handle export
const handleExport = () => {
  const chart = chartRef.value?.getInstance()
  if (!chart) {
    ElMessage.error('图表未初始化')
    return
  }
  
  // Get chart image as base64
  const imageUrl = chart.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#fff'
  })
  
  // Create download link
  const link = document.createElement('a')
  link.href = imageUrl
  link.download = `${props.title}_${Date.now()}.png`
  link.click()
  
  emit('export')
  ElMessage.success('图表导出成功')
}

// Handle chart click
const handleChartClick = (params: any) => {
  emit('chartClick', params)
}

// Handle chart ready
const handleChartReady = () => {
  // Chart is ready, can perform additional operations
}

// Watch for data changes
watch(
  () => props.data,
  () => {
    // Data changed, chart will auto-update via computed option
  },
  { deep: true }
)

// Expose methods
defineExpose({
  resize: () => chartRef.value?.resize(),
  getInstance: () => chartRef.value?.getInstance()
})
</script>

<style scoped lang="scss">
.analytics-chart {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #e8e8e8;
    
    .chart-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    
    .chart-actions {
      display: flex;
      gap: 8px;
    }
  }
}
</style>
