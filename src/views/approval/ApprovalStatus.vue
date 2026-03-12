<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import ApprovalDetailModal from './components/ApprovalDetailModal.vue'
import {
  getApprovalDetail,
  getApprovalProgressOverview,
  markApprovalAsRead,
  searchApprovalProgress,
} from '@/api/approval'
import { mapApprovalDetailToItem, mapProgressItem } from '@/utils/approvalMapper'

const router = useRouter()
const searchQuery = ref('')
const activeTab = ref('all')
const isModalOpen = ref(false)
const selectedItem = ref({})
const visibleStatusDocs = ref([])
const statusCounts = ref({ allCount: 0, draftCount: 0, inProgressCount: 0, rejectedCount: 0 })

const isDrafting = (status) => status === '기안중';
const isPending = (status) => status === '진행중';
const isRejected = (status) => status === '반려';
const isCompleted = (status) => status === '완료';
const isCancelled = (status) => status === '취소';

const tabs = computed(() => [
  { id: 'all', label: '전체', count: statusCounts.value.allCount },
  { id: 'drafting', label: '기안중', count: statusCounts.value.draftCount },
  { id: 'pending', label: '진행중', count: statusCounts.value.inProgressCount },
  { id: 'rejected', label: '반려', count: statusCounts.value.rejectedCount }
])

const filteredList = computed(() => {
  return visibleStatusDocs.value.filter((item) => {
    const q = searchQuery.value.toLowerCase()
    return item.title.toLowerCase().includes(q) || String(item.id).toLowerCase().includes(q)
  })
})

const getStatusClass = (status) => {
  if (isDrafting(status)) return 'status-draft';
  if (isPending(status)) return 'status-pending';
  if (isRejected(status)) return 'status-rejected';
  if (isCompleted(status)) return 'status-completed';
  if (isCancelled(status)) return 'status-cancelled';
  return '';
};

async function loadStatusOverview() {
  try {
    const response = await getApprovalProgressOverview({ size: 50 })
    statusCounts.value = response?.counts || statusCounts.value
    visibleStatusDocs.value = (response?.page?.content || []).map(mapProgressItem)
  } catch (_error) {
    visibleStatusDocs.value = []
  }
}

async function loadStatusSearch() {
  const tabMap = {
    all: 'ALL',
    drafting: 'DRAFT',
    pending: 'IN_PROGRESS',
    rejected: 'REJECTED',
  }
  try {
    const response = await searchApprovalProgress({
      tabType: tabMap[activeTab.value] || 'ALL',
      keyword: searchQuery.value || undefined,
      size: 50,
    })
    visibleStatusDocs.value = (response?.content || []).map(mapProgressItem)
  } catch (_error) {
    visibleStatusDocs.value = []
  }
}

const openModal = async (item) => {
  try {
    if (!item.isRead) {
      try {
        await markApprovalAsRead(item.approvalId)
        item.isRead = true
      } catch (_error) {
      }
    }
    const detail = await getApprovalDetail(item.approvalId)
    selectedItem.value = mapApprovalDetailToItem(detail)
    isModalOpen.value = true
  } catch (error) {
    alert(error?.response?.data?.error?.message || '결재 상세 조회에 실패했습니다.')
  }
}

const closeModal = () => {
  isModalOpen.value = false
}

const handleModalAction = (action) => {
  if (action.type === 'redraft') {
    router.push({ name: 'approval-draft', query: { from: action.id, source: 'status' } })
  } else if (action.type === 'draft') {
    router.push({ name: 'approval-draft', query: { from: action.id, source: 'status' } })
  }
  isModalOpen.value = false
}

const handleRedraft = (item) => {
  router.push({ name: 'approval-draft', query: { from: item.approvalId, source: 'status' } })
}

onMounted(loadStatusOverview)
watch([activeTab, searchQuery], loadStatusSearch)
</script>

<template>
  <div class="status-container">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">전자 결재 현황</h1>
        <p class="page-subtitle">본인이 기안자/결재자로 포함된 문서의 결재 진행 상태를 확인합니다.</p>
      </div>

      <div class="search-box">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="문서 번호 또는 제목으로 검색"
            class="search-input"
          />
        </div>
      </div>
    </header>

    <main class="page-content">
      <div class="tabs-row">
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-btn"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
            <span class="count">{{ tab.count }}</span>
          </button>
        </div>
      </div>

      <div class="table-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>문서번호</th>
              <th>문서종류</th>
              <th>제목</th>
              <th>기안일</th>
              <th>결재상태</th>
              <th>현재 결재자</th>
              <th>진행률</th>
              <th>재상신</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredList"
              :key="item.id"
              class="table-row clickable-row"
              @click="openModal(item)"
            >
              <td class="col-id">{{ item.id }}</td>
              <td class="col-tpl">{{ item.templateName }}</td>
              <td class="col-title">
                <span class="title-text">{{ item.title }}</span>
              </td>
              <td class="col-date">{{ item.draftDate }}</td>
              <td class="col-status">
                <span class="status-badge" :class="getStatusClass(item.status)">
                  {{ item.status }}
                </span>
              </td>
              <td class="col-approver">{{ item.currentApprover }}</td>
              <td class="col-progress">
                <div class="progress-container">
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" :style="{ width: item.progress + '%' }"></div>
                  </div>
                  <span class="progress-text">{{ item.progress }}%</span>
                </div>
              </td>
              <td @click.stop>
                <button
                  v-if="getStatusClass(item.status) === 'status-rejected'"
                  type="button"
                  class="redraft-btn"
                  @click="handleRedraft(item)"
                >
                  재상신
                </button>
              </td>
            </tr>

            <tr v-if="filteredList.length === 0">
              <td colspan="8" class="empty-state">
                <div class="empty-content">
                  <span class="empty-icon">📂</span>
                  <p>조회된 결재 문서가 없습니다.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <ApprovalDetailModal
      :is-open="isModalOpen"
      :item="selectedItem"
      @close="closeModal"
      @action="handleModalAction"
    />
  </div>
</template>

<style scoped>
.status-container {
  padding: 32px;
  min-height: 100%;
  background: var(--gray50);
  border-radius: 14px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 18px 20px;
  border: 1px solid var(--gray200);
  border-radius: 14px;
  background: #fff;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #212529;
  margin-bottom: 6px;
}

.page-subtitle {
  color: #868e96;
  font-size: 0.92rem;
}

.search-input-wrapper {
  position: relative;
  width: 300px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #adb5bd;
  font-size: 0.9rem;
}

.search-input {
  width: 100%;
  padding: 10px 14px 10px 36px;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  font-size: 0.85rem;
  transition: all 0.2s;
  outline: none;
  background: #fff;
}

.search-input:focus {
  border-color: #339af0;
  box-shadow: 0 0 0 3px rgba(51, 154, 240, 0.12);
}

.tabs-row {
  border-bottom: 1px solid var(--gray200);
  margin-bottom: 20px;
  padding: 0 4px;
}

.tabs {
  display: flex;
  gap: 20px;
}

.tab-btn {
  padding: 12px 4px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #868e96;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-btn.active {
  color: #339af0;
  border-bottom-color: #339af0;
}

.tab-btn .count {
  font-size: 0.75rem;
  background: #f1f3f5;
  padding: 2px 7px;
  border-radius: 10px;
  color: #868e96;
}

.tab-btn.active .count {
  background: #f0f7ff;
  color: #339af0;
}

.table-card {
  background: white;
  border-radius: 14px;
  border: 1px solid var(--gray200);
  box-shadow: none;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f8f9fa;
  padding: 13px 20px;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 600;
  color: #868e96;
  border-bottom: 1px solid #f1f3f5;
}

.data-table td {
  padding: 14px 20px;
  font-size: 0.85rem;
  color: #495057;
  border-bottom: 1px solid #f8f9fa;
}

.table-row:hover {
  background: #f8f9fa;
}

.clickable-row {
  cursor: pointer;
}

.col-id { color: #868e96; font-family: monospace; }
.col-title { font-weight: 500; }
.title-text:hover { color: #339af0; text-decoration: underline; cursor: pointer; }

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid transparent;
}

.status-draft { background: #f1f3f5; color: #495057; border-color: #e9ecef; }
.status-pending { background: #fff4e6; color: #f08c00; border-color: #ffe8cc; }
.status-rejected { background: #fff5f5; color: #fa5252; border-color: #ffe3e3; }
.status-completed { background: #f2fcf5; color: #40c057; border-color: #d3f9d8; }
.status-cancelled { background: #f1f3f5; color: #495057; border-color: #e9ecef; }

.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar-bg {
  flex: 1;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
  min-width: 80px;
}

.progress-bar-fill {
  height: 100%;
  background: #339af0;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #868e96;
  width: 35px;
  text-align: right;
}

.redraft-btn {
  border: 1px solid #d0e7ff;
  background: #f0f7ff;
  color: #1971c2;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 6px 10px;
  cursor: pointer;
}

.redraft-btn:hover {
  background: #e7f5ff;
}

.empty-state {
  padding: 80px 0;
  text-align: center;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.3;
}

.empty-content p {
  color: #adb5bd;
  font-size: 0.95rem;
}
</style>
