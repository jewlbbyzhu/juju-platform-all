<template>
  <div class="version-status-manager">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>版本状态管理</span>
          <el-tag :type="statusType">{{ statusText }}</el-tag>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="版本名称">
          {{ version.versionName }}
        </el-descriptions-item>
        <el-descriptions-item label="版本号">
          {{ version.versionCode }}
        </el-descriptions-item>
        <el-descriptions-item label="平台">
          <el-tag :type="platformType">{{ platformText }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="更新类型">
          <el-tag :type="updateTypeTag">{{ updateTypeText }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="下载次数">
          {{ version.downloadCount }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDate(version.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="发布时间" v-if="version.publishedAt">
          {{ formatDate(version.publishedAt) }}
        </el-descriptions-item>
        <el-descriptions-item label="创建人">
          {{ version.createdBy }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="actions">
        <el-button-group>
          <el-button
            v-if="version.status === 'draft'"
            type="success"
            :loading="loading"
            @click="handlePublish"
          >
            <el-icon><Check /></el-icon>
            发布版本
          </el-button>
          
          <el-button
            v-if="version.status === 'published'"
            type="warning"
            :loading="loading"
            @click="handleArchive"
          >
            <el-icon><Box /></el-icon>
            归档版本
          </el-button>
          
          <el-button
            v-if="version.status === 'draft'"
            type="info"
            :loading="loading"
            @click="handleEdit"
          >
            <el-icon><Edit /></el-icon>
            编辑版本
          </el-button>
          
          <el-button
            v-if="version.status === 'draft' || version.status === 'archived'"
            type="danger"
            :loading="loading"
            @click="handleDelete"
          >
            <el-icon><Delete /></el-icon>
            删除版本
          </el-button>
        </el-button-group>
      </div>

      <!-- Status Change Confirmation -->
      <el-alert
        v-if="showConfirmation"
        :title="confirmationTitle"
        :type="confirmationType"
        :closable="false"
        show-icon
        style="margin-top: 16px"
      >
        <template #default>
          <p>{{ confirmationMessage }}</p>
          <div style="margin-top: 12px">
            <el-button size="small" @click="cancelAction">取消</el-button>
            <el-button
              size="small"
              :type="confirmationType"
              :loading="loading"
              @click="confirmAction"
            >
              确认
            </el-button>
          </div>
        </template>
      </el-alert>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Box, Edit, Delete } from '@element-plus/icons-vue'
import type { AppVersion } from '@/types/app'
import { AppAPI } from '@/api'

interface Props {
  version: AppVersion
}

interface Emits {
  (e: 'refresh'): void
  (e: 'edit'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)
const showConfirmation = ref(false)
const confirmationTitle = ref('')
const confirmationMessage = ref('')
const confirmationType = ref<'success' | 'warning' | 'error' | 'info'>('info')
const pendingAction = ref<(() => Promise<void>) | null>(null)

const statusType = computed(() => {
  const typeMap = {
    draft: 'info',
    published: 'success',
    archived: 'warning'
  }
  return typeMap[props.version.status] as 'info' | 'success' | 'warning'
})

const statusText = computed(() => {
  const textMap = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档'
  }
  return textMap[props.version.status]
})

const platformType = computed(() => {
  const typeMap = {
    android: 'success',
    ios: 'primary',
    both: 'warning'
  }
  return typeMap[props.version.platform] as 'success' | 'primary' | 'warning'
})

const platformText = computed(() => {
  const textMap = {
    android: 'Android',
    ios: 'iOS',
    both: '双平台'
  }
  return textMap[props.version.platform]
})

const updateTypeTag = computed(() => {
  const typeMap = {
    force: 'danger',
    recommend: 'warning',
    optional: 'info'
  }
  return typeMap[props.version.updateType] as 'danger' | 'warning' | 'info'
})

const updateTypeText = computed(() => {
  const textMap = {
    force: '强制更新',
    recommend: '推荐更新',
    optional: '可选更新'
  }
  return textMap[props.version.updateType]
})

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handlePublish = () => {
  showConfirmation.value = true
  confirmationTitle.value = '确认发布版本'
  confirmationMessage.value = '发布后，用户将能够下载此版本。确定要发布吗？'
  confirmationType.value = 'success'
  pendingAction.value = async () => {
    try {
      loading.value = true
      await AppAPI.publishVersion(props.version.id)
      ElMessage.success('版本发布成功')
      emit('refresh')
    } catch (error) {
      console.error('Publish version error:', error)
      ElMessage.error('版本发布失败')
    } finally {
      loading.value = false
      showConfirmation.value = false
    }
  }
}

const handleArchive = () => {
  showConfirmation.value = true
  confirmationTitle.value = '确认归档版本'
  confirmationMessage.value = '归档后，此版本将不再对用户可见。确定要归档吗？'
  confirmationType.value = 'warning'
  pendingAction.value = async () => {
    try {
      loading.value = true
      await AppAPI.archiveVersion(props.version.id)
      ElMessage.success('版本归档成功')
      emit('refresh')
    } catch (error) {
      console.error('Archive version error:', error)
      ElMessage.error('版本归档失败')
    } finally {
      loading.value = false
      showConfirmation.value = false
    }
  }
}

const handleEdit = () => {
  emit('edit')
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      '删除后将无法恢复，确定要删除此版本吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    loading.value = true
    await AppAPI.deleteVersion(props.version.id)
    ElMessage.success('版本删除成功')
    emit('refresh')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete version error:', error)
      ElMessage.error('版本删除失败')
    }
  } finally {
    loading.value = false
  }
}

const confirmAction = async () => {
  if (pendingAction.value) {
    await pendingAction.value()
  }
}

const cancelAction = () => {
  showConfirmation.value = false
  pendingAction.value = null
}
</script>

<style scoped lang="scss">
.version-status-manager {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .actions {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}
</style>
