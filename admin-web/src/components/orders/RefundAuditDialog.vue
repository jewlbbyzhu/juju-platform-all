<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="订单号">
        <el-input v-model="order.orderNo" disabled />
      </el-form-item>

      <el-form-item label="退款金额">
        <el-input
          :model-value="`¥${(order.refund?.amount || 0) / 100}`"
          disabled
        />
      </el-form-item>

      <el-form-item label="申请时间">
        <el-input
          :model-value="order.refund?.createdAt ? formatDate(order.refund.createdAt) : '-'"
          disabled
        />
      </el-form-item>

      <el-form-item label="审核决定" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio value="processed">通过退款</el-radio>
          <el-radio value="rejected">拒绝退款</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="审核意见" prop="reason">
        <el-input
          v-model="formData.reason"
          type="textarea"
          :rows="4"
          placeholder="请输入审核意见（选填）"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="审核人" prop="reviewer">
        <el-input
          v-model="formData.reviewer"
          placeholder="请输入审核人姓名"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          确认提交
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { OrderDetail, RefundAuditRequest } from '@/types/order'
import { formatDate } from '@/utils/format'

interface Props {
  visible: boolean
  order: OrderDetail
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const loading = ref(false)

const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const dialogTitle = computed(() => {
  return '退款审核'
})

const formData = reactive<RefundAuditRequest>({
  status: 'processed',
  reason: '',
  reviewer: ''
})

const formRules: FormRules = {
  status: [
    { required: true, message: '请选择审核决定', trigger: 'change' }
  ],
  reviewer: [
    { required: true, message: '请输入审核人姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '审核人姓名长度在 2 到 50 个字符', trigger: 'blur' }
  ]
}

// Watch for dialog visibility changes to reset form
watch(() => props.visible, (newVal) => {
  if (newVal) {
    resetForm()
  }
})

const resetForm = () => {
  formData.status = 'processed'
  formData.reason = ''
  formData.reviewer = ''
  formRef.value?.clearValidate()
}

const handleClose = () => {
  dialogVisible.value = false
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    // Emit success event with audit data
    emit('success')
    
    ElMessage.success('退款审核提交成功')
    handleClose()
  } catch (error) {
    console.error('Form validation failed:', error)
  } finally {
    loading.value = false
  }
}

// Expose form data for parent component
defineExpose({
  formData
})
</script>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
