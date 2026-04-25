<template>
  <el-card class="party-audit-form" shadow="hover">
    <template #header>
      <div class="card-header">
        <span class="title">审核操作</span>
      </div>
    </template>

    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="审核结果" prop="status" required>
        <el-radio-group v-model="formData.status">
          <el-radio :label="AuditStatus.APPROVED">
            <el-icon><CircleCheck /></el-icon>
            通过
          </el-radio>
          <el-radio :label="AuditStatus.REJECTED">
            <el-icon><CircleClose /></el-icon>
            拒绝
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        label="审核意见"
        prop="reason"
        :required="formData.status === AuditStatus.REJECTED"
      >
        <el-input
          v-model="formData.reason"
          type="textarea"
          :rows="4"
          :placeholder="reasonPlaceholder"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          提交审核
        </el-button>
        <el-button @click="handleReset">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 审核提示 -->
    <el-alert
      v-if="party.organizer?.is_vip"
      :title="vipAuditTip"
      type="warning"
      :closable="false"
      show-icon
      class="audit-tip"
    />
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { CircleCheck, CircleClose } from '@element-plus/icons-vue'
import type { Party, PartyAuditRequest } from '@/types/party'
import { AuditStatus, VipType } from '@/types/party'

interface Props {
  party: Party
  loading?: boolean
}

interface Emits {
  (e: 'submit', data: PartyAuditRequest): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const formData = reactive<PartyAuditRequest>({
  status: AuditStatus.APPROVED,
  reason: ''
})

// 表单验证规则
const rules: FormRules = {
  status: [
    { required: true, message: '请选择审核结果', trigger: 'change' }
  ],
  reason: [
    {
      validator: (_rule, value, callback) => {
        if (formData.status === AuditStatus.REJECTED && !value) {
          callback(new Error('拒绝时必须填写审核意见'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 审核意见占位符
const reasonPlaceholder = computed(() => {
  if (formData.status === AuditStatus.REJECTED) {
    return '请填写拒绝原因（必填）'
  }
  return '请填写审核意见（选填）'
})

// VIP审核提示
const vipAuditTip = computed(() => {
  if (!props.party.organizer?.is_vip) return ''

  const vipTypeLabels: { [key: number]: string } = {
    [VipType.MONTHLY]: '月付VIP用户，需在2小时内完成审核',
    [VipType.QUARTERLY]: '季付VIP用户，需在15分钟内完成审核',
    [VipType.YEARLY]: '年付VIP用户，需在15分钟内完成审核'
  }

  const vipType = props.party.organizer.vip_type
  if (vipType === undefined || vipType === null) return 'VIP用户，请优先审核'
  return vipTypeLabels[vipType] || 'VIP用户，请优先审核'
})

// 提交审核
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    // 确认提示
    const action = formData.status === AuditStatus.APPROVED ? '通过' : '拒绝'
    await ElMessageBox.confirm(
      `确认${action}该聚会吗？`,
      '审核确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    emit('submit', { ...formData })
  } catch (error) {
    if (error !== 'cancel') {
      console.error('表单验证失败:', error)
    }
  }
}

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields()
  formData.status = AuditStatus.APPROVED
  formData.reason = ''
}

// 暴露方法
defineExpose({
  reset: handleReset
})
</script>

<style scoped lang="scss">
.party-audit-form {
  .card-header {
    .title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  :deep(.el-radio) {
    display: flex;
    align-items: center;
    margin-right: 24px;

    .el-icon {
      margin-right: 4px;
    }
  }

  .audit-tip {
    margin-top: 16px;
  }
}
</style>
