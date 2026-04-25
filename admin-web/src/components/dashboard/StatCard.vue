<template>
  <div 
    class="stat-card"
    :class="[`stat-card--${type}`, { 'stat-card--clickable': clickable }]"
    @click="handleClick"
  >
    <div class="stat-card__icon">
      <el-icon :size="24">
        <component :is="icon" />
      </el-icon>
    </div>
    
    <div class="stat-card__content">
      <div class="stat-card__label">{{ title }}</div>
      <div class="stat-card__value">{{ formattedValue }}</div>
      
      <div v-if="trend" class="stat-card__trend" :class="`stat-card__trend--${trend.direction}`">
        <el-icon>
          <component :is="trend.direction === 'up' ? ArrowUp : ArrowDown" />
        </el-icon>
        <span>{{ Math.abs(trend.value) }}%</span>
        <span class="trend-label">较上期</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'

interface Trend {
  value: number
  direction: 'up' | 'down'
}

interface Props {
  title: string
  value: number
  icon: Component
  type?: 'primary' | 'success' | 'warning' | 'error' | 'info'
  trend?: Trend
  formatter?: (value: number) => string
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  formatter: (value: number) => value.toLocaleString('zh-CN'),
  clickable: true
})

const emit = defineEmits<{
  click: []
}>()

const formattedValue = computed(() => {
  return props.formatter(props.value)
})

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<style scoped lang="scss">
.stat-card {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-4);
  padding: var(--spacing-5);
  background-color: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-card);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background-color: var(--color-brand);
    opacity: 0;
    transition: opacity var(--transition-normal);
  }
  
  &:hover {
    box-shadow: var(--shadow-card-hover);
    transform: translateY(-2px);
    
    &::before {
      opacity: 1;
    }
  }
  
  &--clickable {
    cursor: pointer;
  }
  
  &--primary::before {
    background-color: var(--color-primary-500);
  }
  
  &--success::before {
    background-color: var(--color-success-500);
  }
  
  &--warning::before {
    background-color: var(--color-warning-500);
  }
  
  &--error::before {
    background-color: var(--color-error-500);
  }
  
  &--info::before {
    background-color: var(--color-info-500);
  }
  
  &__icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all var(--transition-fast);
    
    .stat-card--primary & {
      background-color: var(--color-primary-50);
      color: var(--color-primary-500);
    }
    
    .stat-card--success & {
      background-color: var(--color-success-50);
      color: var(--color-success-500);
    }
    
    .stat-card--warning & {
      background-color: var(--color-warning-50);
      color: var(--color-warning-600);
    }
    
    .stat-card--error & {
      background-color: var(--color-error-50);
      color: var(--color-error-500);
    }
    
    .stat-card--info & {
      background-color: var(--color-info-50);
      color: var(--color-info-500);
    }
    
    .dark .stat-card--primary & {
      background-color: rgba(240, 78, 12, 0.2);
    }
    
    .dark .stat-card--success & {
      background-color: rgba(76, 175, 80, 0.2);
    }
    
    .dark .stat-card--warning & {
      background-color: rgba(255, 193, 7, 0.2);
    }
    
    .dark .stat-card--error & {
      background-color: rgba(244, 67, 54, 0.2);
    }
    
    .dark .stat-card--info & {
      background-color: rgba(33, 150, 243, 0.2);
    }
  }
  
  &__content {
    flex: 1;
    min-width: 0;
  }
  
  &__label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-1);
    font-weight: var(--font-weight-medium);
  }
  
  &__value {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    line-height: var(--line-height-tight);
    margin-bottom: var(--spacing-2);
  }
  
  &__trend {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-1);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    padding: var(--spacing-1) var(--spacing-2);
    border-radius: var(--radius-full);
    
    &--up {
      background-color: var(--color-success-50);
      color: var(--color-success-600);
      
      .dark & {
        background-color: rgba(76, 175, 80, 0.2);
      }
    }
    
    &--down {
      background-color: var(--color-error-50);
      color: var(--color-error-600);
      
      .dark & {
        background-color: rgba(244, 67, 54, 0.2);
      }
    }
    
    .el-icon {
      font-size: 12px;
    }
    
    .trend-label {
      color: var(--color-text-tertiary);
      font-weight: var(--font-weight-normal);
    }
  }
}
</style>
