<template>
  <div class="enhanced-form">
    <!-- Form Header -->
    <div v-if="title || description" class="form-header">
      <h3 v-if="title" class="form-title">{{ title }}</h3>
      <p v-if="description" class="form-description">{{ description }}</p>
    </div>

    <!-- Search Form -->
    <el-form
      v-if="type === 'search'"
      ref="formRef"
      :inline="true"
      :model="formData"
      class="search-form"
      @submit.prevent="handleSearch"
    >
      <div class="search-fields">
        <template v-for="field in visibleFields" :key="field.prop">
          <el-form-item
            :label="field.label"
            :prop="field.prop"
            :rules="field.rules"
            class="search-item"
          >
            <!-- Input -->
            <el-input
              v-if="field.type === 'input' || !field.type"
              v-model="formData[field.prop]"
              :placeholder="field.placeholder || `请输入${field.label}`"
              :clearable="field.clearable !== false"
              :disabled="field.disabled"
              :prefix-icon="field.prefixIcon"
              :suffix-icon="field.suffixIcon"
              @keyup.enter="handleSearch"
            />

            <!-- Select -->
            <el-select
              v-else-if="field.type === 'select'"
              v-model="formData[field.prop]"
              :placeholder="field.placeholder || `请选择${field.label}`"
              :clearable="field.clearable !== false"
              :disabled="field.disabled"
              :multiple="field.multiple"
              :collapse-tags="field.collapseTags"
              style="width: 180px"
            >
              <el-option
                v-for="opt in field.options"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>

            <!-- Date Picker -->
            <el-date-picker
              v-else-if="field.type === 'date'"
              v-model="formData[field.prop]"
              :type="field.dateType || 'date'"
              :placeholder="field.placeholder || '请选择日期'"
              :start-placeholder="field.startPlaceholder || '开始日期'"
              :end-placeholder="field.endPlaceholder || '结束日期'"
              :clearable="field.clearable !== false"
              :disabled="field.disabled"
              style="width: 220px"
            />

            <!-- Date Range -->
            <el-date-picker
              v-else-if="field.type === 'daterange'"
              v-model="formData[field.prop]"
              type="daterange"
              :start-placeholder="field.startPlaceholder || '开始日期'"
              :end-placeholder="field.endPlaceholder || '结束日期'"
              :clearable="field.clearable !== false"
              :disabled="field.disabled"
              style="width: 220px"
            />

            <!-- Cascader -->
            <el-cascader
              v-else-if="field.type === 'cascader'"
              v-model="formData[field.prop]"
              :options="field.options"
              :placeholder="field.placeholder || `请选择${field.label}`"
              :clearable="field.clearable !== false"
              :disabled="field.disabled"
              :props="field.props"
              style="width: 200px"
            />
          </el-form-item>
        </template>

        <!-- Expand/Collapse toggle -->
        <el-button
          v-if="hasHiddenFields"
          type="primary"
          link
          @click="showAllFields = !showAllFields"
          class="expand-btn"
        >
          {{ showAllFields ? '收起' : '展开' }}
          <el-icon class="el-icon--right">
            <component :is="showAllFields ? ArrowUp : ArrowDown" />
          </el-icon>
        </el-button>
      </div>

      <div class="search-actions">
        <el-button type="primary" :icon="Search" :loading="loading" @click="handleSearch">
          搜索
        </el-button>
        <el-button :icon="Refresh" :loading="loading" @click="handleReset">
          重置
        </el-button>
      </div>
    </el-form>

    <!-- Standard Form -->
    <el-form
      v-else
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-position="labelPosition"
      :label-width="labelWidth"
      :size="size"
      class="standard-form"
      @submit.prevent="handleSubmit"
    >
      <div class="form-content" :class="{ 'form-grid': layout === 'grid', [`grid-cols-${columns}`]: layout === 'grid' }">
        <template v-for="field in fields" :key="field.prop">
          <el-form-item
            :label="field.label"
            :prop="field.prop"
            :rules="field.rules"
            class="form-item"
            :class="{ 'form-item-full': field.fullWidth }"
          >
            <!-- Input -->
            <el-input
              v-if="field.type === 'input' || !field.type"
              v-model="formData[field.prop]"
              :placeholder="field.placeholder || `请输入${field.label}`"
              :clearable="field.clearable !== false"
              :disabled="field.disabled || loading"
              :prefix-icon="field.prefixIcon"
              :suffix-icon="field.suffixIcon"
              :maxlength="field.maxlength"
              :show-word-limit="field.showWordLimit"
              :type="field.inputType || 'text'"
              :rows="field.rows"
              :autosize="field.autosize"
            />

            <!-- Password -->
            <el-input
              v-else-if="field.type === 'password'"
              v-model="formData[field.prop]"
              type="password"
              :placeholder="field.placeholder || '请输入密码'"
              :disabled="field.disabled || loading"
              :prefix-icon="field.prefixIcon || Lock"
              show-password
            />

            <!-- Number -->
            <el-input-number
              v-else-if="field.type === 'number'"
              v-model="formData[field.prop]"
              :placeholder="field.placeholder || `请输入${field.label}`"
              :disabled="field.disabled || loading"
              :min="field.min"
              :max="field.max"
              :precision="field.precision"
              :step="field.step"
              :controls="field.controls !== false"
              style="width: 100%"
            />

            <!-- Select -->
            <el-select
              v-else-if="field.type === 'select'"
              v-model="formData[field.prop]"
              :placeholder="field.placeholder || `请选择${field.label}`"
              :clearable="field.clearable !== false"
              :disabled="field.disabled || loading"
              :multiple="field.multiple"
              :collapse-tags="field.collapseTags"
              :filterable="field.filterable"
              :remote="field.remote"
              :remote-method="field.remoteMethod"
              :loading="field.selectLoading"
              style="width: 100%"
            >
              <el-option
                v-for="opt in field.options"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              >
                <!-- Custom option template -->
                <div v-if="opt.icon || opt.description" class="select-option">
                  <el-icon v-if="opt.icon"><component :is="opt.icon" /></el-icon>
                  <div class="option-content">
                    <span class="option-label">{{ opt.label }}</span>
                    <span v-if="opt.description" class="option-desc">{{ opt.description }}</span>
                  </div>
                </div>
              </el-option>
            </el-select>

            <!-- Date Picker -->
            <el-date-picker
              v-else-if="field.type === 'date'"
              v-model="formData[field.prop]"
              :type="field.dateType || 'date'"
              :placeholder="field.placeholder || '请选择日期'"
              :clearable="field.clearable !== false"
              :disabled="field.disabled || loading"
              style="width: 100%"
            />

            <!-- Date Range -->
            <el-date-picker
              v-else-if="field.type === 'daterange'"
              v-model="formData[field.prop]"
              type="daterange"
              :start-placeholder="field.startPlaceholder || '开始日期'"
              :end-placeholder="field.endPlaceholder || '结束日期'"
              :clearable="field.clearable !== false"
              :disabled="field.disabled || loading"
              style="width: 100%"
            />

            <!-- Switch -->
            <el-switch
              v-else-if="field.type === 'switch'"
              v-model="formData[field.prop]"
              :disabled="field.disabled || loading"
              :active-text="field.activeText"
              :inactive-text="field.inactiveText"
            />

            <!-- Radio -->
            <el-radio-group
              v-else-if="field.type === 'radio'"
              v-model="formData[field.prop]"
              :disabled="field.disabled || loading"
            >
              <el-radio
                v-for="opt in field.options"
                :key="opt.value"
                :label="opt.value"
              >
                {{ opt.label }}
              </el-radio>
            </el-radio-group>

            <!-- Checkbox -->
            <el-checkbox-group
              v-else-if="field.type === 'checkbox'"
              v-model="formData[field.prop]"
              :disabled="field.disabled || loading"
            >
              <el-checkbox
                v-for="opt in field.options"
                :key="opt.value"
                :label="opt.value"
              >
                {{ opt.label }}
              </el-checkbox>
            </el-checkbox-group>

            <!-- Textarea -->
            <el-input
              v-else-if="field.type === 'textarea'"
              v-model="formData[field.prop]"
              type="textarea"
              :placeholder="field.placeholder || `请输入${field.label}`"
              :rows="field.rows || 4"
              :maxlength="field.maxlength"
              :show-word-limit="field.showWordLimit"
              :disabled="field.disabled || loading"
              :autosize="field.autosize"
            />

            <!-- Custom slot -->
            <slot
              v-else-if="field.type === 'custom'"
              :name="`field-${field.prop}`"
              :field="field"
              :value="formData[field.prop]"
              :update="(val: any) => formData[field.prop] = val"
            />

            <!-- Form item tip -->
            <template v-if="field.tip" #label>
              <span>{{ field.label }}</span>
              <el-tooltip :content="field.tip" placement="top">
                <el-icon class="form-tip-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </template>
          </el-form-item>
        </template>
      </div>

      <!-- Form Actions -->
      <div v-if="showActions" class="form-actions">
        <el-button
          v-if="showCancel"
          :disabled="loading"
          @click="handleCancel"
        >
          {{ cancelText }}
        </el-button>
        <el-button
          type="primary"
          :loading="loading"
          :disabled="loading"
          @click="handleSubmit"
        >
          {{ submitText }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Component } from 'vue'
import { Search, Refresh, ArrowUp, ArrowDown, Lock, QuestionFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormRules, FormInstance } from 'element-plus'

export interface FormField {
  prop: string
  label: string
  type?: 'input' | 'password' | 'number' | 'select' | 'date' | 'daterange' | 'switch' | 'radio' | 'checkbox' | 'textarea' | 'cascader' | 'custom'
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  rules?: FormRules[string]
  // Input specific
  prefixIcon?: Component
  suffixIcon?: Component
  maxlength?: number
  showWordLimit?: boolean
  inputType?: string
  rows?: number
  autosize?: boolean | { minRows: number; maxRows: number }
  // Number specific
  min?: number
  max?: number
  precision?: number
  step?: number
  controls?: boolean
  // Select specific
  multiple?: boolean
  collapseTags?: boolean
  filterable?: boolean
  remote?: boolean
  remoteMethod?: (query: string) => void
  selectLoading?: boolean
  options?: Array<{ label: string; value: any; icon?: Component; description?: string }>
  // Date specific
  dateType?: string
  startPlaceholder?: string
  endPlaceholder?: string
  // Switch specific
  activeText?: string
  inactiveText?: string
  // Layout specific
  fullWidth?: boolean
  // Tip
  tip?: string
  // Cascader specific
  props?: Record<string, any>
}

interface Props {
  type?: 'search' | 'standard'
  title?: string
  description?: string
  fields: FormField[]
  modelValue?: Record<string, any>
  rules?: FormRules
  labelPosition?: 'left' | 'right' | 'top'
  labelWidth?: string | number
  size?: 'large' | 'default' | 'small'
  layout?: 'vertical' | 'grid'
  columns?: number
  showActions?: boolean
  showCancel?: boolean
  cancelText?: string
  submitText?: string
  loading?: boolean
  maxSearchFields?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'standard',
  labelPosition: 'right',
  labelWidth: '100px',
  size: 'default',
  layout: 'vertical',
  columns: 2,
  showActions: true,
  showCancel: true,
  cancelText: '取消',
  submitText: '提交',
  loading: false,
  maxSearchFields: 3,
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  search: [data: Record<string, any>]
  reset: []
  submit: [data: Record<string, any>]
  cancel: []
  validate: [valid: boolean, errors: any]
}>()

// Refs
const formRef = ref<FormInstance>()
const formData = ref<Record<string, any>>({})
const showAllFields = ref(false)

// Initialize form data
const initializeFormData = () => {
  const initialData: Record<string, any> = {}
  props.fields.forEach(field => {
    if (props.modelValue && props.modelValue[field.prop] !== undefined) {
      initialData[field.prop] = props.modelValue[field.prop]
    } else {
      // Set default values based on type
      switch (field.type) {
        case 'switch':
          initialData[field.prop] = false
          break
        case 'checkbox':
        case 'select':
          initialData[field.prop] = field.multiple ? [] : undefined
          break
        case 'number':
          initialData[field.prop] = undefined
          break
        default:
          initialData[field.prop] = ''
      }
    }
  })
  formData.value = initialData
}

onMounted(initializeFormData)

// Watch for external modelValue changes
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    formData.value = { ...formData.value, ...newVal }
  }
}, { deep: true })

// Watch for internal formData changes
watch(formData, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

// Computed
const formRules = computed(() => {
  const rules: FormRules = {}
  props.fields.forEach(field => {
    if (field.rules) {
      rules[field.prop] = field.rules
    }
  })
  return { ...rules, ...props.rules }
})

const visibleFields = computed(() => {
  if (showAllFields.value) {
    return props.fields
  }
  return props.fields.slice(0, props.maxSearchFields)
})

const hasHiddenFields = computed(() => {
  return props.fields.length > props.maxSearchFields
})

// Methods
const handleSearch = async () => {
  if (props.type === 'search') {
    emit('search', { ...formData.value })
  }
}

const handleReset = () => {
  formRef.value?.resetFields()
  initializeFormData()
  emit('reset')
  if (props.type === 'search') {
    emit('search', { ...formData.value })
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    emit('submit', { ...formData.value })
    emit('validate', true, null)
  } catch (errors) {
    emit('validate', false, errors)
    // Show error message
    ElMessage.error('请检查表单填写是否正确')
  }
}

const handleCancel = () => {
  emit('cancel')
}

const validate = async () => {
  if (!formRef.value) return false
  try {
    await formRef.value.validate()
    return true
  } catch {
    return false
  }
}

const clearValidate = () => {
  formRef.value?.clearValidate()
}

const resetFields = () => {
  formRef.value?.resetFields()
  initializeFormData()
}

// Expose methods
defineExpose({
  validate,
  clearValidate,
  resetFields,
  formData,
  formRef,
})
</script>

<style scoped lang="scss">
.enhanced-form {
  .form-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--color-border-light);

    .form-title {
      margin: 0 0 8px;
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }

    .form-description {
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: 1.5;
    }
  }

  // Search form styles
  .search-form {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 8px;
    padding: 16px;
    background-color: var(--color-bg-surface);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-light);
    margin-bottom: 16px;

    .search-fields {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      flex: 1;

      :deep(.el-form-item) {
        margin-bottom: 0;
        margin-right: 0;

        .el-form-item__label {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
        }
      }
    }

    .search-actions {
      display: flex;
      gap: 8px;
    }

    .expand-btn {
      font-size: var(--font-size-sm);
    }
  }

  // Standard form styles
  .standard-form {
    .form-content {
      &.form-grid {
        display: grid;
        gap: 0 24px;

        &.grid-cols-1 {
          grid-template-columns: 1fr;
        }

        &.grid-cols-2 {
          grid-template-columns: repeat(2, 1fr);
        }

        &.grid-cols-3 {
          grid-template-columns: repeat(3, 1fr);
        }

        &.grid-cols-4 {
          grid-template-columns: repeat(4, 1fr);
        }
      }
    }

    .form-item {
      &.form-item-full {
        grid-column: 1 / -1;
      }

      :deep(.el-form-item__label) {
        font-weight: var(--font-weight-medium);
        color: var(--color-text-primary);
      }

      .form-tip-icon {
        margin-left: 4px;
        font-size: 14px;
        color: var(--color-text-tertiary);
        cursor: help;
      }
    }

    .select-option {
      display: flex;
      align-items: center;
      gap: 8px;

      .option-content {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .option-label {
          font-size: var(--font-size-sm);
        }

        .option-desc {
          font-size: var(--font-size-xs);
          color: var(--color-text-tertiary);
        }
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--color-border-light);
    }
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .enhanced-form {
    .search-form {
      flex-direction: column;

      .search-fields {
        width: 100%;
      }

      .search-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }

    .standard-form {
      .form-content {
        &.grid-cols-2,
        &.grid-cols-3,
        &.grid-cols-4 {
          grid-template-columns: 1fr;
        }
      }
    }
  }
}
</style>