<template>
  <div class="review-container">
    <section class="mobile-review">
      <header class="mobile-head">
        <button class="mobile-back" type="button" aria-label="뒤로가기" @click="handleBack">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <div>
          <h1>전자 결재 검토</h1>
          <p>결재 대기 문서를 확인합니다.</p>
        </div>
      </header>

      <div class="mobile-list">
        <button
          v-for="item in reviewList"
          :key="item.id"
          type="button"
          class="mobile-card"
          @click="openModal(item)"
        >
          <div class="mobile-title-row">
            <span class="title">{{ item.title }}</span>
            <span class="status-dot" :class="{ unread: !item.isRead }"></span>
          </div>
          <div class="mobile-meta">{{ item.category }}</div>
          <div class="mobile-meta">{{ item.drafter }} · {{ item.department }}</div>
          <div class="mobile-meta">{{ item.date }}</div>
        </button>

        <div v-if="reviewList.length === 0" class="empty-state">검토할 대기 문서가 없습니다.</div>
      </div>
    </section>

    <div class="page-header">
      <h2>전자 결재 검토</h2>
      <p class="subtitle">나에게 배정된 결재 대기 문서를 검토하고 승인/반려를 처리합니다.</p>
    </div>

    <div class="list-card">
      <div class="table-container">
        <table class="review-table">
          <thead>
            <tr>
              <th class="w-10">상태</th>
              <th class="w-category">카테고리</th>
              <th>제목</th>
              <th class="w-drafter">기안자</th>
              <th class="w-date">기안일</th>
              <th class="w-actions">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in reviewList"
              :key="item.id"
              class="clickable-row"
              @click="openModal(item)"
            >
              <td class="text-center">
                <span class="status-dot" :class="{ unread: !item.isRead }"></span>
              </td>
              <td>
                <span class="category-tag">{{ item.category }}</span>
              </td>
              <td class="title-cell">
                <span :class="item.isRead ? 'read-style' : 'unread-style'">
                  {{ item.title }}
                </span>
                <p class="preview-text">{{ item.content }}</p>
              </td>
              <td>
                <div class="drafter-info">
                  <span class="name">{{ item.drafter }}</span>
                  <span class="pos-dept">{{ item.position }} / {{ item.department }}</span>
                </div>
              </td>
              <td class="text-light-gray">{{ item.date }}</td>
              <td class="text-center" @click.stop>
                <button class="review-btn" @click="openModal(item)">검토</button>
              </td>
            </tr>
            <tr v-if="reviewList.length === 0">
              <td colspan="6" class="empty-state">검토할 대기 문서가 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ReviewModal
      :is-open="isModalOpen"
      :item="selectedItem"
      @close="isModalOpen = false"
      @action="handleReviewAction"
    />

    <ActionConfirmModal
      v-model="isResultModalOpen"
      title="처리 완료"
      :message="resultMessage"
      confirm-text="확인"
      :hide-cancel="true"
      @confirm="isResultModalOpen = false"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { safeBack } from '@/utils/navigation'
import ReviewModal from './components/ReviewModal.vue'
import ActionConfirmModal from '@/components/common/ActionConfirmModal.vue'
import {
  getApprovalDetail,
  getApprovalReviews,
  markApprovalAsRead,
  processApproval,
} from '@/api/approval'
import { mapApprovalDetailToItem, mapReviewItem } from '@/utils/approvalMapper'

const reviewList = ref([])
const isModalOpen = ref(false)
const selectedItem = ref({})
const isResultModalOpen = ref(false)
const resultMessage = ref('')
const router = useRouter()

async function loadReviewList() {
  try {
    const response = await getApprovalReviews({ size: 50 })
    reviewList.value = (response?.content || []).map(mapReviewItem)
  } catch (_error) {
    reviewList.value = []
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

const handleReviewAction = async (data) => {
  const isApprove = data.type === 'approve'
  try {
    await processApproval(data.id, {
      approve: isApprove,
      reason: data.reason || null,
    })
    isModalOpen.value = false
    resultMessage.value = isApprove ? '승인 처리되었습니다.' : '반려 처리되었습니다.'
    isResultModalOpen.value = true
    await loadReviewList()
  } catch (error) {
    alert(error?.response?.data?.error?.message || '결재 처리에 실패했습니다.')
  }
}

const handleBack = () => {
  safeBack(router, '/')
}

onMounted(loadReviewList)
</script>

<style scoped>
.review-container {
  padding: 32px;
  min-height: 100%;
  background: var(--gray50);
  border-radius: 14px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
}

.page-header {
  margin-bottom: 16px;
  padding: 18px 20px;
  border: 1px solid var(--gray200);
  border-radius: 14px;
  background: #fff;
}

.page-header h2 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #212529;
  margin-bottom: 6px;
}

.subtitle {
  color: #868e96;
  font-size: 0.92rem;
}

.list-card {
  background: white;
  border-radius: 14px;
  border: 1px solid var(--gray200);
  box-shadow: none;
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
}

.review-table {
  width: 100%;
  border-collapse: collapse;
}

.review-table th {
  padding: 16px 20px;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 600;
  color: #868e96;
  background: #f8f9fa;
  border-bottom: 1px solid #f1f3f5;
}

.review-table td {
  padding: 20px;
  border-bottom: 1px solid #f8f9fa;
  vertical-align: middle;
}

.clickable-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-row:hover {
  background-color: #f8f9fa;
}

.w-10 { width: 84px; min-width: 84px; white-space: nowrap; text-align: center !important; }
.w-category { width: 190px; min-width: 190px; text-align: center !important; }
.w-drafter { width: 180px; }
.w-date { width: 120px; }
.w-actions { width: 100px; }

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dee2e6;
}

.status-dot.unread {
  background: #339af0;
  box-shadow: 0 0 0 3px rgba(51, 154, 240, 0.18);
}

.category-tag {
  display: inline-flex;
  align-items: center;
  font-size: 0.74rem;
  padding: 4px 8px;
  background: #f1f3f5;
  color: #868e96;
  border-radius: 6px;
  white-space: nowrap;
  line-height: 1.2;
}

.review-table td:nth-child(2) {
  white-space: nowrap;
  text-align: center;
}

.title-cell {
  max-width: 400px;
}

.unread-style {
  font-weight: 800;
  color: #212529;
  font-size: 1rem;
}

.read-style {
  color: #339af0;
  text-decoration: underline;
  font-weight: 500;
  font-size: 1rem;
}

.preview-text {
  margin-top: 4px;
  font-size: 0.85rem;
  color: #adb5bd;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.drafter-info {
  display: flex;
  flex-direction: column;
}

.drafter-info .name {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.drafter-info .pos-dept {
  font-size: 0.8rem;
  color: #adb5bd;
  margin-top: 2px;
}

.text-light-gray {
  color: #adb5bd;
  font-size: 0.85rem;
}

.review-btn {
  padding: 7px 14px;
  border: 1px solid #dee2e6;
  background: #fff;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #339af0;
  cursor: pointer;
  transition: all 0.2s;
}

.review-btn:hover {
  background: #f0f7ff;
  border-color: #d0e7ff;
}

.text-center { text-align: center !important; }

.empty-state {
  padding: 60px !important;
  text-align: center;
  color: #adb5bd;
  font-size: 1rem;
}

.mobile-review {
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
  font-size: 1.3rem;
  color: #212529;
}

.mobile-head p {
  margin: 6px 0 0;
  font-size: 0.86rem;
  color: #868e96;
}

.mobile-back{
  width:32px;height:32px;border-radius:10px;border:1px solid #e2e8f0;background:#fff;
  display:flex;align-items:center;justify-content:center;color:#475569;cursor:pointer;
}

.mobile-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mobile-card {
  text-align: left;
  border: 1px solid #dbe4f3;
  border-radius: 14px;
  background: #fff;
  padding: 14px 16px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.mobile-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.mobile-title-row .title {
  font-weight: 700;
  color: #212529;
  font-size: 0.95rem;
}

.mobile-meta {
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 4px;
}

@media (max-width: 768px) {
  .review-container {
    padding: 0;
  }

  .page-header,
  .list-card {
    display: none;
  }

  .mobile-review {
    display: block;
  }
}

</style>
