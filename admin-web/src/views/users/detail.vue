<template>
  <div v-loading="loading" class="user-detail">
    <el-page-header @back="handleBack" title="返回">
      <template #content>
        <span class="page-title">用户详情</span>
      </template>
    </el-page-header>

    <div v-if="userDetail" class="detail-content">
      <!-- User Info Card -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <el-tag v-if="userDetail.is_vip" type="warning" effect="dark">
              VIP用户
            </el-tag>
          </div>
        </template>

        <div class="user-info">
          <div class="avatar-section">
            <el-avatar 
              :size="100" 
              :src="userDetail.avatar || '/default-avatar.png'"
              @error="handleAvatarError"
            >
              <el-icon :size="50"><User /></el-icon>
            </el-avatar>
            <div class="user-status">
              <el-tag
                :type="getStatusType(userDetail.status)"
                effect="dark"
              >
                {{ getStatusText(userDetail.status) }}
              </el-tag>
            </div>
          </div>

          <div class="info-section">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="用户ID">
                {{ userDetail.id }}
              </el-descriptions-item>
              <el-descriptions-item label="昵称">
                {{ userDetail.nickname }}
              </el-descriptions-item>
              <el-descriptions-item label="性别">
                {{ getGenderText(userDetail.gender) }}
              </el-descriptions-item>
              <el-descriptions-item label="地区">
                {{ (userDetail.province && userDetail.city) ? `${userDetail.province} ${userDetail.city}` : (userDetail.province || userDetail.city || '-') }}
              </el-descriptions-item>
              <el-descriptions-item label="生日">
                {{ userDetail.birthday || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="手机号">
                {{ userDetail.phone || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="VIP类型">
                {{ getVipTypeText(userDetail.vip_type) }}
              </el-descriptions-item>
              <el-descriptions-item label="VIP到期时间">
                {{ formatDate(userDetail.vip_expired_at) || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="注册时间">
                {{ formatDate(userDetail.created_at) }}
              </el-descriptions-item>
              <el-descriptions-item label="最后登录">
                {{ formatDate(userDetail.last_login_at) || '-' }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
      </el-card>

      <!-- Statistics Card -->
      <el-card class="stats-card">
        <template #header>
          <span>统计数据</span>
        </template>

        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ userDetail.stats?.joinedCount ?? 0 }}</div>
              <div class="stat-label">参与聚会</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ userDetail.stats?.createdCount ?? 0 }}</div>
              <div class="stat-label">创建聚会</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ userDetail.stats?.favoriteCount ?? 0 }}</div>
              <div class="stat-label">收藏数量</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ userDetail.stats?.orderCount ?? 0 }}</div>
              <div class="stat-label">订单数量</div>
            </div>
          </el-col>
        </el-row>

        <el-divider />

        <el-row :gutter="20">
          <el-col :span="12">
            <div class="stat-item">
              <div class="stat-value">¥{{ formatAmount(userDetail.stats?.totalExpense ?? 0) }}</div>
              <div class="stat-label">总支出</div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- Activities Card -->
      <el-card class="activities-card">
        <template #header>
          <span>行为记录</span>
        </template>

        <el-timeline>
          <el-timeline-item
            v-for="activity in userDetail.activities"
            :key="activity.id"
            :timestamp="formatDate(activity.createdAt)"
            placement="top"
          >
            <el-tag :type="getActivityType(activity.type)" size="small">
              {{ getActivityTypeText(activity.type) }}
            </el-tag>
            <span class="activity-desc">{{ activity.description }}</span>
          </el-timeline-item>
        </el-timeline>

        <div v-if="!userDetail.activities || userDetail.activities.length === 0" class="empty-state">
          <el-empty description="暂无行为记录" />
        </div>
      </el-card>

      <!-- Actions -->
      <div class="actions">
        <el-button
          v-if="userDetail.status === UserStatus.ACTIVE"
          type="danger"
          @click="handleBanUser"
        >
          封禁用户
        </el-button>
        <el-button
          v-if="userDetail.status === UserStatus.BANNED"
          type="success"
          @click="handleUnbanUser"
        >
          解封用户
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import { UserAPI } from '@/api'
import type { UserDetail } from '@/types/user'
import { UserStatus } from '@/types/user'

const route = useRoute()
const router = useRouter()

// State
const loading = ref(false)
const userDetail = ref<UserDetail | null>(null)

// Methods
const loadUserDetail = async () => {
  const userId = Number(route.params.id)
  if (!userId) {
    ElMessage.error('用户ID无效')
    return
  }

  loading.value = true
  try {
    userDetail.value = await UserAPI.getUserDetail(userId)
  } catch (error) {
    console.error('Failed to load user detail:', error)
    ElMessage.error('加载用户详情失败')
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  router.back()
}

const handleBanUser = async () => {
  if (!userDetail.value) return

  try {
    await ElMessageBox.confirm('确定要封禁该用户吗？', '封禁用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await UserAPI.updateUserStatus(userDetail.value.id, {
      status: UserStatus.BANNED,
    })

    ElMessage.success('用户已封禁')
    await loadUserDetail()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to ban user:', error)
      ElMessage.error('封禁用户失败')
    }
  }
}

const handleUnbanUser = async () => {
  if (!userDetail.value) return

  try {
    await ElMessageBox.confirm('确定要解封该用户吗？', '解封用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await UserAPI.updateUserStatus(userDetail.value.id, {
      status: UserStatus.ACTIVE,
    })

    ElMessage.success('用户已解封')
    await loadUserDetail()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to unban user:', error)
      ElMessage.error('解封用户失败')
    }
  }
}

// Formatters
const getStatusType = (status: number) => {
  const typeMap: Record<number, any> = {
    [UserStatus.ACTIVE]: 'success',
    [UserStatus.BANNED]: 'danger',
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: number) => {
  const textMap: Record<number, string> = {
    [UserStatus.ACTIVE]: '正常',
    [UserStatus.BANNED]: '已封禁',
  }
  return textMap[status] || '未知'
}

const getGenderText = (gender: number) => {
  const textMap: Record<number, string> = {
    0: '未知',
    1: '男',
    2: '女',
  }
  return textMap[gender] || '未知'
}

const getVipTypeText = (vipType?: string) => {
  if (!vipType) return '非VIP'
  
  const textMap: Record<string, string> = {
    monthly: '月付VIP',
    quarterly: '季付VIP',
    yearly: '年付VIP',
  }
  return textMap[vipType] || vipType
}

const getActivityType = (type: string) => {
  const typeMap: Record<string, any> = {
    login: 'info',
    create_party: 'success',
    join_party: 'primary',
    create_order: 'warning',
    payment: 'success',
    refund: 'danger',
    vip_subscribe: 'warning',
  }
  return typeMap[type] || 'info'
}

const getActivityTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    login: '登录',
    create_party: '创建聚会',
    join_party: '参与聚会',
    create_order: '创建订单',
    payment: '支付',
    refund: '退款',
    vip_subscribe: 'VIP订阅',
  }
  return textMap[type] || type
}

const formatDate = (date?: string) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

const formatAmount = (amount: number) => {
  return (amount / 100).toFixed(2)
}

// 头像加载失败处理
const handleAvatarError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.style.display = 'none'
}

// Lifecycle
onMounted(() => {
  loadUserDetail()
})
</script>

<style scoped lang="scss">
.user-detail {
  padding: 20px;

  .page-title {
    font-size: 18px;
    font-weight: 600;
  }

  .detail-content {
    margin-top: 20px;

    .info-card,
    .stats-card,
    .activities-card {
      margin-bottom: 20px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .user-info {
      display: flex;
      gap: 30px;

      .avatar-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }

      .info-section {
        flex: 1;
      }
    }

    .stat-item {
      text-align: center;
      padding: 20px;
      background-color: var(--el-bg-color-page);
      border-radius: 4px;

      .stat-value {
        font-size: 28px;
        font-weight: 600;
        color: var(--el-color-primary);
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }

    .activity-desc {
      margin-left: 8px;
      color: var(--el-text-color-regular);
    }

    .empty-state {
      padding: 40px 0;
    }

    .actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 20px;
    }
  }
}
</style>
