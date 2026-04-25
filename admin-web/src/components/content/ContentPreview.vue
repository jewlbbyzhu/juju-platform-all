<template>
  <div class="content-preview">
    <el-card shadow="never">
      <template #header>
        <div class="preview-header">
          <span>内容预览</span>
          <el-button
            v-if="showRefresh"
            type="text"
            @click="handleRefresh"
          >
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <div class="preview-body">
        <!-- Banner Preview -->
        <div v-if="type === 'banner'" class="banner-preview">
          <div class="banner-info">
            <h3>{{ title }}</h3>
            <p v-if="description">{{ description }}</p>
          </div>
          <div v-if="imageUrl" class="banner-image">
            <el-image
              :src="imageUrl"
              fit="cover"
              :preview-src-list="[imageUrl]"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                  <span>加载失败</span>
                </div>
              </template>
            </el-image>
          </div>
          <div v-if="linkUrl" class="banner-link">
            <el-tag type="info">链接: {{ linkUrl }}</el-tag>
          </div>
        </div>

        <!-- Announcement Preview -->
        <div v-else-if="type === 'announcement'" class="announcement-preview">
          <div class="announcement-header">
            <h2>{{ title }}</h2>
            <el-tag v-if="announcementType" :type="getAnnouncementTypeColor(announcementType)">
              {{ getAnnouncementTypeLabel(announcementType) }}
            </el-tag>
          </div>
          <div class="announcement-content" v-html="sanitizedContent"></div>
          <div v-if="publishedAt" class="announcement-footer">
            <span class="publish-time">发布时间: {{ formatDate(publishedAt) }}</span>
          </div>
        </div>

        <!-- Generic Content Preview -->
        <div v-else class="generic-preview">
          <h3 v-if="title">{{ title }}</h3>
          <div v-if="content" class="content" v-html="sanitizedContent"></div>
          <div v-if="imageUrl" class="image">
            <el-image
              :src="imageUrl"
              fit="contain"
              :preview-src-list="[imageUrl]"
            />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Refresh, Picture } from '@element-plus/icons-vue'
import DOMPurify from 'dompurify'
import dayjs from 'dayjs'

interface Props {
  type: 'banner' | 'announcement' | 'generic'
  title?: string
  description?: string
  content?: string
  imageUrl?: string
  linkUrl?: string
  announcementType?: 'system' | 'activity' | 'maintenance' | 'update'
  publishedAt?: string
  showRefresh?: boolean
}

interface Emits {
  (e: 'refresh'): void
}

const props = withDefaults(defineProps<Props>(), {
  showRefresh: false
})

const emit = defineEmits<Emits>()

// Sanitize HTML content
const sanitizedContent = computed(() => {
  if (!props.content) return ''
  return DOMPurify.sanitize(props.content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target']
  })
})

const getAnnouncementTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    system: '系统公告',
    activity: '活动公告',
    maintenance: '维护公告',
    update: '更新公告'
  }
  return labels[type] || type
}

const getAnnouncementTypeColor = (type: string) => {
  const colors: Record<string, any> = {
    system: 'danger',
    activity: 'success',
    maintenance: 'warning',
    update: 'primary'
  }
  return colors[type] || 'info'
}

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const handleRefresh = () => {
  emit('refresh')
}
</script>

<style scoped lang="scss">
.content-preview {
  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .preview-body {
    min-height: 200px;

    .banner-preview {
      .banner-info {
        margin-bottom: 16px;

        h3 {
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 8px;
        }

        p {
          color: #606266;
          margin: 0;
        }
      }

      .banner-image {
        margin-bottom: 16px;

        .el-image {
          width: 100%;
          max-height: 400px;
          border-radius: 4px;
        }

        .image-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          background-color: #f5f7fa;
          color: #909399;

          .el-icon {
            font-size: 48px;
            margin-bottom: 8px;
          }
        }
      }

      .banner-link {
        .el-tag {
          word-break: break-all;
        }
      }
    }

    .announcement-preview {
      .announcement-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #ebeef5;

        h2 {
          font-size: 20px;
          font-weight: bold;
          margin: 0;
        }
      }

      .announcement-content {
        margin-bottom: 16px;
        line-height: 1.8;
        color: #303133;

        :deep(h1), :deep(h2), :deep(h3) {
          margin: 16px 0 8px;
        }

        :deep(p) {
          margin: 8px 0;
        }

        :deep(ul), :deep(ol) {
          margin: 8px 0;
          padding-left: 24px;
        }

        :deep(a) {
          color: #409eff;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .announcement-footer {
        padding-top: 12px;
        border-top: 1px solid #ebeef5;
        color: #909399;
        font-size: 14px;
      }
    }

    .generic-preview {
      h3 {
        font-size: 18px;
        font-weight: bold;
        margin: 0 0 16px;
      }

      .content {
        margin-bottom: 16px;
        line-height: 1.6;
      }

      .image {
        .el-image {
          width: 100%;
          max-height: 400px;
        }
      }
    }
  }
}
</style>
