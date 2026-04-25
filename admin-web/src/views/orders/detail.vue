<template>
  <div class="order-detail">
    <el-page-header @back="handleBack" title="返回">
      <template #content>
        <span class="page-title">订单详情</span>
      </template>
    </el-page-header>

    <div class="detail-content" v-loading="loading">
      <el-row :gutter="20">
        <!-- Left Column: Order Details -->
        <el-col :span="16">
          <OrderDetailCard :order="orderDetail" />
        </el-col>

        <!-- Right Column: Payment Records and Actions -->
        <el-col :span="8">
          <PaymentRecordCard :order="orderDetail" />

          <!-- Action Buttons -->
          <el-card class="action-card" shadow="hover">
            <template #header>
              <span class="title">操作</span>
            </template>

            <div class="action-buttons">
              <el-button
                v-if="orderDetail.refund && orderDetail.refund.status === 'pending'"
                type="warning"
                :icon="Document"
                @click="handleAuditRefund"
                block
              >
                审核退款
              </el-button>

              <el-button
                type="primary"
                :icon="Download"
                @click="handleExportOrder"
                block
              >
                导出订单
              </el-button>

              <el-button
                v-if="orderDetail.party"
                :icon="View"
                @click="handleViewParty"
                block
              >
                查看聚会
              </el-button>

              <el-button
                v-if="orderDetail.user"
                :icon="User"
                @click="handleViewUser"
                block
              >
                查看用户
              </el-button>
            </div>
          </el-card>

          <!-- Order Statistics -->
          <el-card class="stats-card" shadow="hover">
            <template #header>
              <span class="title">订单统计</span>
            </template>

            <div class="stats-content">
              <el-statistic
                title="订单金额"
                :value="Number(orderDetail.amount / 100) || 0"
                :precision="2"
                prefix="¥"
              />
              <el-divider />
              <el-statistic
                title="票券数量"
                :value="Number(orderDetail.tickets?.length) || 0"
                suffix="张"
              />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- Refund Audit Dialog -->
    <RefundAuditDialog
      v-model:visible="refundDialogVisible"
      :order="orderDetail"
      @success="handleRefundAuditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Document, Download, View, User } from '@element-plus/icons-vue'
import OrderDetailCard from '@/components/orders/OrderDetailCard.vue'
import PaymentRecordCard from '@/components/orders/PaymentRecordCard.vue'
import RefundAuditDialog from '@/components/orders/RefundAuditDialog.vue'
import { OrderAPI } from '@/api'
import type { OrderDetail } from '@/types/order'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const orderDetail = ref<OrderDetail>({} as OrderDetail)
const refundDialogVisible = ref(false)

const loadOrderDetail = async () => {
  try {
    loading.value = true
    const orderId = Number(route.params.id)
    if (!orderId || isNaN(orderId)) {
      ElMessage.error('无效的订单ID')
      router.push('/orders')
      return
    }
    orderDetail.value = await OrderAPI.getOrderDetail(orderId)
  } catch (error) {
    console.error('Failed to load order detail:', error)
    ElMessage.error('加载订单详情失败')
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  router.back()
}

const handleAuditRefund = () => {
  refundDialogVisible.value = true
}

const handleRefundAuditSuccess = async () => {
  try {
    ElMessage.success('退款审核成功')
    await loadOrderDetail()
  } catch (error) {
    console.error('Failed to audit refund:', error)
    ElMessage.error('退款审核失败')
  }
}

const handleExportOrder = async () => {
  try {
    const blob = await OrderAPI.batchExportOrders([orderDetail.value.id])

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `order_${orderDetail.value.orderNo}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('Failed to export order:', error)
    ElMessage.error('导出失败')
  }
}

const handleViewParty = () => {
  if (orderDetail.value.partyId) {
    router.push(`/parties/${orderDetail.value.partyId}`)
  }
}

const handleViewUser = () => {
  if (orderDetail.value.userId) {
    router.push(`/users/${orderDetail.value.userId}`)
  }
}

onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped lang="scss">
.order-detail {
  padding: 20px;

  .page-title {
    font-size: 18px;
    font-weight: 600;
  }

  .detail-content {
    margin-top: 20px;

    .action-card,
    .stats-card {
      margin-top: 20px;

      .title {
        font-size: 16px;
        font-weight: 600;
      }

      .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .stats-content {
        :deep(.el-statistic) {
          text-align: center;
        }
      }
    }
  }
}
</style>
