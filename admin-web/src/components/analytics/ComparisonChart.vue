<template>
  <div class="comparison-chart">
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="period-selector">
        <el-tag type="info">{{ period1Label }}</el-tag>
        <span class="vs">VS</span>
        <el-tag type="success">{{ period2Label }}</el-tag>
      </div>
    </div>
    
    <BaseChart
      ref="chartRef"
      :option="chartOption"
      :height="height"
      :loading="loading"
      :theme="theme"
    />
    
    <div class="comparison-summary">
      <div
        v-for="metric in comparisonMetrics"
        :key="metric.name"
        class="metric-item"
      >
        <div class="metric-name">{{ metric.label }}</div>
        <div class="metric-values">
          <span class="period1-value">{{ formatValue(metric.period1Value) }}</span>
          <el-icon :class="['change-icon', metric.changeType]">
            <ArrowUp v-if="metric.changeType === 'increase'" />
            <ArrowDown v-else-if="metric.changeType === 'decrease'" />
            <Minus v-else />
          </el-icon>
          <span class="period2-value">{{ formatValue(metric.period2Value) }}</span>
        </div>
        <div :class="['change-percentage', metric.changeType]">
          {{ metric.changePercentage >= 0 ? '+' : '' }}{{ metric.changePercentage.toFixed(2) }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElTag, ElIcon } from 'element-plus'
import { ArrowUp, ArrowDown, Minus } from '@element-plus/icons-vue'
import BaseChart from '@/components/charts/BaseChart.vue'
import type { EChartsOption } from 'echarts'

interface ComparisonMetric {
  name: string
  label: string
  period1Value: number
  period2Value: number
  change: number
  changePercentage: number
  changeType: 'increase' | 'decrease' | 'stable'
}

interface Props {
  title: string
  period1Label: string
  period2Label: string
  period1Data: any[]
  period2Data: any[]
  comparisonMetrics: ComparisonMetric[]
  height?: string
  loading?: boolean
  theme?: 'light' | 'dark'
  xAxisKey?: string
  yAxisKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '400px',
  loading: false,
  theme: 'light',
  xAxisKey: 'date',
  yAxisKey: 'value'
})

const chartRef = ref<InstanceType<typeof BaseChart>>()

// Generate comparison chart option
const chartOption = computed<EChartsOption>(() => {
  const { period1Data, period2Data, period1Label, period2Label, xAxisKey, yAxisKey } = props
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: [period1Label, period2Label]
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: period1Data.map(item => item[xAxisKey]),
      boundaryGap: false
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: period1Label,
        type: 'line',
        data: period1Data.map(item => item[yAxisKey]),
        smooth: true,
        itemStyle: {
          color: '#909399'
        },
        areaStyle: {
          opacity: 0.3
        }
      },
      {
        name: period2Label,
        type: 'line',
        data: period2Data.map(item => item[yAxisKey]),
        smooth: true,
        itemStyle: {
          color: '#67C23A'
        },
        areaStyle: {
          opacity: 0.3
        }
      }
    ]
  }
})

// Format value for display
const formatValue = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`
  }
  return value.toFixed(0)
}

// Expose methods
defineExpose({
  resize: () => chartRef.value?.resize()
})
</script>

<style scoped lang="scss">
.comparison-chart {
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
    
    .period-selector {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .vs {
        font-weight: 600;
        color: #909399;
      }
    }
  }
  
  .comparison-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    padding: 16px;
    background: #f5f5f5;
    border-radius: 4px;
    margin-top: 16px;
    
    .metric-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      background: white;
      border-radius: 4px;
      
      .metric-name {
        font-size: 14px;
        color: #666;
      }
      
      .metric-values {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 600;
        
        .period1-value {
          color: #909399;
        }
        
        .period2-value {
          color: #67C23A;
        }
        
        .change-icon {
          font-size: 18px;
          
          &.increase {
            color: #67C23A;
          }
          
          &.decrease {
            color: #F56C6C;
          }
          
          &.stable {
            color: #909399;
          }
        }
      }
      
      .change-percentage {
        font-size: 14px;
        font-weight: 600;
        
        &.increase {
          color: #67C23A;
        }
        
        &.decrease {
          color: #F56C6C;
        }
        
        &.stable {
          color: #909399;
        }
      }
    }
  }
}
</style>
