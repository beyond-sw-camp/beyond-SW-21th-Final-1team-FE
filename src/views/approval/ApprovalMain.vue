<template>
  <div class="dashboard-container">
    <div class="mobile-approval-main">
      <header class="mobile-head">
        <button class="mobile-back" type="button" aria-label="뒤로가기" @click="handleBack">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <div>
          <h1>전자결재</h1>
          <p>결재 진행을 확인합니다.</p>
        </div>
      </header>
    </div>

    <!-- Top Summary Cards -->
    <div class="stats-grid">
      <!-- 결재 대기 -->
      <div class="stat-card group" @click="handleGoReview">
        <div class="card-bg red-bg"></div>
        <div class="card-content">
          <h3 class="stat-label">결재 대기</h3>
          <div class="stat-value">{{ counts.pendingReviewCount }}<span class="unit">건</span></div>
        </div>
        <div class="card-footer red-text">
          <span class="status-marker danger"></span> 처리 필요
        </div>
      </div>

      <!-- 결재 진행 -->
      <div class="stat-card group" @click="$router.push('/approval/status')">
        <div class="card-bg blue-bg"></div>
        <div class="card-content">
          <h3 class="stat-label">결재 진행</h3>
          <div class="stat-value">{{ counts.inProgressCount }}<span class="unit">건</span></div>
        </div>
        <div class="card-footer blue-text">
          <span class="status-marker progress"></span> 진행 중
        </div>
      </div>

      <!-- 완료 문서 -->
      <div class="stat-card group" @click="$router.push('/approval/box/completed')">
        <div class="card-bg green-bg"></div>
        <div class="card-content">
          <h3 class="stat-label">완료 문서</h3>
          <div class="stat-value">{{ counts.completedThisMonthCount }}<span class="unit">건</span></div>
        </div>
        <div class="card-footer green-text">
          <span class="status-marker complete"></span> 이번 달
        </div>
      </div>

      <!-- 새 결재 작성 -->
      <!-- 새 결재 작성 (모바일에서는 숨김) -->
      <button class="action-card" @click="$router.push('/approval/draft')">
        <div class="plus-circle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
        <span class="action-text">새 결재 작성하기</span>
      </button>
    </div>

    <!-- Main Content Grid -->
    <div class="main-grid">
      <!-- Recent Pending List -->
      <section class="grid-section">
        <div class="section-header">
          <h3 class="section-title">
            <span class="dot red-dot"></span> 결재 대기 문서
          </h3>
          <button class="more-btn" type="button" @click="handleGoReview">더보기</button>
        </div>
        <div class="section-body">
          <table class="dashboard-table">
            <thead>
              <tr>
                <th>제목</th>
                <th class="w-24 text-center">기안자</th>
                <th class="w-24 text-center">기안일</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in pendingApprovals" :key="item.approvalId" @click="openPendingReview(item)">
                <td>
                  <div class="title-cell">
                    <span class="tag">{{ item.templateName }}</span>
                    <span class="title-text">{{ item.title }}</span>
                  </div>
                </td>
                <td class="text-gray text-center">{{ item.drafter }}</td>
                <td class="text-light-gray text-center">{{ item.draftDate }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- My Drafts Status -->
      <section class="grid-section">
        <div class="section-header">
          <h3 class="section-title">
            <span class="dot blue-dot"></span> 내가 올린 기안
          </h3>
          <button class="more-btn" type="button" @click="$router.push('/approval/status')">더보기</button>
        </div>
        <div class="section-body">
          <table class="dashboard-table">
            <thead>
              <tr>
                <th>제목</th>
                <th class="w-40 text-center">현재 결재자</th>
                <th class="w-20 text-center">상태</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in myDrafts" :key="item.approvalId" @click="openDraftDetail(item)">
                <td>
                  <span class="title-text">{{ item.title }}</span>
                </td>
                <td class="text-center">
                  <div class="approver-cell">
                    <div class="avatar">{{ item.approverInitial }}</div>
                    <span>{{ item.currentApprover }}</span>
                  </div>
                </td>
                <td class="text-center">
                  <span class="status-badge" :class="item.status === '완료' ? 'completed' : 'ongoing'">
                    {{ item.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <ReviewModal
      :is-open="isReviewModalOpen"
      :item="selectedReviewItem"
      @close="isReviewModalOpen = false"
      @action="handleReviewAction"
    />

    <ApprovalDetailModal
      :is-open="isDetailModalOpen"
      :item="selectedDetailItem"
      @close="isDetailModalOpen = false"
      @action="handleDetailAction"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { safeBack } from '@/utils/navigation'
import ReviewModal from './components/ReviewModal.vue'
import ApprovalDetailModal from './components/ApprovalDetailModal.vue'
import {
  deleteApproval,
  getApprovalDashboard,
  getApprovalDetail,
  markApprovalAsRead,
  processApproval,
} from '@/api/approval'
import {
  mapApprovalDetailToItem,
  mapDashboardDraftItem,
  mapDashboardPendingItem,
} from '@/utils/approvalMapper'

const router = useRouter()
const counts = ref({
  pendingReviewCount: 0,
  inProgressCount: 0,
  completedThisMonthCount: 0,
})
const pendingApprovals = ref([])
const myDrafts = ref([])
const isReviewModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const selectedReviewItem = ref({})
const selectedDetailItem = ref({})

async function loadDashboard() {
  try {
    const response = await getApprovalDashboard()
    counts.value = response?.counts || counts.value
    pendingApprovals.value = (response?.pendingReviewDocuments || []).map(mapDashboardPendingItem)
    myDrafts.value = (response?.myDrafts || []).map(mapDashboardDraftItem)
  } catch (_error) {
    pendingApprovals.value = []
    myDrafts.value = []
  }
}

const openPendingReview = async (item) => {
  try {
    if (!item.isRead) {
      try {
        await markApprovalAsRead(item.approvalId)
        item.isRead = true
      } catch (_error) {
      }
    }
    const detail = await getApprovalDetail(item.approvalId)
    selectedReviewItem.value = mapApprovalDetailToItem(detail)
    isReviewModalOpen.value = true
  } catch (error) {
    alert(error?.response?.data?.error?.message || '결재 상세 조회에 실패했습니다.')
  }
}

const openDraftDetail = async (item) => {
  try {
    const detail = await getApprovalDetail(item.approvalId)
    selectedDetailItem.value = mapApprovalDetailToItem(detail)
    isDetailModalOpen.value = true
  } catch (error) {
    alert(error?.response?.data?.error?.message || '결재 상세 조회에 실패했습니다.')
  }
}

const handleReviewAction = async (data) => {
  const isApprove = data.type === 'approve'
  try {
    await processApproval(data.id, {
      approve: isApprove,
      reason: data.reason || null,
    })
    isReviewModalOpen.value = false
    await loadDashboard()
  } catch (error) {
    alert(error?.response?.data?.error?.message || '결재 처리에 실패했습니다.')
  }
}

const handleDetailAction = async (action) => {
  if (action.type === 'redraft' || action.type === 'draft') {
    router.push({ name: 'approval-draft', query: { from: action.id, source: 'main' } })
  } else if (action.type === 'delete' || action.type === 'cancel') {
    try {
      await deleteApproval(action.id)
      await loadDashboard()
      isDetailModalOpen.value = false
    } catch (error) {
      alert(error?.response?.data?.error?.message || '기안 취소에 실패했습니다.')
    }
    return
  } else if (action.type === 'review') {
    router.push({ name: 'approval-review' })
  }
  isDetailModalOpen.value = false
}

const handleGoReview = () => {
  router.push('/approval/review')
}

const handleBack = () => {
  safeBack(router, '/')
}

onMounted(loadDashboard)
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  overflow-y: auto;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
}

.dashboard-hero {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  background-color: #fcfcfd;
  border: 1px solid var(--gray200);
  border-radius: 20px;
}

.dashboard-hero h1 {
  margin: 6px 0 0;
  font-size: 1.45rem;
  color: var(--gray800);
}

.mobile-approval-main {
  display: none;
  background: #f5f8fc;
  border: 1px solid #eef2f7;
  border-radius: 18px;
  padding: 18px;
}

.mobile-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-head h1 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--gray800);
}

.mobile-head p {
  margin: 6px 0 0;
  font-size: 0.85rem;
  color: var(--gray500);
}

.mobile-back{
  width:32px;height:32px;border-radius:10px;border:1px solid #e2e8f0;background:#fff;
  display:flex;align-items:center;justify-content:center;color:#475569;cursor:pointer;
  flex-shrink: 0;
}

.dashboard-hero-eyebrow {
  margin: 0;
  color: var(--primary);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.dashboard-hero-desc {
  margin: 8px 0 0;
  color: var(--gray500);
  font-size: 0.9rem;
}

.dashboard-hero-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.hero-btn {
  border: 1px solid var(--gray300);
  background: #fff;
  color: var(--gray700);
  padding: 10px 14px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.hero-btn:hover {
  border-color: var(--gray400);
}

.hero-btn-primary {
  border-color: var(--primary);
  background: var(--primary);
  color: #fff;
}

.hero-btn-primary:hover {
  border-color: var(--secondary);
  background: var(--secondary);
}

/* Grid Layouts */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.main-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  flex: 1;
}

.main-grid.single-section {
  grid-template-columns: 1fr;
}

@media (max-width: 768px) {
  .action-card {
    display: none !important;
  }

  .mobile-approval-main {
    display: block;
  }

  .stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .main-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .grid-section {
    min-width: 0;
    width: 100%;
  }

  .stat-card {
    min-width: 0;
    min-height: 104px;
    height: auto;
    padding: 14px 12px;
    border-radius: 16px;
  }

  .card-bg {
    right: -18px;
    top: -18px;
    width: 64px;
    height: 64px;
  }

  .stat-label {
    margin-bottom: 6px;
    font-size: 0.78rem;
    line-height: 1.2;
    word-break: keep-all;
  }

  .stat-value {
    font-size: 1.35rem;
    line-height: 1.1;
  }

  .unit {
    font-size: 0.72rem;
    margin-left: 2px;
  }

  .card-footer {
    gap: 3px;
    font-size: 0.68rem;
    line-height: 1.2;
    word-break: keep-all;
  }

  .status-marker {
    width: 6px;
    height: 6px;
    flex-shrink: 0;
  }
}

/* Stat Cards */
.stat-card {
  background: white;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid #f1f3f5;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 128px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -8px rgba(0,0,0,0.08);
  border-color: #e9ecef;
}

.card-bg {
  position: absolute;
  right: -24px;
  top: -24px;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.stat-card:hover .card-bg {
  transform: scale(1.15);
}

.red-bg { background: #fff5f5; }
.blue-bg { background: #f0f7ff; }
.green-bg { background: #f2fcf5; }

.card-content {
  position: relative;
  z-index: 1;
}

.stat-label {
  color: #868e96;
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0 0 8px 0;
}

.stat-value {
  font-size: 1.85rem;
  font-weight: 800;
  color: #212529;
}

.unit {
  font-size: 0.9rem;
  font-weight: 400;
  color: #adb5bd;
  margin-left: 4px;
}

.card-footer {
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
  z-index: 1;
}

.status-marker {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  display: inline-block;
}

.status-marker.danger { background: #fa5252; }
.status-marker.progress { background: #339af0; }
.status-marker.complete { background: #40c057; }

.red-text { color: #fa5252; }
.blue-text { color: #339af0; }
.green-text { color: #40c057; }

/* Action Card */
.action-card {
  background: #228be6;
  border: none;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: white;
  height: 128px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 8px 20px -6px rgba(34, 139, 230, 0.3);
}

.action-card:hover {
  background: #1c7ed6;
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -6px rgba(34, 139, 230, 0.4);
}

.plus-circle {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-text {
  font-weight: 700;
  font-size: 1rem;
}

/* Sections */
.grid-section {
  background: white;
  border-radius: 20px;
  border: 1px solid #f1f3f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.02);
}

.section-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f8f9fa;
  background-color: #fcfcfd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fafbfc;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #343a40;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.red-dot { background: #fa5252; }
.blue-dot { background: #339af0; }

.more-btn {
  background: none;
  border: none;
  color: #adb5bd;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
}

.more-btn:hover {
  color: #339af0;
}

.section-body {
  flex: 1;
  overflow-y: auto;
}

/* Dashboard Table */
.dashboard-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.dashboard-table th {
  padding: 12px 20px;
  background: #f8f9fa;
  color: #868e96;
  font-weight: 500;
  text-align: left;
}

.dashboard-table td {
  padding: 12px 20px;
  border-bottom: 1px solid #f8f9fa;
  color: #495057;
  cursor: pointer;
  transition: background 0.1s;
}

.dashboard-table tr:hover td {
  background: #f1f3f5;
}

.w-24 { width: 96px; }
.w-40 { width: 160px; }
.w-20 { width: 80px; }

.title-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tag {
  display: inline-block;
  width: fit-content;
  padding: 2px 7px;
  background: #EFF6FF;
  border-radius: 4px;
  font-size: 0.68rem;
  color: var(--primary);
  font-weight: 600;
  letter-spacing: 0.01em;
}

.title-text {
  font-size: 0.87rem;
  font-weight: 600;
  color: #212529;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 280px;
}

.new-dot {
  width: 6px;
  height: 6px;
  background: #fa5252;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}

.text-gray { color: #495057; }
.text-light-gray { color: #adb5bd; font-size: 0.8rem; }

.approver-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  justify-content: center;
}

.avatar {
  width: 20px;
  height: 20px;
  background: #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  color: #495057;
  font-weight: 600;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid transparent;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
}

.status-badge.ongoing {
  background: #f0f7ff;
  color: #339af0;
  border-color: #d0e7ff;
}

.status-badge.completed {
  background: #f2fcf5;
  color: #40c057;
  border-color: #d3f9d8;
}

.text-center {
  text-align: center !important;
}

/* Responsiveness */
@media (min-width: 769px) and (max-width: 1024px) {
  .dashboard-hero { flex-direction: column; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .main-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .stats-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
</style>
