<template>
  <el-card class="dashboard-card" :body-style="{ padding: '20px' }">
    <div class="card-header">
      <div class="card-icon" :style="{ backgroundColor: iconBgColor }">
        <el-icon :size="24" :color="iconColor">
          <component :is="icon" />
        </el-icon>
      </div>
      <div class="card-title">{{ title }}</div>
    </div>
    
    <div class="card-content">
      <div class="card-value">{{ formattedValue }}</div>
      
      <div v-if="trend" class="card-trend" :class="trendClass">
        <el-icon :size="16">
          <component :is="trendIcon" />
        </el-icon>
        <span class="trend-value">{{ trendText }}</span>
        <span class="trend-label">较昨日</span>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  User, 
  Calendar, 
  ShoppingCart, 
  Money,
  ArrowUp,
  ArrowDown,
  Minus
} from '@element-plus/icons-vue'

interface Trend {
  value: number
  type: 'up' | 'down' | 'stable'
}

interface Props {
  title: string
  value: number | string
  trend?: Trend
  icon?: any
  color?: string
  valueFormatter?: (value: number | string) => string
}

const props = withDefaults(defineProps<Props>(), {
  icon: User,
  color: '#409EFF',
  valueFormatter: (value) => String(value)
})

// Format the display value
const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.valueFormatter(props.value)
  }
  return props.value
})

// Icon background color (lighter version of main color)
const iconBgColor = computed(() => {
  return `${props.color}20`
})

// Icon color
const iconColor = computed(() => {
  return props.color
})

// Trend icon
const trendIcon = computed(() => {
  if (!props.trend) return Minus
  
  switch (props.trend.type) {
    case 'up':
      return ArrowUp
    case 'down':
      return ArrowDown
    default:
      return Minus
  }
})

// Trend class
const trendClass = computed(() => {
  if (!props.trend) return ''
  
  return {
    'trend-up': props.trend.type === 'up',
    'trend-down': props.trend.type === 'down',
    'trend-stable': props.trend.type === 'stable'
  }
})

// Trend text
const trendText = computed(() => {
  if (!props.trend) return ''
  
  const absValue = Math.abs(props.trend.value)
  return `${absValue.toFixed(1)}%`
})
</script>

<style scoped lang="scss">
.dashboard-card {
  height: 100%;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.card-title {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

.card-trend {
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
  
  &.trend-stable {
    color: #909399;
  }
}

.trend-value {
  font-weight: 600;
}

.trend-label {
  color: #909399;
  margin-left: 4px;
}
</style>
