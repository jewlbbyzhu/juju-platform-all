<template>
  <div class="revenue-source-chart">
    <div class="chart-header">
      <h3>收入来源分析</h3>
    </div>
    <BaseChart
      :option="chartOption"
      :loading="loading"
      height="400px"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

// Revenue source labels
const sourceLabels: Record<string, string> = {
  ticket: '票务收入',
  service: '服务费收入',
  vip: 'VIP收入',
  commission: '手续费收入'
}

// Chart option
const chartOption = computed<EChartsOption>(() => {
  if (!props.data || !props.data.revenue) {
    return {}
  }

  const revenue = props.data.revenue
  const chartData = [
    { name: sourceLabels.ticket, value: revenue.ticket / 100 },
    { name: sourceLabels.service, value: revenue.service / 100 },
    { name: sourceLabels.vip, value: revenue.vip / 100 },
    { name: sourceLabels.commission, value: revenue.commission / 100 }
  ].filter(item => item.value > 0) // Only show non-zero values

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.name}<br/>金额: ¥${params.value.toFixed(2)}<br/>占比: ${params.percent}%`
      }
    },
    legend: {
      orient: 'vertical',
      right: '10%',
      top: 'center',
      data: chartData.map(item => item.name)
    },
    series: [
      {
        name: '收入来源',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold',
            formatter: (params: any) => {
              return `${params.name}\n¥${params.value.toFixed(2)}`
            }
          }
        },
        labelLine: {
          show: false
        },
        data: chartData,
        color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C']
      }
    ]
  }
})
</script>

<style scoped lang="scss">
.revenue-source-chart {
  .chart-header {
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
