<template>
  <el-card class="party-detail-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span class="title">聚会详情</span>
        <el-tag v-if="party.organizer?.is_vip" type="warning" effect="dark">
          VIP {{ vipTypeLabel }}
        </el-tag>
      </div>
    </template>

    <div class="party-content">
      <!-- 基本信息 -->
      <div class="info-section">
        <h3 class="section-title">基本信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="聚会标题">
            {{ party.title }}
          </el-descriptions-item>
          <el-descriptions-item label="聚会分类">
            <el-tag :type="categoryTagType">{{ categoryLabel }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="聚会状态">
            <el-tag :type="statusTagType">{{ statusLabel }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(party.created_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">
            {{ formatDateTime(party.start_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="结束时间">
            {{ party.end_time ? formatDateTime(party.end_time) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="报名截止">
            {{ party.registration_deadline ? formatDateTime(party.registration_deadline) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="参与人数">
            {{ party.current_participants }} / {{ party.max_participants }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 聚会描述 -->
      <div class="info-section">
        <h3 class="section-title">聚会描述</h3>
        <div class="description">{{ party.description }}</div>
      </div>

      <!-- 封面图 -->
      <div class="info-section" v-if="party.cover_image">
        <h3 class="section-title">聚会封面</h3>
        <div class="cover-image-wrapper">
          <el-image
            :src="party.cover_image"
            fit="cover"
            class="cover-image"
            @error="handleImageError"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
                <span>图片加载失败</span>
              </div>
            </template>
          </el-image>
        </div>
      </div>

      <!-- 聚会图片 -->
      <div class="info-section" v-if="party.images && party.images.length > 0">
        <h3 class="section-title">聚会图片</h3>
        <div class="images-grid">
          <el-image
            v-for="(image, index) in party.images"
            :key="index"
            :src="image"
            :preview-src-list="party.images"
            :initial-index="index"
            fit="cover"
            class="party-image"
            @error="handleImageError"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </div>
      </div>

      <!-- 地点信息 -->
      <div class="info-section">
        <h3 class="section-title">地点信息</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="地址">
            {{ party.location?.address || party.address || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="坐标">
            {{ party.latitude }}, {{ party.longitude }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 参与限制 -->
      <div class="info-section">
        <h3 class="section-title">参与限制</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="性别限制">
            {{ genderRestrictionLabel }}
          </el-descriptions-item>
          <el-descriptions-item label="年龄限制">
            {{ ageRestrictionLabel }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 票种信息 -->
      <div class="info-section">
        <h3 class="section-title">票种信息</h3>
        <el-table :data="party.ticket_types" border stripe>
          <el-table-column prop="name" label="票种名称" />
          <el-table-column label="价格">
            <template #default="{ row }">
              ¥{{ (row.price / 100).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="数量">
            <template #default="{ row }">
              {{ row.sold }} / {{ row.quantity }}
            </template>
          </el-table-column>
          <el-table-column label="截止时间">
            <template #default="{ row }">
              {{ row.deadline ? formatDateTime(row.deadline) : '-' }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 组织者信息 -->
      <div class="info-section" v-if="party.organizer">
        <h3 class="section-title">组织者信息</h3>
        <div class="organizer-info">
          <el-avatar :src="party.organizer.avatar" :size="60" />
          <div class="organizer-details">
            <div class="organizer-name">
              {{ party.organizer.nickname }}
              <el-tag v-if="party.organizer.is_vip" type="warning" size="small">
                VIP
              </el-tag>
            </div>
            <div class="organizer-id">ID: {{ party.organizer.id }}</div>
          </div>
        </div>
      </div>

      <!-- 审核信息 -->
      <div class="info-section" v-if="party.audit_info">
        <h3 class="section-title">审核信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="审核状态">
            <el-tag :type="auditStatusTagType">{{ auditStatusLabel }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="审核人">
            {{ party.audit_info.reviewer || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="审核时间">
            {{ party.audit_info.reviewedAt ? formatDateTime(party.audit_info.reviewedAt) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="审核意见">
            {{ party.audit_info.reason || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 标签 -->
      <div class="info-section" v-if="party.tags && party.tags.length > 0">
        <h3 class="section-title">标签</h3>
        <el-tag
          v-for="tag in party.tags"
          :key="tag"
          class="tag-item"
          type="info"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Picture } from '@element-plus/icons-vue'
import type { PartyDetail } from '@/types/party'
import { PartyStatus, PartyCategory, GenderRestriction, AuditStatus, VipType } from '@/types/party'
import { formatDateTime } from '@/utils/format'

interface Props {
  party: PartyDetail
}

const props = defineProps<Props>()

// 分类标签
const categoryLabel = computed(() => {
  const labels = {
    [PartyCategory.NEON]: '霓虹',
    [PartyCategory.COOL]: '潮酷',
    [PartyCategory.PREMIUM]: '高级',
    [PartyCategory.FUTURE]: '未来'
  }
  return labels[props.party.category] || '未知'
})

const categoryTagType = computed(() => {
  const types = {
    [PartyCategory.NEON]: 'danger',
    [PartyCategory.COOL]: 'info',
    [PartyCategory.PREMIUM]: 'warning',
    [PartyCategory.FUTURE]: 'success'
  }
  return types[props.party.category] || 'info'
})

// 状态标签 - 使用新的 PartyStatus 枚举
const statusLabel = computed(() => {
  const labels: Record<number, string> = {
    [PartyStatus.DRAFT]: '草稿',
    [PartyStatus.PUBLISHED]: '已发布',
    [PartyStatus.ENDED]: '已结束',
    [PartyStatus.CANCELLED]: '已取消'
  }
  return labels[props.party.status] || '未知'
})

const statusTagType = computed(() => {
  const types: Record<number, string> = {
    [PartyStatus.DRAFT]: 'info',
    [PartyStatus.PUBLISHED]: 'success',
    [PartyStatus.ENDED]: 'success',
    [PartyStatus.CANCELLED]: 'info'
  }
  return types[props.party.status] || 'info'
})

// 审核状态标签
const auditStatusLabel = computed(() => {
  if (!props.party.audit_info) return '-'
  const labels = {
    [AuditStatus.PENDING]: '待审核',
    [AuditStatus.APPROVED]: '已通过',
    [AuditStatus.REJECTED]: '已拒绝'
  }
  return labels[props.party.audit_info.status] || '未知'
})

const auditStatusTagType = computed(() => {
  if (!props.party.audit_info) return 'info'
  const types = {
    [AuditStatus.PENDING]: 'warning',
    [AuditStatus.APPROVED]: 'success',
    [AuditStatus.REJECTED]: 'danger'
  }
  return types[props.party.audit_info.status] || 'info'
})

// VIP类型标签
const vipTypeLabel = computed(() => {
  if (!props.party.organizer?.vip_type) return ''
  const labels = {
    [VipType.MONTHLY]: '月卡',
    [VipType.QUARTERLY]: '季卡',
    [VipType.YEARLY]: '年卡'
  }
  return labels[props.party.organizer.vip_type] || ''
})

// 性别限制标签
const genderRestrictionLabel = computed(() => {
  const labels = {
    [GenderRestriction.NONE]: '无限制',
    [GenderRestriction.MALE_ONLY]: '仅限男性',
    [GenderRestriction.FEMALE_ONLY]: '仅限女性'
  }
  return labels[props.party.gender_restriction] || '无限制'
})

// 年龄限制标签
const ageRestrictionLabel = computed(() => {
  const restriction = props.party.age_restriction
  if (!restriction) return '无限制'
  if (restriction.min && restriction.max) {
    return `${restriction.min} - ${restriction.max} 岁`
  }
  if (restriction.min) {
    return `${restriction.min} 岁以上`
  }
  if (restriction.max) {
    return `${restriction.max} 岁以下`
  }
  return '无限制'
})

// 图片加载失败处理
const handleImageError = () => {
  console.warn('图片加载失败')
}
</script>

<style scoped lang="scss">
.party-detail-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .party-content {
    .info-section {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      .section-title {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 12px;
        padding-left: 8px;
        border-left: 3px solid var(--el-color-primary);
      }

      .description {
        line-height: 1.6;
        color: var(--el-text-color-regular);
        white-space: pre-wrap;
      }

      .cover-image-wrapper {
        width: 100%;
        max-width: 400px;

        .cover-image {
          width: 100%;
          height: 225px;
          border-radius: 8px;
        }
      }

      .images-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;

        .party-image {
          width: 100%;
          height: 150px;
          border-radius: 4px;
          cursor: pointer;
        }
      }

      .image-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        background-color: var(--el-fill-color-light);
        color: var(--el-text-color-secondary);
        font-size: 12px;

        .el-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }
      }

      .organizer-info {
        display: flex;
        align-items: center;
        gap: 16px;

        .organizer-details {
          .organizer-name {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .organizer-id {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }
      }

      .tag-item {
        margin-right: 8px;
        margin-bottom: 8px;
      }
    }
  }
}
</style>
