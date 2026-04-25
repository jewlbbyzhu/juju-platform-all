<template>
  <div class="feedback-page">
    <el-card shadow="never">
      <template #header>
        <h2>用户反馈管理</h2>
      </template>

      <el-form :inline="true" :model="queryParams" @submit.prevent="handleSearch">
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable>
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已解决" value="resolved" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item label="反馈类型">
          <el-select v-model="queryParams.feedbackType" placeholder="全部" clearable>
            <el-option label="Bug" value="bug" />
            <el-option label="功能建议" value="feature" />
            <el-option label="改进建议" value="improvement" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="平台">
          <el-select v-model="queryParams.platform" placeholder="全部" clearable>
            <el-option label="Android" value="android" />
            <el-option label="iOS" value="ios" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData.list" :loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="userName" label="用户" width="120">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="32" :src="row.userAvatar" />
              <span>{{ row.userName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="platform" label="平台" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.platform === 'android'" type="success" size="small">Android</el-tag>
            <el-tag v-else-if="row.platform === 'ios'" type="primary" size="small">iOS</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="versionName" label="版本" width="100" />
        <el-table-column prop="feedbackType" label="反馈类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.feedbackType === 'bug'" type="danger" size="small">Bug</el-tag>
            <el-tag v-else-if="row.feedbackType === 'feature'" type="primary" size="small">功能建议</el-tag>
            <el-tag v-else-if="row.feedbackType === 'improvement'" type="warning" size="small">改进建议</el-tag>
            <el-tag v-else type="info" size="small">其他</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'pending'" type="info" size="small">待处理</el-tag>
            <el-tag v-else-if="row.status === 'processing'" type="warning" size="small">处理中</el-tag>
            <el-tag v-else-if="row.status === 'resolved'" type="success" size="small">已解决</el-tag>
            <el-tag v-else-if="row.status === 'closed'" type="info" size="small">已关闭</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="handleDetail(row)">
              详情
            </el-button>
            <el-button type="success" size="small" link @click="handleReply(row)">
              回复
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="tableData.page"
        v-model:page-size="tableData.pageSize"
        :total="tableData.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>

    <el-dialog v-model="detailDialogVisible" title="反馈详情" width="800px">
      <div v-if="currentFeedback" class="feedback-detail">
        <div class="detail-section">
          <h3>基本信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">用户：</span>
              <div class="user-info">
                <el-avatar :size="40" :src="currentFeedback.userAvatar" />
                <span>{{ currentFeedback.userName }}</span>
              </div>
            </div>
            <div class="info-item">
              <span class="label">平台：</span>
              <el-tag v-if="currentFeedback.platform === 'android'" type="success">Android</el-tag>
              <el-tag v-else-if="currentFeedback.platform === 'ios'" type="primary">iOS</el-tag>
            </div>
            <div class="info-item">
              <span class="label">版本：</span>
              <span>{{ currentFeedback.versionName || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">反馈类型：</span>
              <el-tag v-if="currentFeedback.feedbackType === 'bug'" type="danger">Bug</el-tag>
              <el-tag v-else-if="currentFeedback.feedbackType === 'feature'" type="primary">功能建议</el-tag>
              <el-tag v-else-if="currentFeedback.feedbackType === 'improvement'" type="warning">改进建议</el-tag>
              <el-tag v-else type="info">其他</el-tag>
            </div>
            <div class="info-item">
              <span class="label">状态：</span>
              <el-tag v-if="currentFeedback.status === 'pending'" type="info">待处理</el-tag>
              <el-tag v-else-if="currentFeedback.status === 'processing'" type="warning">处理中</el-tag>
              <el-tag v-else-if="currentFeedback.status === 'resolved'" type="success">已解决</el-tag>
              <el-tag v-else-if="currentFeedback.status === 'closed'" type="info">已关闭</el-tag>
            </div>
            <div class="info-item">
              <span class="label">提交时间：</span>
              <span>{{ currentFeedback.createdAt }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>反馈内容</h3>
          <div class="content-box">
            <h4>{{ currentFeedback.title }}</h4>
            <p>{{ currentFeedback.content }}</p>
          </div>
        </div>

        <div v-if="currentFeedback.images && currentFeedback.images.length > 0" class="detail-section">
          <h3>反馈图片</h3>
          <div class="image-grid">
            <el-image
              v-for="(img, index) in currentFeedback.images"
              :key="index"
              :src="img"
              :preview-src-list="currentFeedback.images"
              fit="cover"
              style="width: 120px; height: 120px; margin: 5px;"
            />
          </div>
        </div>

        <div v-if="currentFeedback.reply" class="detail-section">
          <h3>回复内容</h3>
          <div class="reply-box">
            <p>{{ currentFeedback.reply }}</p>
            <span class="reply-time">回复时间：{{ currentFeedback.repliedAt }}</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="replyDialogVisible" title="回复反馈" width="600px">
      <el-form :model="replyFormData" label-width="80px">
        <el-form-item label="状态">
          <el-select v-model="replyFormData.status">
            <el-option label="处理中" value="processing" />
            <el-option label="已解决" value="resolved" />
            <el-option label="已关闭" value="closed" />
          </el-select>
        </el-form-item>
        <el-form-item label="回复内容" prop="reply">
          <el-input v-model="replyFormData.reply" type="textarea" :rows="6" placeholder="请输入回复内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleReplySubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { appAPI } from '@/api/modules/app'
import type { UserFeedback, UserFeedbackListParams } from '@/types/app'

const loading = ref(false)
const submitting = ref(false)
const detailDialogVisible = ref(false)
const replyDialogVisible = ref(false)
const currentFeedback = ref<UserFeedback | null>(null)

const queryParams = reactive<UserFeedbackListParams>({
  page: 1,
  pageSize: 20,
  status: undefined,
  feedbackType: undefined,
  platform: undefined
})

const tableData = reactive({
  list: [] as UserFeedback[],
  total: 0,
  page: 1,
  pageSize: 20
})

const replyFormData = reactive({
  status: 'processing',
  reply: ''
})

onMounted(() => {
  fetchData()
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await appAPI.getFeedback(queryParams)
    tableData.list = res.list
    tableData.total = res.total
    tableData.page = res.page
    tableData.pageSize = res.pageSize
  } catch (error) {
    ElMessage.error('获取反馈列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.status = undefined
  queryParams.feedbackType = undefined
  queryParams.platform = undefined
  handleSearch()
}

const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchData()
}

const handleSizeChange = (pageSize: number) => {
  queryParams.pageSize = pageSize
  queryParams.page = 1
  fetchData()
}

const handleDetail = (row: UserFeedback) => {
  currentFeedback.value = row
  detailDialogVisible.value = true
}

const handleReply = (row: UserFeedback) => {
  currentFeedback.value = row
  replyFormData.status = row.status === 'pending' ? 'processing' : row.status
  replyFormData.reply = row.reply || ''
  replyDialogVisible.value = true
}

const handleReplySubmit = async () => {
  if (!currentFeedback.value) return

  submitting.value = true
  try {
    await appAPI.replyFeedback(currentFeedback.value.id, replyFormData)
    ElMessage.success('回复成功')
    replyDialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error('回复失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.feedback-page {
  padding: 20px;
}

.feedback-page h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.el-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.feedback-detail {
  padding: 10px 0;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
}

.info-item .label {
  min-width: 80px;
  color: #909399;
  font-size: 14px;
}

.info-item .user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.content-box {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.content-box h4 {
  margin: 0 0 10px 0;
  font-size: 15px;
  font-weight: 600;
}

.content-box p {
  margin: 0;
  line-height: 1.6;
  color: #606266;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.reply-box {
  background: #ecf5ff;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.reply-box p {
  margin: 0 0 10px 0;
  line-height: 1.6;
}

.reply-time {
  font-size: 12px;
  color: #909399;
}
</style>
