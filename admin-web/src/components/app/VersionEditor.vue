<template>
  <el-form
    ref="formRef"
    :model="formData"
    :rules="rules"
    label-width="120px"
    :disabled="disabled"
  >
    <el-form-item label="版本名称" prop="versionName">
      <el-input
        v-model="formData.versionName"
        placeholder="例如: 1.0.0"
        clearable
      >
        <template #append>
          <el-button @click="autoIncrementVersion">自动递增</el-button>
        </template>
      </el-input>
      <div class="form-tip">请使用语义化版本号格式: 主版本号.次版本号.修订号</div>
    </el-form-item>

    <el-form-item label="版本号" prop="versionCode">
      <el-input-number
        v-model="formData.versionCode"
        :min="1"
        :max="999999"
        :step="1"
        controls-position="right"
        style="width: 100%"
      />
      <div class="form-tip">版本号必须递增，用于版本比较</div>
    </el-form-item>

    <el-form-item label="平台" prop="platform">
      <el-radio-group v-model="formData.platform">
        <el-radio value="android">Android</el-radio>
        <el-radio value="ios">iOS</el-radio>
        <el-radio value="both">双平台</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="更新类型" prop="updateType">
      <el-radio-group v-model="formData.updateType">
        <el-radio value="force">强制更新</el-radio>
        <el-radio value="recommend">推荐更新</el-radio>
        <el-radio value="optional">可选更新</el-radio>
      </el-radio-group>
      <div class="form-tip">
        强制更新: 用户必须更新才能使用<br>
        推荐更新: 提示用户更新，可跳过<br>
        可选更新: 用户可自行选择是否更新
      </div>
    </el-form-item>

    <el-form-item label="最低支持版本" prop="minSupportVersion">
      <el-input
        v-model="formData.minSupportVersion"
        placeholder="例如: 0.9.0 (可选)"
        clearable
      />
      <div class="form-tip">低于此版本的用户将被强制更新</div>
    </el-form-item>

    <el-form-item label="更新说明" prop="updateContent">
      <el-input
        v-model="formData.updateContent"
        type="textarea"
        :rows="6"
        placeholder="请输入更新说明，支持换行"
        maxlength="1000"
        show-word-limit
      />
      <div class="form-tip">详细描述本次更新的内容，每行一个更新点</div>
    </el-form-item>

    <el-form-item label="文件信息" v-if="formData.fileUrl">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="文件名">
          {{ formData.fileName }}
        </el-descriptions-item>
        <el-descriptions-item label="文件大小">
          {{ formatFileSize(formData.fileSize || 0) }}
        </el-descriptions-item>
        <el-descriptions-item label="文件地址">
          <el-link :href="formData.fileUrl" target="_blank" type="primary">
            {{ formData.fileUrl }}
          </el-link>
        </el-descriptions-item>
      </el-descriptions>
    </el-form-item>

    <el-form-item label="状态" prop="status" v-if="mode === 'edit'">
      <el-radio-group v-model="formData.status">
        <el-radio value="draft">草稿</el-radio>
        <el-radio value="published">已发布</el-radio>
        <el-radio value="archived">已归档</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { AppVersion, AppVersionRequest } from '@/types/app'

interface Props {
  modelValue: Partial<AppVersionRequest>
  mode?: 'create' | 'edit'
  disabled?: boolean
  latestVersion?: AppVersion | null
}

interface Emits {
  (e: 'update:modelValue', value: Partial<AppVersionRequest>): void
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  disabled: false
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const formData = reactive<Partial<AppVersionRequest>>({
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

// Validation rules
const rules: FormRules = {
  versionName: [
    { required: true, message: '请输入版本名称', trigger: 'blur' },
    {
      pattern: /^\d+\.\d+\.\d+$/,
      message: '版本名称格式不正确，应为: X.Y.Z',
      trigger: 'blur'
    }
  ],
  versionCode: [
    { required: true, message: '请输入版本号', trigger: 'blur' },
    { type: 'number', min: 1, message: '版本号必须大于0', trigger: 'blur' }
  ],
  platform: [
    { required: true, message: '请选择平台', trigger: 'change' }
  ],
  updateType: [
    { required: true, message: '请选择更新类型', trigger: 'change' }
  ],
  updateContent: [
    { required: true, message: '请输入更新说明', trigger: 'blur' },
    { min: 10, message: '更新说明至少10个字符', trigger: 'blur' }
  ],
  minSupportVersion: [
    {
      pattern: /^(\d+\.\d+\.\d+)?$/,
      message: '最低支持版本格式不正确，应为: X.Y.Z',
      trigger: 'blur'
    }
  ]
}

// Watch modelValue changes
watch(() => props.modelValue, (newValue) => {
  Object.assign(formData, newValue)
}, { immediate: true, deep: true })

// Watch formData changes
watch(formData, (newValue) => {
  emit('update:modelValue', { ...newValue })
}, { deep: true })

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const autoIncrementVersion = () => {
  if (!props.latestVersion) {
    ElMessage.warning('没有找到最新版本，请手动输入')
    return
  }

  const latest = props.latestVersion.versionName
  const parts = latest.split('.').map(Number)
  
  // Increment patch version
  parts[2]++
  
  formData.versionName = parts.join('.')
  formData.versionCode = props.latestVersion.versionCode + 1
  
  ElMessage.success('版本号已自动递增')
}

const validate = async (): Promise<boolean> => {
  if (!formRef.value) return false
  
  try {
    await formRef.value.validate()
    return true
  } catch {
    return false
  }
}

const resetFields = () => {
  formRef.value?.resetFields()
}

// Expose methods
defineExpose({
  validate,
  resetFields
})
</script>

<style scoped lang="scss">
.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}
</style>
