<template>
  <div class="version-upload">
    <el-upload
      ref="uploadRef"
      :action="uploadUrl"
      :headers="uploadHeaders"
      :data="uploadData"
      :file-list="fileList"
      :accept="accept"
      :limit="1"
      :disabled="disabled || uploading"
      :before-upload="handleBeforeUpload"
      :on-progress="handleProgress"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-remove="handleRemove"
      :auto-upload="true"
      drag
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          {{ tipText }}
        </div>
      </template>
    </el-upload>

    <!-- Upload Progress -->
    <div v-if="uploading" class="upload-progress">
      <el-progress :percentage="uploadProgress" :status="uploadStatus" />
      <div class="progress-text">
        正在上传... {{ uploadProgress }}%
      </div>
    </div>

    <!-- File Info -->
    <div v-if="fileInfo" class="file-info">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="文件名">
          {{ fileInfo.fileName }}
        </el-descriptions-item>
        <el-descriptions-item label="文件大小">
          {{ formatFileSize(fileInfo.fileSize) }}
        </el-descriptions-item>
        <el-descriptions-item label="上传时间" :span="2">
          {{ fileInfo.uploadedAt }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadProps, UploadUserFile, UploadInstance } from 'element-plus'
import { useAuthStore } from '@/stores/modules/auth'
import type { AppFileUploadResponse } from '@/types/app'

interface Props {
  platform: 'android' | 'ios'
  disabled?: boolean
  maxSize?: number // MB
}

interface Emits {
  (e: 'success', value: AppFileUploadResponse): void
  (e: 'error', error: Error): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  maxSize: 500 // 500MB default
})

const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const uploadRef = ref<UploadInstance>()

const fileList = ref<UploadUserFile[]>([])
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref<'success' | 'exception' | 'warning' | ''>('')
const fileInfo = ref<AppFileUploadResponse | null>(null)

// Upload configuration
const uploadUrl = computed(() => {
  return `${import.meta.env.VITE_API_BASE_URL}/app/upload`
})

const uploadHeaders = computed(() => {
  return {
    Authorization: `Bearer ${authStore.token}`
  }
})

const uploadData = computed(() => {
  return {
    platform: props.platform
  }
})

const accept = computed(() => {
  return props.platform === 'android' ? '.apk' : '.ipa'
})

const tipText = computed(() => {
  const ext = props.platform === 'android' ? 'APK' : 'IPA'
  return `支持${ext}格式，单个文件不超过${props.maxSize}MB`
})

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handleBeforeUpload: UploadProps['beforeUpload'] = (file) => {
  // Check file extension
  const ext = file.name.split('.').pop()?.toLowerCase()
  const expectedExt = props.platform === 'android' ? 'apk' : 'ipa'
  
  if (ext !== expectedExt) {
    ElMessage.error(`只能上传${expectedExt.toUpperCase()}文件`)
    return false
  }

  // Check file size
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize
  if (!isLtMaxSize) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB`)
    return false
  }

  uploading.value = true
  uploadProgress.value = 0
  uploadStatus.value = ''
  fileInfo.value = null

  return true
}

const handleProgress: UploadProps['onProgress'] = (event) => {
  uploadProgress.value = Math.round(event.percent || 0)
}

const handleSuccess: UploadProps['onSuccess'] = (response) => {
  uploading.value = false
  
  if (response.success) {
    uploadProgress.value = 100
    uploadStatus.value = 'success'
    fileInfo.value = response.data
    
    emit('success', response.data)
    ElMessage.success('上传成功')
  } else {
    uploadStatus.value = 'exception'
    ElMessage.error(response.message || '上传失败')
    emit('error', new Error(response.message || '上传失败'))
  }
}

const handleError: UploadProps['onError'] = (error) => {
  uploading.value = false
  uploadProgress.value = 0
  uploadStatus.value = 'exception'
  
  console.error('Upload error:', error)
  ElMessage.error('上传失败，请重试')
  emit('error', error as Error)
}

const handleRemove: UploadProps['onRemove'] = () => {
  fileInfo.value = null
  uploadProgress.value = 0
  uploadStatus.value = ''
}

// Expose methods
defineExpose({
  clearFiles: () => {
    uploadRef.value?.clearFiles()
    fileInfo.value = null
    uploadProgress.value = 0
    uploadStatus.value = ''
  }
})
</script>

<style scoped lang="scss">
.version-upload {
  :deep(.el-upload-dragger) {
    padding: 40px;
  }

  .el-icon--upload {
    font-size: 67px;
    color: #c0c4cc;
    margin-bottom: 16px;
  }

  .el-upload__text {
    color: #606266;
    font-size: 14px;
    
    em {
      color: #409eff;
      font-style: normal;
    }
  }

  .el-upload__tip {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
  }

  .upload-progress {
    margin-top: 20px;
    
    .progress-text {
      margin-top: 8px;
      text-align: center;
      font-size: 14px;
      color: #606266;
    }
  }

  .file-info {
    margin-top: 20px;
  }
}
</style>
