<template>
  <div class="user-profile">
    <el-dropdown @command="handleCommand" trigger="click" class="user-dropdown">
      <div class="user-info">
        <el-avatar 
          :size="36" 
          :src="userInfo?.avatar" 
          class="user-avatar"
        >
          <el-icon><User /></el-icon>
        </el-avatar>
        <div class="user-details" v-if="!isMobile">
          <div class="username">{{ userInfo?.nickname || '未登录' }}</div>
          <div class="user-role">{{ userRoleText }}</div>
        </div>
        <el-icon class="dropdown-icon" v-if="!isMobile">
          <ArrowDown />
        </el-icon>
      </div>
      
      <template #dropdown>
        <el-dropdown-menu class="user-menu">
          <!-- User Info Section -->
          <div class="user-menu-header">
            <el-avatar :size="48" :src="userInfo?.avatar" class="menu-avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <div class="menu-user-info">
              <div class="menu-username">{{ userInfo?.nickname || '未登录' }}</div>
              <div class="menu-user-role">{{ userRoleText }}</div>
              <div class="menu-user-email">{{ userInfo?.email || '' }}</div>
            </div>
          </div>
          
          <el-divider style="margin: 8px 0;" />
          
          <!-- Menu Items -->
          <el-dropdown-item command="profile" class="menu-item">
            <el-icon><User /></el-icon>
            <span>个人资料</span>
          </el-dropdown-item>
          
          <el-dropdown-item command="settings" class="menu-item">
            <el-icon><Setting /></el-icon>
            <span>账户设置</span>
          </el-dropdown-item>
          
          <el-dropdown-item command="password" class="menu-item">
            <el-icon><Lock /></el-icon>
            <span>修改密码</span>
          </el-dropdown-item>
          
          <el-divider style="margin: 8px 0;" />
          
          <el-dropdown-item command="logout" class="menu-item logout-item" divided>
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- Profile Dialog -->
    <el-dialog
      v-model="profileDialogVisible"
      title="个人资料"
      width="500px"
      :before-close="handleProfileDialogClose"
    >
      <el-form :model="profileForm" label-width="80px" class="profile-form">
        <el-form-item label="头像">
          <div class="avatar-upload">
            <el-avatar :size="80" :src="profileForm.avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <el-button size="small" class="upload-btn">更换头像</el-button>
          </div>
        </el-form-item>
        
        <el-form-item label="昵称">
          <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        
        <el-form-item label="邮箱">
          <el-input v-model="profileForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="角色">
          <el-input v-model="profileForm.role" disabled />
        </el-form-item>
        
        <el-form-item label="最后登录">
          <el-input v-model="lastLoginText" disabled />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="profileDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveProfile" :loading="saving">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  User, 
  ArrowDown, 
  Setting, 
  Lock, 
  SwitchButton 
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/modules/auth'
import { UserRole } from '@/types/auth'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const profileDialogVisible = ref(false)
const saving = ref(false)
const profileForm = ref({
  avatar: '',
  nickname: '',
  email: '',
  role: ''
})

// Computed properties
const userInfo = computed(() => authStore.userInfo)

const userRoleText = computed(() => {
  const role = authStore.userInfo?.role
  if (role === UserRole.SUPER_ADMIN) return '超级管理员'
  if (role === UserRole.OPERATION_ADMIN) return '运营管理员'
  if (role === UserRole.FINANCE_ADMIN) return '财务管理员'
  if (role === UserRole.CUSTOMER_SERVICE) return '客服管理员'
  return '普通用户'
})

const lastLoginText = computed(() => {
  const lastLogin = authStore.userInfo?.lastLoginAt
  if (!lastLogin) return '从未登录'
  
  const date = new Date(lastLogin)
  return date.toLocaleString('zh-CN')
})

const isMobile = computed(() => {
  // Simple mobile detection - in real app you might use a more sophisticated method
  return window.innerWidth < 768
})

// Methods
const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      openProfileDialog()
      break
    case 'settings':
      // Navigate to settings page
      router.push('/settings')
      break
    case 'password':
      // Open password change dialog
      handleChangePassword()
      break
    case 'logout':
      await handleLogout()
      break
  }
}

const openProfileDialog = () => {
  // Initialize form with current user data
  const user = authStore.userInfo
  if (user) {
    profileForm.value = {
      avatar: user.avatar || '',
      nickname: user.nickname || '',
      email: user.email || '',
      role: userRoleText.value
    }
  }
  profileDialogVisible.value = true
}

const handleProfileDialogClose = () => {
  profileDialogVisible.value = false
}

const handleSaveProfile = async () => {
  try {
    saving.value = true
    
    // TODO: Implement profile update API call
    await new Promise(resolve => setTimeout(resolve, 1000)) // Mock API call
    
    ElMessage.success('个人资料更新成功')
    profileDialogVisible.value = false
  } catch (error) {
    ElMessage.error('更新失败，请重试')
  } finally {
    saving.value = false
  }
}

const handleChangePassword = () => {
  // TODO: Implement password change dialog
  ElMessage.info('密码修改功能开发中')
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '退出确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await authStore.logout()
    ElMessage.success('退出登录成功')
    router.push('/login')
  } catch {
    // User cancelled
  }
}
</script>

<style scoped>
.user-profile {
  display: flex;
  align-items: center;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: var(--el-color-primary-light-9);
}

.user-avatar {
  border: 2px solid var(--el-border-color-lighter);
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.user-role {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.2;
}

.dropdown-icon {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  transition: transform 0.2s;
}

.user-dropdown.is-active .dropdown-icon {
  transform: rotate(180deg);
}

/* Dropdown Menu Styles */
.user-menu {
  min-width: 240px;
  padding: 8px 0;
}

.user-menu-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

.menu-avatar {
  border: 2px solid var(--el-border-color-lighter);
}

.menu-user-info {
  flex: 1;
  min-width: 0;
}

.menu-username {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 2px;
}

.menu-user-role {
  font-size: 12px;
  color: var(--el-color-primary);
  margin-bottom: 2px;
}

.menu-user-email {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px !important;
}

.menu-item:hover {
  background-color: var(--el-color-primary-light-9);
}

.logout-item {
  color: var(--el-color-danger);
}

.logout-item:hover {
  background-color: var(--el-color-danger-light-9);
}

/* Profile Dialog Styles */
.profile-form {
  padding: 0 16px;
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.upload-btn {
  margin-left: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .user-info {
    padding: 4px;
  }
  
  .user-menu {
    min-width: 200px;
  }
  
  .user-menu-header {
    padding: 8px 12px;
  }
  
  .menu-item {
    padding: 6px 12px !important;
  }
}
</style>