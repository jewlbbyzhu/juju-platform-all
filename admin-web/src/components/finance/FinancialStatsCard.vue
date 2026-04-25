<template>
  <el-card class="financial-stats-card" shadow="hover">
    <div class="stats-content">
      <div class="stats-icon" :style="{ backgroundColor: iconBgColor }">
        <el-icon :size="32" :color="iconColor">
          <component :is="icon" />
        </el-icon>
      </div>
      <div class="stats-info">
        <div class="stats-label">{{ label }}</div>
        <div class="stats-value">{{ formattedValue }}</div>
        <div v-if="showTrend && trend" class="stats-trend" :class="trendClass">
          <el-icon :size="14">
            <component :is="trendIcon" />
          </el-icon>
          <span>{{ trendText }}</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElCard, ElIcon } from 'element-plus'
import {
  Money,
  TrendCharts,
  Wallet,
  CreditCard,
  ArrowUp,
  ArrowDown
} from '@element-plus/icons-vue'

interface Props {
  label: string
  value: number
  icon?: any
  iconColor?: string
  iconBgColor?: string
  trend?: {
    value: number
    type: 'up' | 'down'
  }
  showTrend?: boolean
  formatType?: 'currency' | 'number' | 'percent'
}

const props = withDefaults(defineProps<Props>(), {
  icon: Money,
  iconColor: '#409EFF',
  iconBgColor: '#ecf5ff',
  showTrend: false,
  formatType: 'currency'
})

// Format value based on type
const formattedValue = computed(() => {
  switch (props.formatType) {
    case 'currency':
      return `¥${(props.value / 100).toFixed(2)}`
    case 'percent':
      return `${props.value.toFixed(2)}%`
    case 'number':
    default:
      return props.value.toLocaleString()
  }
})

// Trend icon
const trendIcon = computed(() => {
  if (!props.trend) return null
  return props.trend.type === 'up' ? ArrowUp : ArrowDown
})

// Trend class
const trendClass = computed(() => {
  if (!props.trend) return ''
  return props.trend.type === 'up' ? 'trend-up' : 'trend-down'
})

// Trend text
const trendText = computed(() => {
  if (!props.trend) return ''
  const value = Math.abs(props.trend.value)
  return `${value.toFixed(2)}%`
})
</script>

<style scoped lang="scss">
.financial-stats-card {
  height: 100%;

  :deep(.el-card__body) {
    padding: 20px;
  }

  .stats-content {
    display: flex;
    align-items: center;
    gap: 16px;

    .stats-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stats-info {
      flex: 1;
      min-width: 0;

      .stats-label {
        font-size: 14px;
        color: #909399;
        margin-bottom: 8px;
      }

      .stats-value {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }

      .stats-trend {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;

        &.trend-up {
          color: #67C23A;
        }

        &.trend-down {
          color: #F56C6C;
        }
      }
    }
  }
}
</style>
