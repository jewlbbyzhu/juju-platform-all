<template>
  <div class="revenue-trend-chart">
    <div class="chart-header">
      <h3>收入趋势</h3>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        :shortcuts="dateShortcuts"
        @change="handleDateChange"
      />
    </div>
    <BaseChart
      :option="chartOption"
      :loading="loading"
      height="400px"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElDatePicker } from 'element-plus'
import BaseChart from '@/components/charts/BaseChart.vue'
import type { EChartsOption } from 'echarts'
import type { FinancialStats } from '@/types/finance'

interface Props {
  data?: FinancialStats
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  dateRangeChange: [startDate: string, endDate: string]
}>()

const dateRange = ref<[string, string]>()

// Date shortcuts
const dateShortcuts = [
  {
    text: '最近7天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近30天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近90天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// Chart option
const chartOption = computed<EChartsOption>(() => {
  if (!props.data || !props.data.trends) {
    return {}
  }

  const dates = props.data.trends.map(item => item.date)
  const revenues = props.data.trends.map(item => item.revenue / 100) // Convert from cents to yuan

  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const param = params[0]
        return `${param.name}<br/>收入: ¥${param.value.toFixed(2)}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        formatter: (value: string) => {
          // Format date to MM-DD
          const date = new Date(value)
          return `${date.getMonth() + 1}-${date.getDate()}`
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => `¥${value.toFixed(0)}`
      }
    },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        data: revenues,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
            ]
          }
        },
        itemStyle: {
          color: '#409EFF'
        },
        lineStyle: {
          width: 2
        }
      }
    ]
  }
})

// Handle date range change
const handleDateChange = (value: [string, string] | null) => {
  if (value && value.length === 2) {
    emit('dateRangeChange', value[0], value[1])
  }
}

// Initialize with last 30 days
onMounted(() => {
  const end = new Date()
  const start = new Date()
  start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
  
  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  dateRange.value = [formatDate(start), formatDate(end)]
  emit('dateRangeChange', dateRange.value[0], dateRange.value[1])
})
</script>

<style scoped lang="scss">
.revenue-trend-chart {
  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }
}
</style>
