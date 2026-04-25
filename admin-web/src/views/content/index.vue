<template>
  <div class="content-page">
    <!-- Tabs -->
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <!-- Banner Management Tab -->
      <el-tab-pane label="Banner管理" name="banner">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>Banner列表</h3>
              <el-button
                type="primary"
                :icon="Plus"
                @click="handleCreateBanner"
              >
                新建Banner
              </el-button>
            </div>
          </template>

          <!-- Banner Filters -->
          <div class="filters">
            <el-input
              v-model="bannerFilters.keyword"
              placeholder="搜索Banner标题"
              :prefix-icon="Search"
              clearable
              style="width: 240px"
              @clear="handleBannerSearch"
              @keyup.enter="handleBannerSearch"
            />
            <el-select
              v-model="bannerFilters.status"
              placeholder="状态"
              clearable
              style="width: 150px"
              @change="handleBannerSearch"
            >
              <el-option label="启用" value="active" />
              <el-option label="禁用" value="inactive" />
            </el-select>
            <el-button type="primary" :icon="Search" @click="handleBannerSearch">
              搜索
            </el-button>
            <el-button :icon="Refresh" @click="handleBannerReset">重置</el-button>
          </div>

          <!-- Banner Table -->
          <el-table
            :data="banners"
            v-loading="bannerLoading"
            stripe
            style="width: 100%"
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column label="Banner图片" width="150">
              <template #default="{ row }">
                <el-image
                  :src="row.imageUrl"
                  fit="cover"
                  style="width: 120px; height: 60px; border-radius: 4px"
                  :preview-src-list="[row.imageUrl]"
                />
              </template>
            </el-table-column>
            <el-table-column prop="title" label="标题" min-width="200" />
            <el-table-column label="排序" width="100">
              <template #default="{ row }">
                <el-tag>{{ row.sortOrder }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                  {{ row.status === 'active' ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="280" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  @click="handleEditBanner(row)"
                >
                  编辑
                </el-button>
                <el-button
                  :type="row.status === 'active' ? 'warning' : 'success'"
                  size="small"
                  @click="handleToggleBannerStatus(row)"
                >
                  {{ row.status === 'active' ? '禁用' : '启用' }}
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="handleDeleteBanner(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- Banner Pagination -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="bannerPagination.page"
              v-model:page-size="bannerPagination.pageSize"
              :page-sizes="[10, 20, 50]"
              :total="bannerPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleBannerSearch"
              @current-change="handleBannerSearch"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <!-- Announcement Management Tab -->
      <el-tab-pane label="公告管理" name="announcement">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>公告列表</h3>
              <el-button
                type="primary"
                :icon="Plus"
                @click="handleCreateAnnouncement"
              >
                新建公告
              </el-button>
            </div>
          </template>

          <!-- Announcement Filters -->
          <div class="filters">
            <el-input
              v-model="announcementFilters.keyword"
              placeholder="搜索公告标题"
              :prefix-icon="Search"
              clearable
              style="width: 240px"
              @clear="handleAnnouncementSearch"
              @keyup.enter="handleAnnouncementSearch"
            />
            <el-select
              v-model="announcementFilters.status"
              placeholder="状态"
              clearable
              style="width: 150px"
              @change="handleAnnouncementSearch"
            >
              <el-option label="草稿" value="draft" />
              <el-option label="已发布" value="published" />
              <el-option label="已归档" value="archived" />
            </el-select>
            <el-select
              v-model="announcementFilters.type"
              placeholder="类型"
              clearable
              style="width: 150px"
              @change="handleAnnouncementSearch"
            >
              <el-option label="系统公告" value="system" />
              <el-option label="活动公告" value="activity" />
              <el-option label="维护公告" value="maintenance" />
              <el-option label="更新公告" value="update" />
            </el-select>
            <el-button type="primary" :icon="Search" @click="handleAnnouncementSearch">
              搜索
            </el-button>
            <el-button :icon="Refresh" @click="handleAnnouncementReset">重置</el-button>
          </div>

          <!-- Announcement Table -->
          <el-table
            :data="announcements"
            v-loading="announcementLoading"
            stripe
            style="width: 100%"
          >
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="title" label="标题" min-width="200" />
            <el-table-column label="类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getAnnouncementTypeColor(row.type)">
                  {{ getAnnouncementTypeLabel(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getAnnouncementStatusColor(row.status)">
                  {{ getAnnouncementStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="发布时间" width="180">
              <template #default="{ row }">
                {{ row.publishedAt ? formatDate(row.publishedAt) : '-' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="280" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  @click="handleEditAnnouncement(row)"
                >
                  编辑
                </el-button>
                <el-button
                  v-if="row.status === 'draft'"
                  type="success"
                  size="small"
                  @click="handlePublishAnnouncement(row)"
                >
                  发布
                </el-button>
                <el-button
                  v-if="row.status === 'published'"
                  type="warning"
                  size="small"
                  @click="handleArchiveAnnouncement(row)"
                >
                  归档
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="handleDeleteAnnouncement(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- Announcement Pagination -->
          <div class="pagination">
            <el-pagination
              v-model:current-page="announcementPagination.page"
              v-model:page-size="announcementPagination.pageSize"
              :page-sizes="[10, 20, 50]"
              :total="announcementPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleAnnouncementSearch"
              @current-change="handleAnnouncementSearch"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- Banner Dialog -->
    <el-dialog
      v-model="bannerDialogVisible"
      :title="bannerDialogTitle"
      width="800px"
      @close="handleBannerDialogClose"
    >
      <el-form
        ref="bannerFormRef"
        :model="bannerForm"
        :rules="bannerRules"
        label-width="100px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="bannerForm.title" placeholder="请输入Banner标题" />
        </el-form-item>
        <el-form-item label="Banner图片" prop="imageUrl">
          <ImageUpload
            v-model="bannerForm.imageUrl"
            upload-type="banner"
            :limit="1"
            :multiple="false"
          />
        </el-form-item>
        <el-form-item label="链接地址">
          <el-input v-model="bannerForm.linkUrl" placeholder="请输入跳转链接（选填）" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number
            v-model="bannerForm.sortOrder"
            :min="0"
            :max="999"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="bannerForm.status">
            <el-radio value="active">启用</el-radio>
            <el-radio value="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="预览">
          <ContentPreview
            type="banner"
            :title="bannerForm.title"
            :image-url="bannerForm.imageUrl"
            :link-url="bannerForm.linkUrl"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bannerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveBanner" :loading="bannerSaving">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- Announcement Dialog -->
    <el-dialog
      v-model="announcementDialogVisible"
      :title="announcementDialogTitle"
      width="900px"
      @close="handleAnnouncementDialogClose"
    >
      <el-form
        ref="announcementFormRef"
        :model="announcementForm"
        :rules="announcementRules"
        label-width="100px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="announcementForm.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="announcementForm.type" placeholder="请选择公告类型">
            <el-option label="系统公告" value="system" />
            <el-option label="活动公告" value="activity" />
            <el-option label="维护公告" value="maintenance" />
            <el-option label="更新公告" value="update" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <RichTextEditor
            v-model="announcementForm.content"
            :rows="12"
            :show-preview="true"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="announcementForm.status">
            <el-radio value="draft">草稿</el-radio>
            <el-radio value="published">发布</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="announcementDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveAnnouncement" :loading="announcementSaving">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  Plus,
  Search,
  Refresh
} from '@element-plus/icons-vue'
import { ContentAPI } from '@/api'
import ImageUpload from '@/components/content/ImageUpload.vue'
import RichTextEditor from '@/components/content/RichTextEditor.vue'
import ContentPreview from '@/components/content/ContentPreview.vue'
import { formatDate as formatDateSafe } from '@/utils/formatters'
import type {
  Banner,
  BannerRequest,
  Announcement,
  AnnouncementRequest
} from '@/types/content'

// Active tab
const activeTab = ref('banner')

// Banner state
const bannerLoading = ref(false)
const bannerSaving = ref(false)
const banners = ref<Banner[]>([])
const bannerDialogVisible = ref(false)
const bannerDialogTitle = ref('')
const bannerFormRef = ref<FormInstance>()

// Banner filters
const bannerFilters = reactive({
  keyword: '',
  status: '' as 'active' | 'inactive' | ''
})

// Banner pagination
const bannerPagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// Banner form
const bannerForm = reactive<BannerRequest & { id?: number }>({
  title: '',
  imageUrl: '',
  linkUrl: '',
  sortOrder: 0,
  status: 'inactive'
})

// Banner form rules
const bannerRules: FormRules = {
  title: [
    { required: true, message: '请输入Banner标题', trigger: 'blur' }
  ],
  imageUrl: [
    { required: true, message: '请上传Banner图片', trigger: 'change' }
  ],
  sortOrder: [
    { required: true, message: '请输入排序', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// Announcement state
const announcementLoading = ref(false)
const announcementSaving = ref(false)
const announcements = ref<Announcement[]>([])
const announcementDialogVisible = ref(false)
const announcementDialogTitle = ref('')
const announcementFormRef = ref<FormInstance>()

// Announcement filters
const announcementFilters = reactive({
  keyword: '',
  status: '' as 'draft' | 'published' | 'archived' | '',
  type: '' as 'system' | 'activity' | 'maintenance' | 'update' | ''
})

// Announcement pagination
const announcementPagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// Announcement form
const announcementForm = reactive<AnnouncementRequest & { id?: number }>({
  title: '',
  content: '',
  type: 'system',
  status: 'draft'
})

// Announcement form rules
const announcementRules: FormRules = {
  title: [
    { required: true, message: '请输入公告标题', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择公告类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入公告内容', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// Format date
const formatDate = (date: string) => {
  return formatDateSafe(date)
}

// Get announcement type label
const getAnnouncementTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    system: '系统公告',
    activity: '活动公告',
    maintenance: '维护公告',
    update: '更新公告'
  }
  return labels[type] || type
}

// Get announcement type color
const getAnnouncementTypeColor = (type: string) => {
  const colors: Record<string, any> = {
    system: 'danger',
    activity: 'success',
    maintenance: 'warning',
    update: 'primary'
  }
  return colors[type] || 'info'
}

// Get announcement status label
const getAnnouncementStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档'
  }
  return labels[status] || status
}

// Get announcement status color
const getAnnouncementStatusColor = (status: string) => {
  const colors: Record<string, any> = {
    draft: 'info',
    published: 'success',
    archived: 'warning'
  }
  return colors[status] || 'info'
}

// Load banners
const loadBanners = async () => {
  try {
    bannerLoading.value = true
    const params = {
      page: bannerPagination.page,
      pageSize: bannerPagination.pageSize,
      keyword: bannerFilters.keyword || undefined,
      status: bannerFilters.status || undefined
    }
    const response = await ContentAPI.getBanners(params)
    banners.value = response.list
    bannerPagination.total = response.total
  } catch (error) {
    console.error('Failed to load banners:', error)
    ElMessage.error('加载Banner列表失败')
  } finally {
    bannerLoading.value = false
  }
}

// Handle banner search
const handleBannerSearch = () => {
  bannerPagination.page = 1
  loadBanners()
}

// Handle banner reset
const handleBannerReset = () => {
  bannerFilters.keyword = ''
  bannerFilters.status = ''
  handleBannerSearch()
}

// Handle create banner
const handleCreateBanner = () => {
  bannerDialogTitle.value = '新建Banner'
  Object.assign(bannerForm, {
    id: undefined,
    title: '',
    imageUrl: '',
    linkUrl: '',
    sortOrder: 0,
    status: 'inactive'
  })
  bannerDialogVisible.value = true
}

// Handle edit banner
const handleEditBanner = (banner: Banner) => {
  bannerDialogTitle.value = '编辑Banner'
  Object.assign(bannerForm, {
    id: banner.id,
    title: banner.title,
    imageUrl: banner.imageUrl,
    linkUrl: banner.linkUrl || '',
    sortOrder: banner.sortOrder,
    status: banner.status
  })
  bannerDialogVisible.value = true
}

// Handle save banner
const handleSaveBanner = async () => {
  if (!bannerFormRef.value) return

  await bannerFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      bannerSaving.value = true
      const data: BannerRequest = {
        title: bannerForm.title,
        imageUrl: bannerForm.imageUrl,
        linkUrl: bannerForm.linkUrl || undefined,
        sortOrder: bannerForm.sortOrder,
        status: bannerForm.status
      }

      if (bannerForm.id) {
        await ContentAPI.updateBanner(bannerForm.id, data)
        ElMessage.success('更新成功')
      } else {
        await ContentAPI.createBanner(data)
        ElMessage.success('创建成功')
      }

      bannerDialogVisible.value = false
      loadBanners()
    } catch (error) {
      console.error('Failed to save banner:', error)
      ElMessage.error('保存失败')
    } finally {
      bannerSaving.value = false
    }
  })
}

// Handle toggle banner status
const handleToggleBannerStatus = async (banner: Banner) => {
  try {
    const newStatus = banner.status === 'active' ? 'inactive' : 'active'
    await ContentAPI.updateBannerStatus(banner.id, newStatus)
    ElMessage.success('状态更新成功')
    loadBanners()
  } catch (error) {
    console.error('Failed to toggle banner status:', error)
    ElMessage.error('状态更新失败')
  }
}

// Handle delete banner
const handleDeleteBanner = async (banner: Banner) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除Banner "${banner.title}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await ContentAPI.deleteBanner(banner.id)
    ElMessage.success('删除成功')
    loadBanners()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to delete banner:', error)
      ElMessage.error('删除失败')
    }
  }
}

// Handle banner dialog close
const handleBannerDialogClose = () => {
  bannerFormRef.value?.resetFields()
}

// Load announcements
const loadAnnouncements = async () => {
  try {
    announcementLoading.value = true
    const params = {
      page: announcementPagination.page,
      pageSize: announcementPagination.pageSize,
      keyword: announcementFilters.keyword || undefined,
      status: announcementFilters.status || undefined,
      type: announcementFilters.type || undefined
    }
    const response = await ContentAPI.getAnnouncements(params)
    announcements.value = response.list
    announcementPagination.total = response.total
  } catch (error) {
    console.error('Failed to load announcements:', error)
    ElMessage.error('加载公告列表失败')
  } finally {
    announcementLoading.value = false
  }
}

// Handle announcement search
const handleAnnouncementSearch = () => {
  announcementPagination.page = 1
  loadAnnouncements()
}

// Handle announcement reset
const handleAnnouncementReset = () => {
  announcementFilters.keyword = ''
  announcementFilters.status = ''
  announcementFilters.type = ''
  handleAnnouncementSearch()
}

// Handle create announcement
const handleCreateAnnouncement = () => {
  announcementDialogTitle.value = '新建公告'
  Object.assign(announcementForm, {
    id: undefined,
    title: '',
    content: '',
    type: 'system',
    status: 'draft'
  })
  announcementDialogVisible.value = true
}

// Handle edit announcement
const handleEditAnnouncement = (announcement: Announcement) => {
  announcementDialogTitle.value = '编辑公告'
  Object.assign(announcementForm, {
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    type: announcement.type,
    status: announcement.status
  })
  announcementDialogVisible.value = true
}

// Handle save announcement
const handleSaveAnnouncement = async () => {
  if (!announcementFormRef.value) return

  await announcementFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      announcementSaving.value = true
      const data: AnnouncementRequest = {
        title: announcementForm.title,
        content: announcementForm.content,
        type: announcementForm.type,
        status: announcementForm.status
      }

      if (announcementForm.id) {
        await ContentAPI.updateAnnouncement(announcementForm.id, data)
        ElMessage.success('更新成功')
      } else {
        await ContentAPI.createAnnouncement(data)
        ElMessage.success('创建成功')
      }

      announcementDialogVisible.value = false
      loadAnnouncements()
    } catch (error) {
      console.error('Failed to save announcement:', error)
      ElMessage.error('保存失败')
    } finally {
      announcementSaving.value = false
    }
  })
}

// Handle publish announcement
const handlePublishAnnouncement = async (announcement: Announcement) => {
  try {
    await ElMessageBox.confirm(
      `确定要发布公告 "${announcement.title}" 吗？`,
      '发布确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    await ContentAPI.publishAnnouncement(announcement.id)
    ElMessage.success('发布成功')
    loadAnnouncements()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to publish announcement:', error)
      ElMessage.error('发布失败')
    }
  }
}

// Handle archive announcement
const handleArchiveAnnouncement = async (announcement: Announcement) => {
  try {
    await ElMessageBox.confirm(
      `确定要归档公告 "${announcement.title}" 吗？`,
      '归档确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await ContentAPI.archiveAnnouncement(announcement.id)
    ElMessage.success('归档成功')
    loadAnnouncements()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to archive announcement:', error)
      ElMessage.error('归档失败')
    }
  }
}

// Handle delete announcement
const handleDeleteAnnouncement = async (announcement: Announcement) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除公告 "${announcement.title}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await ContentAPI.deleteAnnouncement(announcement.id)
    ElMessage.success('删除成功')
    loadAnnouncements()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to delete announcement:', error)
      ElMessage.error('删除失败')
    }
  }
}

// Handle announcement dialog close
const handleAnnouncementDialogClose = () => {
  announcementFormRef.value?.resetFields()
}

// Handle tab change
const handleTabChange = (tabName: string) => {
  if (tabName === 'banner') {
    loadBanners()
  } else if (tabName === 'announcement') {
    loadAnnouncements()
  }
}

// Initialize
onMounted(() => {
  loadBanners()
})
</script>

<style scoped lang="scss">
.content-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
  }

  .filters {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
