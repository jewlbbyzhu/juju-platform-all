<template>
  <el-card class="payment-record-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span class="title">支付记录</span>
      </div>
    </template>

    <div class="payment-content">
      <el-timeline>
        <el-timeline-item
          v-for="(record, index) in paymentRecords"
          :key="index"
          :timestamp="formatDate(record.timestamp)"
          :type="record.type"
          placement="top"
        >
          <el-card>
            <div class="record-item">
              <div class="record-header">
                <span class="record-title">{{ record.title }}</span>
                <el-tag :type="record.tagType" size="small">
                  {{ record.status }}
                </el-tag>
              </div>
              <div class="record-details">
                <div class="detail-item" v-if="record.amount">
                  <span class="label">金额:</span>
                  <span class="value amount">¥{{ (record.amount / 100).toFixed(2) }}</span>
                </div>
                <div class="detail-item" v-if="record.method">
                  <span class="label">支付方式:</span>
                  <span class="value">{{ record.method }}</span>
                </div>
                <div class="detail-item" v-if="record.transactionNo">
                  <span class="label">交易号:</span>
                  <span class="value">{{ record.transactionNo }}</span>
                </div>
                <div class="detail-item" v-if="record.description">
                  <span class="label">说明:</span>
                  <span class="value">{{ record.description }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <el-empty
        v-if="paymentRecords.length === 0"
        description="暂无支付记录"
      />
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

interface PaymentRecord {
  timestamp: string
  title: string
  status: string
  type: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  tagType: 'primary' | 'success' | 'warning' | 'danger' | 'info' | ''
  amount?: number
  method?: string
  transactionNo?: string
  description?: string
}

const props = defineProps<Props>()

// Generate payment records from order data
const paymentRecords = computed<PaymentRecord[]>(() => {
  const records: PaymentRecord[] = []

  // Order creation record
  records.push({
    timestamp: props.order.registrationAt,
    title: '订单创建',
    status: '已创建',
    type: 'info',
    tagType: 'info',
    amount: props.order.amount,
    description: '用户创建订单'
  })

  // Payment record
  if (props.order.paidAt) {
    records.push({
      timestamp: props.order.paidAt,
      title: '订单支付',
      status: '支付成功',
      type: 'success',
      tagType: 'success',
      amount: props.order.amount,
      method: props.order.paymentMethod === 'wechat' ? '微信支付' : '钱包支付',
      transactionNo: props.order.orderNo,
      description: '用户完成支付'
    })
  }

  // Cancellation record
  if (props.order.cancelledAt) {
    records.push({
      timestamp: props.order.cancelledAt,
      title: '订单取消',
      status: '已取消',
      type: 'warning',
      tagType: 'warning',
      description: '订单已被取消'
    })
  }

  // Refund record
  if (props.order.refund) {
    records.push({
      timestamp: props.order.refund.createdAt,
      title: '退款申请',
      status: '申请中',
      type: 'warning',
      tagType: 'warning',
      amount: props.order.refund.amount,
      description: props.order.refund.reason || '用户申请退款'
    })

    if (props.order.refund.processedAt) {
      const isProcessed = props.order.refund.status === 'processed'
      records.push({
        timestamp: props.order.refund.processedAt,
        title: isProcessed ? '退款成功' : '退款拒绝',
        status: isProcessed ? '已退款' : '已拒绝',
        type: isProcessed ? 'success' : 'danger',
        tagType: isProcessed ? 'success' : 'danger',
        amount: isProcessed ? props.order.refund.amount : undefined,
        description: props.order.refund.reason || (isProcessed ? '退款已处理' : '退款申请被拒绝')
      })
    }
  }

  // Sort by timestamp descending (newest first)
  return records.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
})
</script>

<style scoped lang="scss">
.payment-record-card {
  .card-header {
    .title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .payment-content {
    .record-item {
      .record-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .record-title {
          font-size: 16px;
          font-weight: 600;
        }
      }

      .record-details {
        .detail-item {
          display: flex;
          margin-bottom: 8px;

          &:last-child {
            margin-bottom: 0;
          }

          .label {
            min-width: 80px;
            color: #909399;
          }

          .value {
            flex: 1;
            color: #303133;

            &.amount {
              font-weight: 600;
              color: #f56c6c;
            }
          }
        }
      }
    }
  }
}
</style>
