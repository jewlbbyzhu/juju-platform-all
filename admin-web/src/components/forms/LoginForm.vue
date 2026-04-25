<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="formRules"
    @submit.prevent="handleSubmit"
    :size="size"
    :label-position="labelPosition"
  >
    <!-- Error Alert -->
    <el-alert
      v-if="errorMessage"
      :title="errorMessage"
      type="error"
      :closable="false"
      class="form-error"
    />
    
    <el-form-item prop="username" :label="showLabels ? '用户名' : ''">
      <el-input
        v-model="form.username"
        :placeholder="placeholders.username"
        :prefix-icon="User"
        :disabled="loading"
        clearable
      />
    </el-form-item>
    
    <el-form-item prop="password" :label="showLabels ? '密码' : ''">
      <el-input
        v-model="form.password"
        type="password"
        :placeholder="placeholders.password"
        :prefix-icon="Lock"
        :disabled="loading"
        show-password
        @keyup.enter="handleSubmit"
      />
    </el-form-item>
    
    <!-- Captcha (show when needed) -->
    <el-form-item v-if="showCaptcha" prop="captcha" :label="showLabels ? '验证码' : ''">
      <div class="captcha-container">
        <el-input
          v-model="form.captcha"
          :placeholder="placeholders.captcha"
          :disabled="loading"
          class="captcha-input"
        />
        <div class="captcha-image" @click="$emit('refresh-captcha')">
          <img v-if="captchaImage" :src="captchaImage" alt="验证码" />
          <el-button v-else :loading="captchaLoading" size="small">
            获取验证码
          </el-button>
        </div>
      </div>
    </el-form-item>
    
    <el-form-item v-if="showRemember">
      <div class="form-options">
        <el-checkbox v-model="form.remember" :disabled="loading">
          记住我
        </el-checkbox>
        <slot name="extra-options" />
      </div>
    </el-form-item>
    
    <el-form-item>
      <el-button
        type="primary"
        :loading="loading"
        :disabled="!canSubmit"
        @click="handleSubmit"
        class="submit-button"
      >
        {{ loading ? loadingText : submitText }}
      </el-button>
    </el-form-item>
    
    <slot name="footer" />
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { LoginRequest } from '@/types/auth'

interface Props {
  loading?: boolean
  showCaptcha?: boolean
  captchaImage?: string
  captchaLoading?: boolean
  errorMessage?: string
  showLabels?: boolean
  showRemember?: boolean
  size?: 'large' | 'default' | 'small'
  labelPosition?: 'left' | 'right' | 'top'
  submitText?: string
  loadingText?: string
  placeholders?: {
    username: string
    password: string
    captcha: string
  }
}

interface Emits {
  (e: 'submit', form: LoginRequest): void
  (e: 'refresh-captcha'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showCaptcha: false,
  captchaImage: '',
  captchaLoading: false,
  errorMessage: '',
  showLabels: false,
  showRemember: true,
  size: 'large',
  labelPosition: 'top',
  submitText: '登录',
  loadingText: '登录中...',
  placeholders: () => ({
    username: '请输入用户名',
    password: '请输入密码',
    captcha: '请输入验证码'
  })
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()

const form = reactive<LoginRequest>({
  username: '',
  password: '',
  captcha: '',
  remember: false,
})

// Computed properties
const canSubmit = computed(() => {
  return form.username && 
         form.password && 
         (!props.showCaptcha || form.captcha) &&
         !props.loading
})

// Form validation rules
const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    { 
      pattern: /^[a-zA-Z0-9_]+$/, 
      message: '用户名只能包含字母、数字和下划线', 
      trigger: 'blur' 
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  captcha: [
    { 
      required: props.showCaptcha, 
      message: '请输入验证码', 
      trigger: 'blur' 
    },
    { 
      min: 4, 
      max: 6, 
      message: '验证码长度不正确', 
      trigger: 'blur' 
    },
  ],
}

// Methods
const handleSubmit = async () => {
  if (!formRef.value || !canSubmit.value) return
  
  try {
    await formRef.value.validate()
    emit('submit', { ...form })
  } catch (error) {
    console.error('Form validation failed:', error)
  }
}

// Clear captcha when error occurs
watch(() => props.errorMessage, (error) => {
  if (error && props.showCaptcha) {
    form.captcha = ''
  }
})

// Expose form methods
defineExpose({
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields(),
  clearValidate: () => formRef.value?.clearValidate(),
  form,
})
</script>

<style scoped>
.form-error {
  margin-bottom: 20px;
}

.captcha-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  width: 120px;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.captcha-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.submit-button {
  width: 100%;
}

/* Responsive design */
@media (max-width: 480px) {
  .captcha-container {
    flex-direction: column;
    gap: 8px;
  }
  
  .captcha-image {
    width: 100%;
  }
}
</style>