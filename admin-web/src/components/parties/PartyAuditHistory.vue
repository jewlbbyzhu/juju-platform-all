<template>
  <el-card class="party-audit-history" shadow="hover">
    <template #header>
      <div class="card-header">
        <span class="title">审核历史</span>
        <el-button
          type="primary"
          size="small"
          :icon="Refresh"
          @click="handleRefresh"
          :loading="loading"
        >
          刷新
        </el-button>
      </div>
    </template>

    <div v-if="loading && !history.length" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <el-empty
      v-else-if="!history.length"
      description="暂无审核历史"
    />

    <el-timeline v-else>
      <el-timeline-item
        v-for="item in history"
        :key="item.id"
        :timestamp="formatDateTime(item.createdAt)"
        placement="top"
        :type="getTimelineType(item.status)"
        :icon="getTimelineIcon(item.status)"
      >
        <el-card shadow="hover">
          <div class="history-item">
            <div class="history-header">
              <el-tag :type="getStatusTagType(item.status)">
                {{ getStatusLabel(item.status) }}
              </el-tag>
              <span class="reviewer">审核人: {{ item.reviewer }}</span>
            </div>
            <div v-if="item.reason" class="history-reason">
              <span class="reason-label">审核意见:</span>
              <span class="reason-content">{{ item.reason }}</span>
            </div>
          </div>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </el-card>
</template>

<script setup lang="ts">
import { Refresh, CircleCheck, CircleClose, Clock } from '@element-plus/icons-vue'
import type { PartyAuditHistory } from '@/types/party'
import { AuditStatus } from '@/types/party'
import { formatDateTime } from '@/utils/format'

interface Props {
  history: PartyAuditHistory[]
  loading?: boolean
}

interface Emits {
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 获取状态标签
const getStatusLabel = (status: AuditStatus) => {
  const labels = {
    [AuditStatus.PENDING]: '待审核',
    [AuditStatus.APPROVED]: '已通过',
    [AuditStatus.REJECTED]: '已拒绝'
  }
  return labels[status] || '未知'
}

// 获取状态标签类型
const getStatusTagType = (status: AuditStatus) => {
  const types = {
    [AuditStatus.PENDING]: 'warning',
    [AuditStatus.APPROVED]: 'success',
    [AuditStatus.REJECTED]: 'danger'
  }
  return types[status] || 'info'
}

// 获取时间线类型
const getTimelineType = (status: AuditStatus) => {
  const types = {
    [AuditStatus.PENDING]: 'warning',
    [AuditStatus.APPROVED]: 'success',
    [AuditStatus.REJECTED]: 'danger'
  }
  return types[status] || 'info'
}

// 获取时间线图标
const getTimelineIcon = (status: AuditStatus) => {
  const icons = {
    [AuditStatus.PENDING]: Clock,
    [AuditStatus.APPROVED]: CircleCheck,
    [AuditStatus.REJECTED]: CircleClose
  }
  return icons[status] || Clock
}

// 刷新历史
const handleRefresh = () => {
  emit('refresh')
}
</script>

<style scoped lang="scss">
.party-audit-history {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .loading-container {
    padding: 20px;
  }

  :deep(.el-timeline) {
    padding-left: 0;
  }

  .history-item {
    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .reviewer {
        font-size: 14px;
        color: #606266;
      }
    }

    .history-reason {
      padding: 8px 12px;
      background-color: #f5f7fa;
      border-radius: 4px;
      font-size: 14px;

      .reason-label {
        font-weight: 600;
        margin-right: 8px;
        color: #606266;
      }

      .reason-content {
        color: #303133;
      }
    }
  }
}
</style>
