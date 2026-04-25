<template>
  <div class="app-management">
    <el-card shadow="never" class="header-card">
      <el-page-header @back="handleBack" title="返回">
        <template #content>
          <span class="page-title">App版本管理</span>
        </template>
      </el-page-header>
    </el-card>

    <!-- Statistics Cards -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="总版本数" :value="Number(stats.totalVersions) || 0">
            <template #prefix>
              <el-icon><Document /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="已发布版本" :value="Number(stats.publishedVersions) || 0">
            <template #prefix>
              <el-icon><Check /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="总下载量" :value="Number(stats.totalDownloads) || 0">
            <template #prefix>
              <el-icon><Download /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="待处理反馈" :value="Number(pendingFeedbackCount) || 0">
            <template #prefix>
              <el-icon><ChatDotRound /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- Tabs -->
    <el-card shadow="never" class="content-card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="版本列表" name="versions">
          <version-list
            ref="versionListRef"
            @create="handleCreateVersion"
            @edit="handleEditVersion"
          />
        </el-tab-pane>
        <el-tab-pane label="用户反馈" name="feedback">
          <feedback-list ref="feedbackListRef" />
        </el-tab-pane>
        <el-tab-pane label="下载统计" name="statistics">
          <download-statistics ref="statisticsRef" />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- Create/Edit Version Dialog -->
    <el-dialog
      v-model="versionDialogVisible"
      :title="versionDialogTitle"
      width="800px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step title="上传文件" />
        <el-step title="填写信息" />
        <el-step title="确认发布" />
      </el-steps>

      <div class="dialog-content">
        <!-- Step 1: Upload File -->
        <div v-show="currentStep === 0" class="step-content">
          <version-upload
            ref="uploadRef"
            :platform="(versionForm.platform as 'android' | 'ios')"
            @success="handleUploadSuccess"
          />
        </div>

        <!-- Step 2: Fill Information -->
        <div v-show="currentStep === 1" class="step-content">
          <version-editor
            ref="editorRef"
            v-model="versionForm"
            :mode="versionDialogMode"
            :latest-version="latestVersion"
          />
        </div>

        <!-- Step 3: Confirm -->
        <div v-show="currentStep === 2" class="step-content">
          <el-result icon="success" title="版本信息已完成">
            <template #sub-title>
              <p>请确认以下信息无误后提交</p>
            </template>
            <template #extra>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="版本名称">
                  {{ versionForm.versionName }}
                </el-descriptions-item>
                <el-descriptions-item label="版本号">
                  {{ versionForm.versionCode }}
                </el-descriptions-item>
                <el-descriptions-item label="平台">
                  {{ platformText }}
                </el-descriptions-item>
                <el-descriptions-item label="更新类型">
                  {{ updateTypeText }}
                </el-descriptions-item>
                <el-descriptions-item label="文件名" :span="2">
                  {{ versionForm.fileName }}
                </el-descriptions-item>
                <el-descriptions-item label="更新说明" :span="2">
                  <div style="white-space: pre-wrap">{{ versionForm.updateContent }}</div>
                </el-descriptions-item>
              </el-descriptions>
            </template>
          </el-result>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="versionDialogVisible = false">取消</el-button>
          <el-button v-if="currentStep > 0" @click="handlePrevStep">上一步</el-button>
          <el-button
            v-if="currentStep < 2"
            type="primary"
            @click="handleNextStep"
            :disabled="!canProceed"
          >
            下一步
          </el-button>
          <el-button
            v-if="currentStep === 2"
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
          >
            {{ versionDialogMode === 'create' ? '创建版本' : '更新版本' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Document,
  Check,
  Download,
  ChatDotRound
} from '@element-plus/icons-vue'
import VersionList from './components/VersionList.vue'
import FeedbackList from './components/FeedbackList.vue'
import DownloadStatistics from './components/DownloadStatistics.vue'
import VersionUpload from '@/components/app/VersionUpload.vue'
import VersionEditor from '@/components/app/VersionEditor.vue'
import { AppAPI } from '@/api'
import type {
  AppVersion,
  AppVersionRequest,
  AppVersionStats,
  AppFileUploadResponse
} from '@/types/app'

const router = useRouter()

const activeTab = ref('versions')
const versionDialogVisible = ref(false)
const versionDialogMode = ref<'create' | 'edit'>('create')
const currentStep = ref(0)
const submitting = ref(false)

const versionListRef = ref()
const feedbackListRef = ref()
const statisticsRef = ref()
const uploadRef = ref()
const editorRef = ref()

const stats = reactive<AppVersionStats>({
  totalVersions: 0,
  publishedVersions: 0,
  totalDownloads: 0,
  latestVersion: {},
  downloadTrend: [],
  platformDistribution: []
})

const pendingFeedbackCount = ref(0)
const latestVersion = ref<AppVersion | null>(null)

const versionForm = reactive<Partial<AppVersionRequest>>({
  versionName: '',
  versionCode: 1,
  platform: 'android',
  fileUrl: '',
  fileSize: 0,
  fileName: '',
  updateType: 'optional',
  updateContent: '',
  minSupportVersion: '',
  status: 'draft'
})

const versionDialogTitle = computed(() => {
  return versionDialogMode.value === 'create' ? '创建新版本' : '编辑版本'
})

const platformText = computed(() => {
  const textMap = {
    android: 'Android',
    ios: 'iOS',
    both: '双平台'
  }
  return textMap[versionForm.platform as 'android' | 'ios' | 'both']
})

const updateTypeText = computed(() => {
  const textMap = {
    force: '强制更新',
    recommend: '推荐更新',
    optional: '可选更新'
  }
  return textMap[versionForm.updateType as 'force' | 'recommend' | 'optional']
})

const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return !!versionForm.fileUrl
  }
  if (currentStep.value === 1) {
    return !!versionForm.versionName && !!versionForm.updateContent
  }
  return true
})

const handleBack = () => {
  router.back()
}

const handleTabChange = (tabName: string) => {
  if (tabName === 'versions') {
    versionListRef.value?.refresh()
  } else if (tabName === 'feedback') {
    feedbackListRef.value?.refresh()
  } else if (tabName === 'statistics') {
    statisticsRef.value?.refresh()
  }
}

const handleCreateVersion = () => {
  versionDialogMode.value = 'create'
  currentStep.value = 0
  resetForm()
  versionDialogVisible.value = true
  loadLatestVersion()
}

const handleEditVersion = (version: AppVersion) => {
  versionDialogMode.value = 'edit'
  currentStep.value = 1 // Skip upload step for editing
  Object.assign(versionForm, version)
  versionDialogVisible.value = true
}

const handleUploadSuccess = (response: AppFileUploadResponse) => {
  versionForm.fileUrl = response.url
  versionForm.fileName = response.fileName
  versionForm.fileSize = response.fileSize
  ElMessage.success('文件上传成功')
}

const handleNextStep = async () => {
  if (currentStep.value === 1) {
    const valid = await editorRef.value?.validate()
    if (!valid) {
      ElMessage.warning('请完善版本信息')
      return
    }
  }
  
  currentStep.value++
}

const handlePrevStep = () => {
  currentStep.value--
}

const handleSubmit = async () => {
  try {
    submitting.value = true
    
    if (versionDialogMode.value === 'create') {
      await AppAPI.createVersion(versionForm as AppVersionRequest)
      ElMessage.success('版本创建成功')
    } else {
      await AppAPI.updateVersion(
        (versionForm as AppVersion).id,
        versionForm as AppVersionRequest
      )
      ElMessage.success('版本更新成功')
    }
    
    versionDialogVisible.value = false
    versionListRef.value?.refresh()
    loadStats()
  } catch (error) {
    console.error('Submit version error:', error)
    ElMessage.error('操作失败，请重试')
  } finally {
    submitting.value = false
  }
}

const handleDialogClose = () => {
  resetForm()
  currentStep.value = 0
  uploadRef.value?.clearFiles()
}

const resetForm = () => {
  Object.assign(versionForm, {
    versionName: '',
    versionCode: 1,
    platform: 'android',
    fileUrl: '',
    fileSize: 0,
    fileName: '',
    updateType: 'optional',
    updateContent: '',
    minSupportVersion: '',
    status: 'draft'
  })
}

const loadStats = async () => {
  try {
    const data = await AppAPI.getVersionStats()
    Object.assign(stats, data)
  } catch (error) {
    console.error('Load stats error:', error)
  }
}

const loadLatestVersion = async () => {
  try {
    const version = await AppAPI.getLatestVersion(versionForm.platform as 'android' | 'ios')
    latestVersion.value = version
  } catch (error) {
    console.error('Load latest version error:', error)
  }
}

const loadPendingFeedbackCount = async () => {
  try {
    const response = await AppAPI.getFeedbackList({
      page: 1,
      pageSize: 1,
      status: 'pending'
    })
    pendingFeedbackCount.value = response.total
  } catch (error) {
    console.error('Load pending feedback count error:', error)
  }
}

onMounted(() => {
  loadStats()
  loadPendingFeedbackCount()
})
</script>

<style scoped lang="scss">
.app-management {
  .header-card {
    margin-bottom: 20px;
  }

  .page-title {
    font-size: 18px;
    font-weight: 500;
  }

  .stats-row {
    margin-bottom: 20px;
  }

  .content-card {
    min-height: 600px;
  }

  .dialog-content {
    margin: 30px 0;
    min-height: 400px;

    .step-content {
      padding: 20px;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}
</style>
