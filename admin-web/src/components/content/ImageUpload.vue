<template>
  <div class="image-upload">
    <el-upload
      :action="uploadUrl"
      :headers="uploadHeaders"
      :data="uploadData"
      :file-list="fileList"
      :list-type="listType"
      :accept="accept"
      :limit="limit"
      :multiple="multiple"
      :disabled="disabled"
      :before-upload="handleBeforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-remove="handleRemove"
      :on-exceed="handleExceed"
      :on-preview="handlePreview"
    >
      <template v-if="listType === 'picture-card'">
        <el-icon><Plus /></el-icon>
      </template>
      <template v-else>
        <el-button type="primary" :disabled="disabled">
          <el-icon class="el-icon--left"><Upload /></el-icon>
          {{ buttonText }}
        </el-button>
      </template>
      <template #tip>
        <div class="el-upload__tip">
          {{ tipText }}
        </div>
      </template>
    </el-upload>

    <!-- Image Preview Dialog -->
    <el-dialog v-model="previewVisible" title="图片预览" width="800px">
      <img :src="previewUrl" alt="Preview" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'
import type { UploadProps, UploadUserFile, UploadFile } from 'element-plus'
import { useAuthStore } from '@/stores/modules/auth'

interface Props {
  modelValue: string | string[]
  uploadType?: 'banner' | 'announcement' | 'other'
  listType?: 'text' | 'picture' | 'picture-card'
  accept?: string
  limit?: number
  maxSize?: number // MB
  multiple?: boolean
  disabled?: boolean
  buttonText?: string
  tipText?: string
}

interface Emits {
  (e: 'update:modelValue', value: string | string[]): void
  (e: 'change', value: string | string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  uploadType: 'other',
  listType: 'picture-card',
  accept: 'image/jpeg,image/png,image/jpg,image/gif',
  limit: 5,
  maxSize: 5,
  multiple: false,
  disabled: false,
  buttonText: '上传图片',
  tipText: '支持jpg/png/gif格式，单个文件不超过5MB'
})

const emit = defineEmits<Emits>()

const authStore = useAuthStore()

const fileList = ref<UploadUserFile[]>([])
const previewVisible = ref(false)
const previewUrl = ref('')

// Upload configuration
const uploadUrl = computed(() => {
  return `${import.meta.env.VITE_API_BASE_URL}/content/upload`
})

const uploadHeaders = computed(() => {
  return {
    Authorization: `Bearer ${authStore.token}`
  }
})

const uploadData = computed(() => {
  return {
    type: props.uploadType
  }
})

// Initialize file list from modelValue
watch(() => props.modelValue, (newValue) => {
  if (Array.isArray(newValue)) {
    fileList.value = newValue.map((url, index) => ({
      name: `image-${index}`,
      url
    }))
  } else if (newValue) {
    fileList.value = [{
      name: 'image',
      url: newValue
    }]
  } else {
    fileList.value = []
  }
}, { immediate: true })

const handleBeforeUpload: UploadProps['beforeUpload'] = (file) => {
  // Check file type
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }

  // Check file size
  const isLtMaxSize = file.size / 1024 / 1024 < props.maxSize
  if (!isLtMaxSize) {
    ElMessage.error(`图片大小不能超过 ${props.maxSize}MB`)
    return false
  }

  return true
}

const handleSuccess: UploadProps['onSuccess'] = (response, file) => {
  if (response.success) {
    const url = response.data.url
    
    if (props.multiple) {
      const urls = fileList.value.map(f => f.url).filter(Boolean) as string[]
      urls.push(url)
      emit('update:modelValue', urls)
      emit('change', urls)
    } else {
      emit('update:modelValue', url)
      emit('change', url)
    }

    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

const handleError: UploadProps['onError'] = (error) => {
  console.error('Upload error:', error)
  ElMessage.error('上传失败，请重试')
}

const handleRemove: UploadProps['onRemove'] = (file) => {
  if (props.multiple) {
    const urls = fileList.value
      .filter(f => f.uid !== file.uid)
      .map(f => f.url)
      .filter(Boolean) as string[]
    emit('update:modelValue', urls)
    emit('change', urls)
  } else {
    emit('update:modelValue', '')
    emit('change', '')
  }
}

const handleExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning(`最多只能上传 ${props.limit} 个文件`)
}

const handlePreview: UploadProps['onPreview'] = (file) => {
  previewUrl.value = file.url || ''
  previewVisible.value = true
}
</script>

<style scoped lang="scss">
.image-upload {
  :deep(.el-upload-list--picture-card) {
    .el-upload-list__item {
      width: 148px;
      height: 148px;
    }
  }

  :deep(.el-upload--picture-card) {
    width: 148px;
    height: 148px;
    line-height: 148px;
  }

  .el-upload__tip {
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
  }
}
</style>
