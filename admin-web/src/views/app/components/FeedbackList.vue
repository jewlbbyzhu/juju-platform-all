<template>
  <div class="feedback-list">
    <!-- Search and Filter -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
          <el-option label="待处理" value="pending" />
          <el-option label="处理中" value="processing" />
          <el-option label="已解决" value="resolved" />
          <el-option label="已关闭" value="closed" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="类型">
        <el-select v-model="searchForm.feedbackType" placeholder="全部类型" clearable>
          <el-option label="Bug反馈" value="bug" />
          <el-option label="功能建议" value="feature" />
          <el-option label="改进建议" value="improvement" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="平台">
        <el-select v-model="searchForm.platform" placeholder="全部平台" clearable>
          <el-option label="Android" value="android" />
          <el-option label="iOS" value="ios" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="关键词">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索标题或内容"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon>
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- Data Table -->
    <el-table
      v-loading="loading"
      :data="tableData"
      stripe
      border
    >
      <el-table-column prop="userName" label="用户" width="150">
        <template #default="{ row }">
          <div class="user-info">
            <el-avatar :src="row.userAvatar" :size="32">
              {{ row.userName.charAt(0) }}
            </el-avatar>
            <span class="user-name">{{ row.userName }}</span>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column prop="title" label="标题" width="200" show-overflow-tooltip />
      
      <el-table-column prop="feedbackType" label="类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getFeedbackTypeTag(row.feedbackType)">
            {{ getFeedbackTypeText(row.feedbackType) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="platform" label="平台" width="100">
        <template #default="{ row }">
          <el-tag :type="row.platform === 'android' ? 'success' : 'primary'">
            {{ row.platform === 'android' ? 'Android' : 'iOS' }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="versionName" label="版本" width="100" />
      
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column prop="createdAt" label="提交时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            size="small"
            link
            @click="handleView(row)"
          >
            查看
          </el-button>
          <el-button
            v-if="row.status === 'pending' || row.status === 'processing'"
            type="success"
            size="small"
            link
            @click="handleReply(row)"
          >
            回复
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
      class="pagination"
    />

    <!-- Feedback Detail Dialog -->
    <el-dialog
      v-model="detailDialogVisible"
      title="反馈详情"
      width="800px"
    >
      <div v-if="currentFeedback" class="feedback-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户">
            {{ currentFeedback.userName }}
          </el-descriptions-item>
          <el-descriptions-item label="版本">
            {{ currentFeedback.versionName }}
          </el-descriptions-item>
          <el-descriptions-item label="平台">
            {{ currentFeedback.platform === 'android' ? 'Android' : 'iOS' }}
          </el-descriptions-item>
          <el-descriptions-item label="类型">
            {{ getFeedbackTypeText(currentFeedback.feedbackType) }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentFeedback.status)">
              {{ getStatusText(currentFeedback.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ formatDate(currentFeedback.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <div class="feedback-content">
          <h4>{{ currentFeedback.title }}</h4>
          <p>{{ currentFeedback.content }}</p>
          
          <div v-if="currentFeedback.images && currentFeedback.images.length > 0" class="images">
            <el-image
              v-for="(image, index) in currentFeedback.images"
              :key="index"
              :src="image"
              :preview-src-list="currentFeedback.images"
              fit="cover"
              style="width: 100px; height: 100px; margin-right: 10px"
            />
          </div>
        </div>

        <el-divider v-if="currentFeedback.reply" />

        <div v-if="currentFeedback.reply" class="feedback-reply">
          <h4>管理员回复</h4>
          <p>{{ currentFeedback.reply }}</p>
          <div class="reply-info">
            <span>回复人: {{ currentFeedback.repliedBy }}</span>
            <span>回复时间: {{ formatDate(currentFeedback.repliedAt!) }}</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- Reply Dialog -->
    <el-dialog
      v-model="replyDialogVisible"
      title="回复反馈"
      width="600px"
    >
      <el-form :model="replyForm" label-width="80px">
        <el-form-item label="回复内容">
          <el-input
            v-model="replyForm.reply"
            type="textarea"
            :rows="6"
            placeholder="请输入回复内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-radio-group v-model="replyForm.status">
            <el-radio value="processing">处理中</el-radio>
            <el-radio value="resolved">已解决</el-radio>
            <el-radio value="closed">已关闭</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          @click="handleSubmitReply"
        >
          提交回复
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { AppAPI } from '@/api'
import type { UserFeedback, UserFeedbackListParams, FeedbackReplyRequest } from '@/types/app'

const loading = ref(false)
const detailDialogVisible = ref(false)
const replyDialogVisible = ref(false)
const submitting = ref(false)
const currentFeedback = ref<UserFeedback | null>(null)

const searchForm = reactive({
  status: '',
  feedbackType: '',
  platform: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const replyForm = reactive<FeedbackReplyRequest>({
  reply: '',
  status: 'processing'
})

const tableData = ref<UserFeedback[]>([])

const getFeedbackTypeTag = (type: string) => {
  const typeMap = {
    bug: 'danger',
    feature: 'primary',
    improvement: 'success',
    other: 'info'
  }
  return typeMap[type as keyof typeof typeMap] as 'danger' | 'primary' | 'success' | 'info'
}

const getFeedbackTypeText = (type: string) => {
  const textMap = {
    bug: 'Bug反馈',
    feature: '功能建议',
    improvement: '改进建议',
    other: '其他'
  }
  return textMap[type as keyof typeof textMap]
}

const getStatusType = (status: string) => {
  const typeMap = {
    pending: 'warning',
    processing: 'primary',
    resolved: 'success',
    closed: 'info'
  }
  return typeMap[status as keyof typeof typeMap] as 'warning' | 'primary' | 'success' | 'info'
}

const getStatusText = (status: string) => {
  const textMap = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
    closed: '已关闭'
  }
  return textMap[status as keyof typeof textMap]
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadData = async () => {
  try {
    loading.value = true
    
    const params: UserFeedbackListParams = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...(searchForm.status && { status: searchForm.status as 'pending' | 'processing' | 'resolved' | 'closed' }),
      ...(searchForm.feedbackType && { feedbackType: searchForm.feedbackType as 'bug' | 'feature' | 'improvement' | 'other' }),
      ...(searchForm.platform && { platform: searchForm.platform as 'android' | 'ios' }),
      ...(searchForm.keyword && { keyword: searchForm.keyword })
    }
    
    const response = await AppAPI.getFeedbackList(params)
    tableData.value = response.list
    pagination.total = response.total
  } catch (error) {
    console.error('Load feedback error:', error)
    ElMessage.error('加载反馈列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  Object.assign(searchForm, {
    status: '',
    feedbackType: '',
    platform: '',
    keyword: ''
  })
  handleSearch()
}

const handleView = (row: UserFeedback) => {
  currentFeedback.value = row
  detailDialogVisible.value = true
}

const handleReply = (row: UserFeedback) => {
  currentFeedback.value = row
  replyForm.reply = ''
  replyForm.status = 'processing'
  replyDialogVisible.value = true
}

const handleSubmitReply = async () => {
  if (!currentFeedback.value) return
  
  if (!replyForm.reply.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }

  try {
    submitting.value = true
    await AppAPI.replyFeedback(currentFeedback.value.id, replyForm)
    ElMessage.success('回复成功')
    replyDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('Reply feedback error:', error)
    ElMessage.error('回复失败')
  } finally {
    submitting.value = false
  }
}

const handleSizeChange = () => {
  loadData()
}

const handlePageChange = () => {
  loadData()
}

const refresh = () => {
  loadData()
}

onMounted(() => {
  loadData()
})

defineExpose({
  refresh
})
</script>

<style scoped lang="scss">
.feedback-list {
  .search-form {
    margin-bottom: 20px;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;

    .user-name {
      font-size: 14px;
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .feedback-detail {
    .feedback-content {
      h4 {
        margin-bottom: 10px;
        font-size: 16px;
        font-weight: 500;
      }

      p {
        line-height: 1.6;
        color: #606266;
        white-space: pre-wrap;
      }

      .images {
        margin-top: 15px;
      }
    }

    .feedback-reply {
      h4 {
        margin-bottom: 10px;
        font-size: 16px;
        font-weight: 500;
      }

      p {
        line-height: 1.6;
        color: #606266;
        white-space: pre-wrap;
        margin-bottom: 10px;
      }

      .reply-info {
        display: flex;
        gap: 20px;
        font-size: 12px;
        color: #909399;
      }
    }
  }
}
</style>
