<template>
  <div class="login-container">
    <div class="login-form">
      <div class="login-header">
        <h2>聚聚管理后台</h2>
        <p>欢迎登录管理系统</p>
      </div>
      
      <!-- Error Alert -->
      <el-alert
        v-if="errorMessage"
        :title="errorMessage"
        type="error"
        :closable="false"
        class="login-error"
      />
      
      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        @submit.prevent="handleLogin"
        size="large"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            :disabled="loading"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            :disabled="loading"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <!-- Captcha (show when needed) -->
        <el-form-item v-if="showCaptcha" prop="captcha">
          <div class="captcha-container">
            <el-input
              v-model="loginForm.captcha"
              placeholder="请输入验证码"
              :disabled="loading"
              class="captcha-input"
            />
            <div class="captcha-image" @click="refreshCaptcha">
              <img v-if="captchaImage" :src="captchaImage" alt="验证码" />
              <el-button v-else :loading="captchaLoading" @click="getCaptcha">
                获取验证码
              </el-button>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="loginForm.remember" :disabled="loading">
              记住我
            </el-checkbox>
            <el-link type="primary" :underline="false" @click="handleForgotPassword">
              忘记密码？
            </el-link>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            :loading="loading"
            :disabled="!canSubmit"
            class="login-button"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- Login attempts warning -->
      <div v-if="loginAttempts > 0" class="login-attempts">
        <el-text type="warning" size="small">
          登录失败 {{ loginAttempts }} 次，{{ maxAttempts - loginAttempts }} 次后将显示验证码
        </el-text>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuth } from '@/composables/useAuth'
import { authAPI } from '@/api/modules/auth'
import type { FormInstance, FormRules } from 'element-plus'
import type { LoginRequest } from '@/types/auth'

const router = useRouter()
const route = useRoute()
const { login, isLoading, lastError } = useAuth()

const formRef = ref<FormInstance>()
const loading = ref(false)
const loginAttempts = ref(0)
const maxAttempts = 3
const showCaptcha = ref(false)
const captchaImage = ref('')
const captchaKey = ref('')
const captchaLoading = ref(false)

const loginForm = reactive<LoginRequest>({
  username: '',
  password: '',
  captcha: '',
  remember: false,
})

const errorMessage = ref('')

// Computed properties
const canSubmit = computed(() => {
  return loginForm.username && 
         loginForm.password && 
         (!showCaptcha.value || loginForm.captcha) &&
         !loading.value
})

// Form validation rules
const rules: FormRules = {
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
      required: showCaptcha.value, 
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

// Watch for login attempts to show captcha
watch(loginAttempts, (attempts) => {
  if (attempts >= maxAttempts && !showCaptcha.value) {
    showCaptcha.value = true
    getCaptcha()
  }
})

// Watch for auth errors
watch(lastError, (error) => {
  if (error) {
    errorMessage.value = error.message
    loginAttempts.value++
  }
})

// Methods
const getCaptcha = async () => {
  try {
    captchaLoading.value = true
    const response = await authAPI.getCaptcha()
    captchaImage.value = response.captcha
    captchaKey.value = response.key
  } catch (error) {
    ElMessage.error('获取验证码失败')
  } finally {
    captchaLoading.value = false
  }
}

const refreshCaptcha = () => {
  if (!captchaLoading.value) {
    getCaptcha()
  }
}

const handleLogin = async () => {
  if (!formRef.value || !canSubmit.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    errorMessage.value = ''
    
    const credentials: LoginRequest = {
      username: loginForm.username.trim(),
      password: loginForm.password,
      remember: loginForm.remember,
    }
    
    if (showCaptcha.value) {
      credentials.captcha = loginForm.captcha
    }
    
    await login(credentials)
    
    ElMessage.success('登录成功')
    
    // Reset login attempts on successful login
    loginAttempts.value = 0
    showCaptcha.value = false
    
    // Redirect to original page or dashboard
    const redirect = route.query.redirect as string
    await router.push(redirect || '/dashboard')
  } catch (error: any) {
    console.error('Login error:', error)
    
    // Handle specific error cases
    if (error.code === 'AUTH_001') {
      errorMessage.value = '用户名或密码错误'
    } else if (error.code === 'AUTH_004') {
      errorMessage.value = '账户已被禁用，请联系管理员'
    } else if (error.code === 'AUTH_005') {
      errorMessage.value = '账户已被锁定，请稍后再试'
    } else {
      errorMessage.value = error.message || '登录失败，请重试'
    }
    
    // Clear captcha on error
    if (showCaptcha.value) {
      loginForm.captcha = ''
      refreshCaptcha()
    }
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = async () => {
  try {
    await ElMessageBox.prompt('请输入您的邮箱地址', '找回密码', {
      confirmButtonText: '发送重置邮件',
      cancelButtonText: '取消',
      inputPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      inputErrorMessage: '请输入有效的邮箱地址',
    })
    
    ElMessage.success('重置密码邮件已发送，请查收')
  } catch (error) {
    // User cancelled
  }
}

// Clear error message when user starts typing
watch([() => loginForm.username, () => loginForm.password], () => {
  if (errorMessage.value) {
    errorMessage.value = ''
  }
})

// Initialize
onMounted(() => {
  // Focus on username input
  setTimeout(() => {
    const usernameInput = document.querySelector('input[placeholder="请输入用户名"]') as HTMLInputElement
    if (usernameInput) {
      usernameInput.focus()
    }
  }, 100)
})
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--admin-bg-base); /* Updated: No gradient, use base bg */
  padding: 20px;
}

.login-form {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: var(--admin-bg-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--admin-info-color); /* Added border for pop style */
  box-shadow: var(--shadow-lg); /* Updated: Hard shadow */
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: var(--admin-secondary-color); /* Updated: Use brand secondary */
  margin-bottom: 8px;
  font-size: var(--font-h1);
  font-weight: 800; /* ExtraBold */
}

.login-header p {
  color: var(--admin-info-color);
  font-size: var(--font-body);
  margin: 0;
}

.login-error {
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
  border-radius: var(--radius-sm);
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

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 700;
  border-radius: var(--radius-md);
  /* Primary button style overrides if needed, but element-plus usually handles it */
}

.login-attempts {
  text-align: center;
  margin-top: 16px;
}

/* Responsive design */
@media (max-width: 480px) {
  .login-container {
    padding: 10px;
  }
  
  .login-form {
    padding: 30px 20px;
  }
  
  .captcha-container {
    flex-direction: column;
    gap: 8px;
  }
  
  .captcha-image {
    width: 100%;
  }
}
</style>