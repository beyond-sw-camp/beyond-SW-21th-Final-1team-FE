<template>
  <div class="card fade-up delay-2 approvals-card">
    <div class="card-header">
      <div class="tab-pills">
        <div
          v-for="tab in tabs" :key="tab.key"
          class="tab-pill" :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >{{ tab.label }}</div>
      </div>
      <div class="icon-actions">
        <button type="button" class="icon-btn" :title="sortButtonTitle" @click="toggleSortOrder">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        </button>
        <button type="button" class="icon-btn" title="새로고침" @click="refreshItems">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
        </button>
        <button type="button" class="icon-btn" title="추가" @click="goToDraft">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        </button>
      </div>
    </div>
    <div class="card-body" style="display:flex;flex-direction:column;flex:1">
      <div style="flex:1">
        <div v-for="item in visibleItems" :key="item.id" class="approval-item" @click="openDetail(item)">
          <div class="approval-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div class="approval-title" :class="{ 'approval-title-read': item.type === 'pending' && item.readDate != null }">{{ item.title }}</div>
          <div class="approval-meta">
            <span>{{ item.who }}</span>
            <span>{{ item.date }}</span>
          </div>
        </div>
      </div>
      <div class="approval-footer">
        <button type="button" class="all-view-btn" @click="goToStatus">전체보기 →</button>
      </div>
    </div>
  </div>
  <ApprovalDetailModal
    :is-open="isDetailOpen"
    :item="selectedItem"
    @close="isDetailOpen = false"
    @action="handleModalAction"
  />
  <ReviewModal
    :is-open="isReviewOpen"
    :item="selectedItem"
    @close="isReviewOpen = false"
    @action="handleReviewAction"
  />
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ApprovalDetailModal from '@/views/approval/components/ApprovalDetailModal.vue'
import ReviewModal from '@/views/approval/components/ReviewModal.vue'
import { getApprovalDetail, getApprovalMainSummary, markApprovalAsRead, processApproval } from '@/api/approval'
import { mapApprovalDetailToItem, mapMainSummaryItem } from '@/utils/approvalMapper'

const router = useRouter()
const activeTab = ref('pending')
const sortOrder = ref('desc')
const sourceItems = ref([])
const serverPendingCount = ref(0)
const serverProgressCount = ref(0)
const isDetailOpen = ref(false)
const isReviewOpen = ref(false)
const selectedItem = ref({})
const pendingCount = computed(() => {
  return Number.isFinite(serverPendingCount.value) && serverPendingCount.value > 0
    ? serverPendingCount.value
    : sourceItems.value.filter((item) => item.type === 'pending').length
})
const progressCount = computed(() => {
  return Number.isFinite(serverProgressCount.value) && serverProgressCount.value > 0
    ? serverProgressCount.value
    : sourceItems.value.filter((item) => item.type === 'progress').length
})
const tabs = computed(() => ([
  { key: 'pending', label: `결재 대기 문서 ${pendingCount.value}건` },
  { key: 'progress', label: `결재 진행 문서 ${progressCount.value}건` },
]))

const sortButtonTitle = computed(() => (sortOrder.value === 'desc' ? '정렬: 최신순' : '정렬: 오래된순'))

const visibleItems = computed(() => {
  const filtered = sourceItems.value.filter((item) => item.type === activeTab.value)
  return [...filtered].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return sortOrder.value === 'desc' ? dateB - dateA : dateA - dateB
  })
})

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
}

const refreshItems = async () => {
  try {
    const response = await getApprovalMainSummary()
    serverPendingCount.value = Number(
      response?.counts?.pendingReviewCount ?? response?.pendingReviewCount ?? response?.pendingCount ?? 0,
    )
    serverProgressCount.value = Number(
      response?.counts?.inProgressCount ?? response?.inProgressCount ?? response?.progressCount ?? 0,
    )
    sourceItems.value = [
      ...(response?.pendingDocuments || []).map((item) => mapMainSummaryItem(item, 'pending')),
      ...(response?.inProgressDocuments || []).map((item) => mapMainSummaryItem(item, 'progress')),
    ]
  } catch (_error) {
    serverPendingCount.value = 0
    serverProgressCount.value = 0
    sourceItems.value = []
  }
}

const goToDraft = () => {
  router.push('/approval/draft')
}

const goToStatus = () => {
  router.push('/approval/status')
}

const openDetail = async (item) => {
  try {
    if (item.type === 'pending' && item.readDate == null) {
      await markApprovalAsRead(item.approvalId)
      item.readDate = new Date().toISOString()
      item.isRead = true
    }
    const detail = await getApprovalDetail(item.approvalId)
    selectedItem.value = mapApprovalDetailToItem(detail)
    if (item.type === 'pending' && selectedItem.value?.canReview) {
      isReviewOpen.value = true
    } else {
      isDetailOpen.value = true
    }
  } catch (error) {
    alert(error?.response?.data?.error?.message || '결재 상세 조회에 실패했습니다.')
  }
}

const handleReviewAction = async (action) => {
  const isApprove = action.type === 'approve'
  try {
    await processApproval(action.id, {
      approve: isApprove,
      reason: action.reason || null,
    })
    isReviewOpen.value = false
    await refreshItems()
  } catch (error) {
    alert(error?.response?.data?.error?.message || '결재 처리에 실패했습니다.')
  }
}

const handleModalAction = (action) => {
  if (action.type === 'redraft') {
    router.push({ name: 'approval-draft', query: { from: action.id, source: 'box', action: 'redraft' } })
  } else if (action.type === 'draft') {
    router.push({ name: 'approval-draft', query: { from: action.id, source: 'box', action: 'draft' } })
  } else if (action.type === 'review') {
    isDetailOpen.value = false
    isReviewOpen.value = true
    return
  }
  isDetailOpen.value = false
}

onMounted(refreshItems)
</script>

<style scoped>
.approvals-card{height:100%;display:flex;flex-direction:column}
.approval-item{
  display:flex;align-items:center;gap:10px;
  padding:10px 0;border-bottom:1px solid var(--gray100);
  cursor:pointer;
}
.approval-item:last-child{border-bottom:none}
.approval-icon{
  width:26px;height:26px;border-radius:7px;background:var(--gray50);
  display:flex;align-items:center;justify-content:center;color:var(--gray400);flex-shrink:0;
}
.approval-title{flex:1;font-size:0.88rem;font-weight:500;color:var(--gray700)}
.approval-title-read{color:#339af0;text-decoration:underline}
.approval-meta{display:flex;gap:10px;font-size:0.78rem;color:var(--gray400);white-space:nowrap}
.approval-footer{
  text-align:center;padding-top:10px;border-top:1px solid var(--gray100);margin-top:4px;
}
.all-view-btn{
  border:none;background:transparent;cursor:pointer;
  font-size:0.8rem;color:var(--gray500)
}
.all-view-btn:hover{color:var(--primary)}
.icon-btn{
  border:none;background:transparent;cursor:pointer;padding:2px;
  display:inline-flex;align-items:center;justify-content:center;color:inherit;
}
.icon-btn:hover{color:var(--primary)}
.tab-pill{
  cursor:pointer;
}
</style>
