<template>
  <div ref="chartRef" class="base-chart" :style="{ height: height, width: width }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption, ECharts } from 'echarts'

interface Props {
  option: EChartsOption
  height?: string
  width?: string
  loading?: boolean
  theme?: 'light' | 'dark'
}

const props = withDefaults(defineProps<Props>(), {
  height: '400px',
  width: '100%',
  loading: false,
  theme: 'light'
})

const emit = defineEmits<{
  chartClick: [params: any]
  chartReady: [chart: ECharts]
}>()

const chartRef = ref<HTMLDivElement>()
let chartInstance: ECharts | null = null

// Initialize chart
const initChart = () => {
  if (!chartRef.value) return

  // Check if DOM has valid dimensions
  const { clientWidth, clientHeight } = chartRef.value
  if (clientWidth === 0 || clientHeight === 0) {
    // DOM not ready, retry after a short delay
    setTimeout(initChart, 100)
    return
  }

  // Dispose existing instance
  if (chartInstance) {
    chartInstance.dispose()
  }

  // Create new instance
  chartInstance = echarts.init(chartRef.value, props.theme)
  
  // Set option
  chartInstance.setOption(props.option)
  
  // Add click event listener
  chartInstance.on('click', (params) => {
    emit('chartClick', params)
  })
  
  // Emit ready event
  emit('chartReady', chartInstance)
}

// Update chart option
const updateChart = () => {
  if (!chartInstance) return
  
  chartInstance.setOption(props.option, {
    notMerge: false,
    lazyUpdate: false
  })
}

// Show/hide loading
const setLoading = (loading: boolean) => {
  if (!chartInstance) return
  
  if (loading) {
    chartInstance.showLoading('default', {
      text: '加载中...',
      color: '#409EFF',
      textColor: '#000',
      maskColor: 'rgba(255, 255, 255, 0.8)',
      zlevel: 0
    })
  } else {
    chartInstance.hideLoading()
  }
}

// Resize chart
const resize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// Watch for option changes
watch(
  () => props.option,
  () => {
    nextTick(() => {
      updateChart()
    })
  },
  { deep: true }
)

// Watch for loading changes
watch(
  () => props.loading,
  (loading) => {
    setLoading(loading)
  }
)

// Watch for theme changes
watch(
  () => props.theme,
  () => {
    initChart()
  }
)

// Lifecycle hooks
onMounted(() => {
  nextTick(() => {
    initChart()
    setLoading(props.loading)
    
    // Add resize listener
    window.addEventListener('resize', resize)
  })
})

onBeforeUnmount(() => {
  // Remove resize listener
  window.removeEventListener('resize', resize)
  
  // Dispose chart instance
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})

// Expose methods
defineExpose({
  resize,
  getInstance: () => chartInstance
})
</script>

<style scoped lang="scss">
.base-chart {
  width: 100%;
  height: 100%;
}
</style>
