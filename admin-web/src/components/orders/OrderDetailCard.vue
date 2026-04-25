<template>
  <el-card class="order-detail-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span class="title">订单详情</span>
        <el-tag :type="statusTagType">{{ statusLabel }}</el-tag>
      </div>
    </template>

    <div class="order-content">
      <!-- 基本信息 -->
      <div class="info-section">
        <h3 class="section-title">基本信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">
            {{ order.orderNo }}
          </el-descriptions-item>
          <el-descriptions-item label="订单类型">
            <el-tag :type="orderTypeTagType">{{ orderTypeLabel }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="订单名称">
            {{ orderNameLabel }}
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="statusTagType">{{ statusLabel }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(order.registrationAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="支付时间">
            {{ order.paidAt ? formatDate(order.paidAt) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="取消时间">
            {{ order.cancelledAt ? formatDate(order.cancelledAt) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="退款时间">
            {{ order.refundedAt ? formatDate(order.refundedAt) : '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 金额信息 -->
      <div class="info-section">
        <h3 class="section-title">金额信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="单价">
            ¥{{ (order.unitPrice / 100).toFixed(2) }}
          </el-descriptions-item>
          <el-descriptions-item label="数量">
            {{ order.quantity }}
          </el-descriptions-item>
          <el-descriptions-item label="总金额">
            <span class="amount">¥{{ (order.amount / 100).toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">
            {{ paymentMethodLabel }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 用户信息 -->
      <div class="info-section" v-if="order.user">
        <h3 class="section-title">用户信息</h3>
        <div class="user-info">
          <el-avatar :src="order.user.avatar" :size="60" />
          <div class="user-details">
            <div class="user-name">
              {{ order.user.nickname }}
              <el-tag v-if="order.user.is_vip" type="warning" size="small">
                VIP
              </el-tag>
            </div>
            <div class="user-id">ID: {{ order.user.id }}</div>
            <div class="user-phone" v-if="order.user.phone">
              手机: {{ order.user.phone }}
            </div>
          </div>
        </div>
      </div>

      <!-- 聚会信息 -->
      <div class="info-section" v-if="order.party">
        <h3 class="section-title">聚会信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="聚会标题">
            {{ order.party.title }}
          </el-descriptions-item>
          <el-descriptions-item label="聚会ID">
            {{ order.party.id }}
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">
            {{ formatDate(order.party.start_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="地点">
            {{ order.party.location.address }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 票券信息 -->
      <div class="info-section" v-if="order.tickets && order.tickets.length > 0">
        <h3 class="section-title">票券信息</h3>
        <el-table :data="order.tickets" border stripe>
          <el-table-column prop="ticketNo" label="票号" />
          <el-table-column label="票种">
            <template #default="{ row }">
              {{ getTicketTypeName(row.ticketType) }}
            </template>
          </el-table-column>
          <el-table-column label="状态">
            <template #default="{ row }">
              <el-tag :type="getTicketStatusTagType(row.status)">
                {{ getTicketStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="使用时间">
            <template #default="{ row }">
              {{ row.usedAt ? formatDate(row.usedAt) : '-' }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 退款信息 -->
      <div class="info-section" v-if="order.refund">
        <h3 class="section-title">退款信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="退款金额">
            <span class="amount">¥{{ (order.refund.amount / 100).toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="退款状态">
            <el-tag :type="refundStatusTagType">{{ refundStatusLabel }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">
            {{ formatDate(order.refund.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="处理时间">
            {{ order.refund.processedAt ? formatDate(order.refund.processedAt) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="退款原因" :span="2">
            {{ order.refund.reason || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { OrderDetail } from '@/types/order'
import { formatDate } from '@/utils/format'

interface Props {
  order: OrderDetail
}

const props = defineProps<Props>()

// 订单类型标签
const orderTypeLabel = computed(() => {
  const labels: Record<string, string> = {
    ticket: '票务订单',
    package: 'VIP套餐',
    service_fee: '服务费'
  }
  return labels[props.order.orderType] || '未知'
})

const orderTypeTagType = computed(() => {
  const types: Record<string, string> = {
    ticket: 'primary',
    package: 'warning',
    service_fee: 'info'
  }
  return types[props.order.orderType] || 'info'
})

// 订单名称
const orderNameLabel = computed(() => {
  const labels: Record<number, string> = {
    1: '普通票',
    2: '早鸟票',
    3: '男性票',
    4: '女性票',
    5: '男性早鸟票',
    6: '女性早鸟票',
    7: '中小型聚会服务费',
    8: '中型聚会服务费',
    9: '大型聚会服务费',
    10: '月付VIP套餐',
    11: '季付VIP套餐',
    12: '年付VIP套餐'
  }
  return labels[props.order.orderName] || '未知'
})

// 订单状态标签
const statusLabel = computed(() => {
  const labels: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    cancelled: '已取消',
    refunded: '已退款'
  }
  return labels[props.order.status] || '未知'
})

const statusTagType = computed(() => {
  const types: Record<string, string> = {
    pending: 'warning',
    paid: 'success',
    cancelled: 'info',
    refunded: 'danger'
  }
  return types[props.order.status] || 'info'
})

// 支付方式
const paymentMethodLabel = computed(() => {
  if (!props.order.paymentMethod) return '-'
  const labels = {
    wechat: '微信支付',
    wallet: '钱包支付'
  }
  return labels[props.order.paymentMethod] || '未知'
})

// 退款状态
const refundStatusLabel = computed(() => {
  if (!props.order.refund) return '-'
  const labels = {
    pending: '待处理',
    processed: '已处理',
    rejected: '已拒绝'
  }
  return labels[props.order.refund.status] || '未知'
})

const refundStatusTagType = computed(() => {
  if (!props.order.refund) return 'info'
  const types: Record<string, string> = {
    pending: 'warning',
    processed: 'success',
    rejected: 'danger'
  }
  return types[props.order.refund.status] || 'info'
})

// 票种名称
const getTicketTypeName = (ticketType: number) => {
  const names: Record<number, string> = {
    1: '普通票',
    2: '早鸟票',
    3: '男性票',
    4: '女性票',
    5: '男性早鸟票',
    6: '女性早鸟票'
  }
  return names[ticketType] || '未知'
}

// 票券状态
const getTicketStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    valid: '有效',
    used: '已使用',
    refunded: '已退款'
  }
  return labels[status] || '未知'
}

const getTicketStatusTagType = (status: string) => {
  const types: Record<string, string> = {
    valid: 'success',
    used: 'info',
    refunded: 'danger'
  }
  return types[status] || 'info'
}
</script>

<style scoped lang="scss">
.order-detail-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .order-content {
    .info-section {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 12px;
        color: #303133;
      }

      .amount {
        font-size: 18px;
        font-weight: 600;
        color: #f56c6c;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px;
        background-color: #f5f7fa;
        border-radius: 4px;

        .user-details {
          .user-name {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .user-id,
          .user-phone {
            font-size: 14px;
            color: #909399;
            margin-bottom: 2px;
          }
        }
      }
    }
  }
}
</style>
