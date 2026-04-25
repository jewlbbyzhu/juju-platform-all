<template>
  <div class="rich-text-editor">
    <el-input
      v-model="localContent"
      type="textarea"
      :rows="rows"
      :placeholder="placeholder"
      :maxlength="maxLength"
      :show-word-limit="showWordLimit"
      @input="handleInput"
      @blur="handleBlur"
    />
    <div v-if="showPreview" class="preview-section">
      <el-divider>预览</el-divider>
      <div class="preview-content" v-html="sanitizedContent"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import DOMPurify from 'dompurify'

interface Props {
  modelValue: string
  placeholder?: string
  rows?: number
  maxLength?: number
  showWordLimit?: boolean
  showPreview?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'blur', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入内容',
  rows: 10,
  maxLength: 10000,
  showWordLimit: true,
  showPreview: true
})

const emit = defineEmits<Emits>()

const localContent = ref(props.modelValue)

// Sanitize HTML content to prevent XSS
const sanitizedContent = computed(() => {
  return DOMPurify.sanitize(localContent.value, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target']
  })
})

watch(() => props.modelValue, (newValue) => {
  localContent.value = newValue
})

const handleInput = () => {
  emit('update:modelValue', localContent.value)
  emit('change', localContent.value)
}

const handleBlur = () => {
  emit('blur', localContent.value)
}
</script>

<style scoped lang="scss">
.rich-text-editor {
  width: 100%;

  .preview-section {
    margin-top: 20px;
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 4px;

    .preview-content {
      min-height: 100px;
      padding: 12px;
      background-color: #ffffff;
      border-radius: 4px;
      line-height: 1.6;
      word-wrap: break-word;

      :deep(h1) {
        font-size: 24px;
        font-weight: bold;
        margin: 16px 0 8px;
      }

      :deep(h2) {
        font-size: 20px;
        font-weight: bold;
        margin: 14px 0 7px;
      }

      :deep(h3) {
        font-size: 18px;
        font-weight: bold;
        margin: 12px 0 6px;
      }

      :deep(p) {
        margin: 8px 0;
      }

      :deep(ul), :deep(ol) {
        margin: 8px 0;
        padding-left: 24px;
      }

      :deep(li) {
        margin: 4px 0;
      }

      :deep(a) {
        color: #409eff;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }

      :deep(strong) {
        font-weight: bold;
      }

      :deep(em) {
        font-style: italic;
      }

      :deep(u) {
        text-decoration: underline;
      }
    }
  }
}
</style>
