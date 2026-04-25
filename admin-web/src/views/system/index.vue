<template>
  <div class="system-settings">
    <el-card shadow="never">
      <template #header>
        <div class="page-header">
          <h2>系统设置</h2>
          <el-text type="info">管理系统配置、管理员账号、角色权限等</el-text>
        </div>
      </template>

      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="管理员管理" name="admins">
          <AdminManagement />
        </el-tab-pane>

        <el-tab-pane label="角色管理" name="roles">
          <RoleManagement />
        </el-tab-pane>

        <el-tab-pane label="权限管理" name="permissions">
          <PermissionManagement />
        </el-tab-pane>

        <el-tab-pane label="操作日志" name="logs">
          <OperationLogs />
        </el-tab-pane>

        <el-tab-pane label="系统配置" name="config">
          <SystemConfig />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminManagement from './components/AdminManagement.vue'
import RoleManagement from './components/RoleManagement.vue'
import PermissionManagement from './components/PermissionManagement.vue'
import OperationLogs from './components/OperationLogs.vue'
import SystemConfig from './components/SystemConfig.vue'

const route = useRoute()
const router = useRouter()

const activeTab = ref('admins')

onMounted(() => {
  // Set active tab from query parameter
  if (route.query.tab) {
    activeTab.value = route.query.tab as string
  }
})

// Update URL when tab changes
const handleTabChange = (tab: string) => {
  router.push({ query: { tab } })
}
</script>

<style scoped lang="scss">
.system-settings {
  .page-header {
    h2 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 600;
    }
  }

  :deep(.el-tabs) {
    .el-tabs__content {
      padding: 20px;
    }
  }
}
</style>
