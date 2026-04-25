<template>
  <div class="system-config">
    <el-alert
      title="系统配置"
      type="warning"
      description="修改系统配置可能影响系统运行，请谨慎操作"
      :closable="false"
      style="margin-bottom: 20px"
    />

    <div v-loading="loading">
      <el-collapse v-model="activeGroups" accordion>
        <el-collapse-item
          v-for="group in configGroups"
          :key="group.group"
          :title="group.label"
          :name="group.group"
        >
          <el-form label-width="200px">
            <el-form-item
              v-for="config in group.configs"
              :key="config.key"
              :label="config.description || config.key"
            >
              <template v-if="config.type === 'boolean'">
                <el-switch
                  v-model="configValues[config.key]"
                  @change="handleConfigChange(config)"
                />
              </template>
              <template v-else-if="config.type === 'number'">
                <el-input-number
                  v-model="configValues[config.key]"
                  @change="handleConfigChange(config)"
                />
              </template>
              <template v-else>
                <el-input
                  v-model="configValues[config.key]"
                  @change="handleConfigChange(config)"
                />
              </template>
              <el-button
                link
                type="primary"
                size="small"
                style="margin-left: 12px"
                @click="handleResetConfig(config)"
              >
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </div>

    <div class="actions" style="margin-top: 20px">
      <el-button type="primary" :loading="saving" @click="handleSaveAll">
        保存所有配置
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { SystemAPI } from '@/api/modules/system'
import type { SystemConfig, SystemConfigGroup } from '@/types/system'

const loading = ref(false)
const saving = ref(false)
const activeGroups = ref<string[]>([])

const configGroups = ref<SystemConfigGroup[]>([])
const configValues = reactive<Record<string, any>>({})
const changedConfigs = new Set<string>()

const fetchSystemConfigs = async () => {
  try {
    loading.value = true
    configGroups.value = await SystemAPI.getSystemConfigs()
    
    // Initialize config values
    configGroups.value.forEach(group => {
      group.configs.forEach(config => {
        configValues[config.key] = parseConfigValue(config.value, config.type)
      })
    })
  } catch (error: any) {
    ElMessage.error(error.message || '获取系统配置失败')
  } finally {
    loading.value = false
  }
}

const parseConfigValue = (value: string, type: string) => {
  switch (type) {
    case 'boolean':
      return value === 'true'
    case 'number':
      return Number(value)
    case 'json':
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    default:
      return value
  }
}

const stringifyConfigValue = (value: any, type: string): string => {
  switch (type) {
    case 'boolean':
      return String(value)
    case 'number':
      return String(value)
    case 'json':
      return JSON.stringify(value)
    default:
      return String(value)
  }
}

const handleConfigChange = (config: SystemConfig) => {
  changedConfigs.add(config.key)
}

const handleResetConfig = async (config: SystemConfig) => {
  try {
    await ElMessageBox.confirm('确定要重置该配置为默认值吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const resetConfig = await SystemAPI.resetSystemConfig(config.key)
    configValues[config.key] = parseConfigValue(resetConfig.value, resetConfig.type)
    changedConfigs.delete(config.key)
    
    ElMessage.success('重置成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '重置失败')
    }
  }
}

const handleSaveAll = async () => {
  if (changedConfigs.size === 0) {
    ElMessage.info('没有需要保存的配置')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要保存 ${changedConfigs.size} 个配置项吗？`, '确认保存', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    saving.value = true

    const updates = Array.from(changedConfigs).map(key => {
      const config = findConfigByKey(key)
      return {
        key,
        value: stringifyConfigValue(configValues[key], config?.type || 'string')
      }
    })

    await SystemAPI.batchUpdateSystemConfigs(updates)
    changedConfigs.clear()
    
    ElMessage.success('保存成功')
    fetchSystemConfigs()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '保存失败')
    }
  } finally {
    saving.value = false
  }
}

const findConfigByKey = (key: string): SystemConfig | undefined => {
  for (const group of configGroups.value) {
    const config = group.configs.find(c => c.key === key)
    if (config) return config
  }
  return undefined
}

onMounted(() => {
  fetchSystemConfigs()
})
</script>

<style scoped lang="scss">
.system-config {
  .actions {
    display: flex;
    justify-content: center;
    padding-top: 20px;
    border-top: 1px solid var(--el-border-color);
  }
}
</style>
