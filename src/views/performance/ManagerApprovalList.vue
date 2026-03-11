<template>
  <div class="approval-wrap">
    <!-- ═══ 상단 통계 카드 ═══ -->
    <div class="stat-cards">
      <div class="stat-card stat-card--primary">
        <h3 class="stat-label">총 승인 대기</h3>
        <div class="stat-value">{{ planItems.length + resultItems.length }}<span class="stat-unit">건</span></div>
      </div>
      <div class="stat-card">
        <h3 class="stat-label">목표 수립(Plan) 대기</h3>
        <div class="stat-value">{{ planItems.length }}<span class="stat-unit">건</span></div>
      </div>
      <div class="stat-card">
        <h3 class="stat-label">결과(Result) 승인 대기</h3>
        <div class="stat-value">{{ resultItems.length }}<span class="stat-unit">건</span></div>
      </div>
    </div>

    <!-- ═══ 메인 리스트 영역 ═══ -->
    <div class="list-card">
      <!-- 탭 -->
      <div class="tab-bar">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'plan' }"
          @click="activeTab = 'plan'"
        >
          목표 수립 요청 ({{ planItems.length }})
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'result' }"
          @click="activeTab = 'result'"
        >
          결과 승인 요청 ({{ resultItems.length }})
        </button>
      </div>

      <!-- 툴바 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <label class="check-label">
            <input type="checkbox" class="check-input" />
            <span>전체 선택</span>
          </label>
        </div>
        <div class="toolbar-right">
          <button class="filter-btn">
            <Filter :size="14" /> 필터
          </button>
          <div class="search-wrap">
            <Search :size="14" class="search-icon" />
            <input
              v-model="searchText"
              type="text"
              placeholder="이름/제목 검색"
              class="search-input"
            />
          </div>
        </div>
      </div>

      <!-- 리스트 -->
      <div class="list-body">
        <ul class="item-list">
          <li
            v-for="item in paginatedItems"
            :key="item.id"
            class="item-row"
            @click="handleItemClick(item)"
          >
            <div class="item-content">
              <div class="item-left">
                <input type="checkbox" class="check-input" @click.stop />
                <div class="item-avatar">
                  <User :size="18" />
                </div>
                <div class="item-info">
                  <div class="item-meta">
                    <span class="item-name">{{ item.user }}</span>
                    <span class="item-dept">{{ item.dept }}</span>
                    <span class="item-type" :class="item.type === '팀 성과' ? 'type-team' : 'type-individual'">
                      {{ item.type }}
                    </span>
                  </div>
                  <div class="item-title">{{ item.title }}</div>
                  <div class="item-sub">
                    <span>제출일: {{ item.date }}</span>
                    <template v-if="item.achievement">
                      <span class="item-divider"></span>
                      <span class="item-achievement">달성률: {{ item.achievement }}</span>
                    </template>
                  </div>
                </div>
              </div>
              <div class="item-actions">
                <button class="btn-reject" @click.stop="handleQuickReject(item)">반려</button>
                <button class="btn-approve" @click.stop="handleQuickApprove(item)">승인</button>
                <button class="btn-arrow">
                  <ChevronRight :size="18" />
                </button>
              </div>
            </div>
          </li>
          <li v-if="currentItems.length === 0" class="item-empty">
            승인 대기 항목이 없습니다.
          </li>
        </ul>
      </div>
      <div v-if="totalPages > 1" class="approval-pagination">
        <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">이전</button>
        <span class="page-status">{{ currentPage }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">다음</button>
      </div>
    </div>

    <!-- ═══ 상세 모달 ═══ -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selectedItem" class="modal-overlay" @click.self="selectedItem = null">
          <div class="modal-card">
            <!-- 모달 헤더 -->
            <div class="modal-header">
              <div class="modal-header-left">
                <div class="modal-badges">
                  <span class="badge" :class="selectedItem.type === '팀 성과' ? 'badge-blue' : 'badge-green'">
                    {{ selectedItem.type }}
                  </span>
                  <span class="badge badge-status">{{ selectedItem.status }}</span>
                </div>
                <h3 class="modal-title">{{ selectedItem.title }}</h3>
              </div>
              <button class="close-btn" @click="selectedItem = null">
                <X :size="18" />
              </button>
            </div>

            <!-- 모달 탭 -->
            <div class="modal-tabs">
              <button class="modal-tab" :class="{ active: modalTab === 'detail' }" @click="modalTab = 'detail'">
                성과 상세 조회
              </button>
              <button class="modal-tab" :class="{ active: modalTab === 'result' }" @click="modalTab = 'result'">
                승인 처리
              </button>
            </div>

            <!-- 모달 본문 -->
            <div class="modal-body">
              <!-- 상세 조회 -->
              <template v-if="modalTab === 'detail'">
                <div class="detail-profile">
                  <div class="detail-avatar">
                    <User :size="22" />
                  </div>
                  <div class="detail-profile-info">
                    <div class="detail-profile-name">{{ selectedItem.user }}</div>
                    <div class="detail-profile-dept">{{ selectedItem.dept }}</div>
                  </div>
                  <div class="detail-profile-date">제출일: {{ selectedItem.date }}</div>
                </div>

                <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">기간</span>
                  <span class="detail-value">{{ approvalPeriodLabel }}</span>
                </div>
                  <div class="detail-item">
                    <span class="detail-label">현재 달성률</span>
                    <div class="detail-progress">
                      <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: (selectedItem.progress || 0) + '%' }"></div>
                      </div>
                      <span class="progress-pct">{{ selectedItem.progress || 0 }}%</span>
                    </div>
                  </div>
                </div>

                <div class="detail-section">
                  <span class="detail-label">목표 상세 내용</span>
                  <div class="detail-box">
                    <p>본 프로젝트의 주요 목표는 다음과 같습니다:</p>
                    <ul>
                      <li>기존 레거시 시스템의 기술 부채 해결</li>
                      <li>API 응답 속도 50% 이상 개선</li>
                      <li>코드 커버리지 80% 달성 및 유지보수성 향상</li>
                    </ul>
                  </div>
                </div>

                <div v-if="selectedItem.achievement" class="detail-section">
                  <span class="detail-label">최종 결과 보고</span>
                  <div class="detail-box detail-box--result">
                    <p>목표 대비 120% 초과 달성하였습니다. 주요 성과 지표가 모두 기준치를 상회합니다.</p>
                  </div>
                </div>
              </template>

              <!-- 승인 처리 -->
              <template v-else>
                <div class="detail-alert warn">
                  <AlertCircle :size="16" />
                  <div>
                    <strong>승인 처리 시 유의사항</strong>
                    <p>승인 후에는 평가자가 내용을 수정할 수 없습니다. 반려 시 구체적인 사유를 입력해주세요.</p>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">검토 의견</label>
                  <textarea
                    v-model="reviewComment"
                    rows="5"
                    class="form-textarea"
                    placeholder="승인 또는 반려 사유를 입력하세요."
                  ></textarea>
                </div>

                <div class="form-group">
                  <label class="form-label">첨부 파일 확인</label>
                  <div class="file-card">
                    <div class="file-info">
                      <div class="file-icon">
                        <FileText :size="18" />
                      </div>
                      <div>
                        <div class="file-name">성과_증빙자료_v1.pdf</div>
                        <div class="file-size">2.4 MB</div>
                      </div>
                    </div>
                    <button class="file-download">다운로드</button>
                  </div>
                </div>
              </template>
            </div>

            <!-- 모달 푸터 -->
            <div class="modal-footer">
              <template v-if="modalTab === 'detail'">
                <button class="btn-outline" @click="selectedItem = null">닫기</button>
                <button class="btn-primary" @click="modalTab = 'result'">승인/반려 하기</button>
              </template>
              <template v-else>
                <button class="btn-outline" @click="modalTab = 'detail'">이전</button>
                <button class="btn-danger" @click="handleReject">반려</button>
                <button class="btn-primary" @click="handleApprove">
                  <CheckCircle :size="14" /> 최종 승인
                </button>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Search, Filter, CheckCircle, FileText, User, ChevronRight, X, AlertCircle } from 'lucide-vue-next'
import { approvePerformance, getPerformanceApprovalItems, rejectPerformance } from '@/api/performance'

const activeTab = ref('plan')
const selectedItem = ref(null)
const modalTab = ref('detail')
const searchText = ref('')
const reviewComment = ref('')
const currentPage = ref(1)
const pageSize = 8
const currentDate = new Date()
const currentYear = currentDate.getFullYear()
const quarter = Math.floor(currentDate.getMonth() / 3)
const quarterStartMonth = quarter * 3
const periodStart = new Date(currentYear, quarterStartMonth, 1)
const periodEnd = new Date(currentYear, quarterStartMonth + 3, 0)
const pad2 = (value) => String(value).padStart(2, '0')
const formatDate = (date) => `${date.getFullYear()}.${pad2(date.getMonth() + 1)}.${pad2(date.getDate())}`
const approvalPeriodLabel = `${formatDate(periodStart)} ~ ${formatDate(periodEnd)}`

const planItems = ref([])
const resultItems = ref([])

const currentItems = computed(() => {
  const items = activeTab.value === 'plan' ? planItems.value : resultItems.value
  if (!searchText.value) return items
  return items.filter(
    (item) => item.user.includes(searchText.value) || item.title.includes(searchText.value),
  )
})

const totalPages = computed(() => Math.max(1, Math.ceil(currentItems.value.length / pageSize)))
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return currentItems.value.slice(start, start + pageSize)
})

const handleItemClick = (item) => {
  selectedItem.value = item
  modalTab.value = 'detail'
  reviewComment.value = ''
}

const removeItemById = (id) => {
  const source = activeTab.value === 'plan' ? planItems : resultItems
  source.value = source.value.filter((item) => item.id !== id)
}

const handleQuickApprove = async (item) => {
  if (!confirm(`${item.user}님의 항목을 승인하시겠습니까?`)) return
  try {
    await approvePerformance(item.id, null)
  } catch (_error) {
    alert('승인 처리에 실패했습니다.')
    return
  }
  removeItemById(item.id)
  alert('승인 처리되었습니다.')
}

const handleQuickReject = async (item) => {
  if (!confirm(`${item.user}님의 항목을 반려하시겠습니까?`)) return
  try {
    await rejectPerformance(item.id, null)
  } catch (_error) {
    alert('반려 처리에 실패했습니다.')
    return
  }
  removeItemById(item.id)
  alert('반려 처리되었습니다.')
}

const handleApprove = async () => {
  if (!selectedItem.value) return
  if (!confirm('최종 승인하시겠습니까?')) return
  try {
    await approvePerformance(selectedItem.value.id, reviewComment.value.trim() || null)
  } catch (_error) {
    alert('최종 승인에 실패했습니다.')
    return
  }
  removeItemById(selectedItem.value.id)
  selectedItem.value = null
  modalTab.value = 'detail'
  reviewComment.value = ''
  alert('최종 승인되었습니다.')
}

const handleReject = async () => {
  if (!selectedItem.value) return
  const reason = reviewComment.value.trim()
  if (!reason) {
    alert('반려 사유를 입력해주세요.')
    return
  }
  if (!confirm('반려 처리하시겠습니까?')) return
  try {
    await rejectPerformance(selectedItem.value.id, reason)
  } catch (_error) {
    alert('반려 처리에 실패했습니다.')
    return
  }
  removeItemById(selectedItem.value.id)
  selectedItem.value = null
  modalTab.value = 'detail'
  reviewComment.value = ''
  alert('반려 처리되었습니다.')
}

async function loadApprovalItems() {
  try {
    const response = await getPerformanceApprovalItems()
    planItems.value = Array.isArray(response?.planItems) ? response.planItems.map((item) => ({ ...item })) : []
    resultItems.value = Array.isArray(response?.resultItems) ? response.resultItems.map((item) => ({ ...item })) : []
  } catch (_error) {}
}

onMounted(loadApprovalItems)

watch([activeTab, searchText], () => {
  currentPage.value = 1
})

watch(currentItems, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
})
</script>

<style scoped>
/* ════════════════════════════════
   레이아웃
   ════════════════════════════════ */
.approval-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  height: 100%;
}

/* ════════════════════════════════
   상단 통계 카드
   ════════════════════════════════ */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: var(--radius);
  padding: 20px 24px;
  box-shadow: var(--shadow);
}

.stat-card--primary {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.stat-card--primary .stat-label {
  color: rgba(255, 255, 255, 0.8);
}

.stat-card--primary .stat-value {
  color: #fff;
}

.stat-card--primary .stat-unit {
  color: rgba(255, 255, 255, 0.7);
}

.stat-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--gray500);
  margin-bottom: 6px;
}

.stat-value {
  font-family: var(--font-num);
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--gray800);
}

.stat-unit {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--gray400);
  margin-left: 4px;
}

/* ════════════════════════════════
   메인 리스트 카드
   ════════════════════════════════ */
.list-card {
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 탭 */
.tab-bar {
  display: flex;
  border-bottom: 1px solid var(--gray100);
}

.tab-btn {
  flex: 1;
  padding: 14px 16px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--gray500);
  background: transparent;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all var(--transition);
}

.tab-btn:hover {
  color: var(--gray700);
  background: var(--gray50);
}

.tab-btn.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  background: var(--accent);
}

/* 툴바 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid var(--gray100);
  background: var(--gray50);
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.check-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--gray600);
  cursor: pointer;
}

.check-input {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  accent-color: var(--primary);
  cursor: pointer;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: var(--radius-xs);
  font-size: 0.82rem;
  color: var(--gray600);
  transition: all var(--transition);
}

.filter-btn:hover {
  border-color: var(--gray300);
  background: var(--gray50);
}

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: var(--gray400);
  pointer-events: none;
}

.search-input {
  width: 200px;
  padding: 7px 12px 7px 32px;
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: var(--radius-xs);
  font-size: 0.82rem;
  color: var(--gray700);
  transition: all var(--transition);
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--accent);
}

.search-input::placeholder {
  color: var(--gray400);
}

/* 리스트 본문 */
.list-body {
  flex: 1;
  overflow-y: auto;
}

.item-list {
  list-style: none;
}

.item-row {
  padding: 16px 20px;
  border-bottom: 1px solid var(--gray100);
  cursor: pointer;
  transition: background var(--transition);
}

.item-row:last-child {
  border-bottom: none;
}

.item-row:hover {
  background: var(--accent);
}

.item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  flex: 1;
}

.item-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--gray100);
  border: 1px solid var(--gray200);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray400);
  flex-shrink: 0;
}

.item-info {
  min-width: 0;
  flex: 1;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.item-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--gray800);
}

.item-dept {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--gray500);
  background: var(--gray100);
  padding: 2px 8px;
  border-radius: 8px;
}

.item-type {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 8px;
  border: 1px solid;
}

.type-team {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}

.type-individual {
  background: #f0fdf4;
  color: #16a34a;
  border-color: #bbf7d0;
}

.item-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--gray700);
  transition: color var(--transition);
}

.item-row:hover .item-title {
  color: var(--primary);
}

.item-sub {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 0.75rem;
  color: var(--gray400);
}

.item-divider {
  width: 1px;
  height: 10px;
  background: var(--gray300);
}

.item-achievement {
  font-weight: 700;
  color: var(--primary);
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.btn-reject {
  padding: 7px 16px;
  border-radius: var(--radius-xs);
  border: 1px solid #fecaca;
  color: var(--red);
  background: #fff;
  font-size: 0.82rem;
  font-weight: 600;
  transition: all var(--transition);
}

.btn-reject:hover {
  background: #fef2f2;
}

.btn-approve {
  padding: 7px 16px;
  border-radius: var(--radius-xs);
  color: #fff;
  background: var(--primary);
  font-size: 0.82rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(8, 145, 178, 0.25);
  transition: all var(--transition);
}

.btn-approve:hover {
  background: var(--primary-dark);
  box-shadow: 0 4px 14px rgba(8, 145, 178, 0.35);
}

.btn-arrow {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray300);
  background: transparent;
  transition: all var(--transition);
}

.btn-arrow:hover {
  color: var(--gray500);
  background: var(--gray100);
}

.item-empty {
  text-align: center;
  padding: 48px 20px;
  color: var(--gray400);
  font-size: 0.88rem;
}

.approval-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 14px 20px;
  border-top: 1px solid var(--gray100);
  background: #fff;
}

.page-btn {
  min-width: 64px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--gray200);
  border-radius: var(--radius-xs);
  background: var(--gray50);
  color: var(--gray700);
  font-size: 0.82rem;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.page-status {
  min-width: 52px;
  text-align: center;
  font-size: 0.82rem;
  color: var(--gray600);
}

/* ════════════════════════════════
   모달
   ════════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.modal-card {
  background: #fff;
  border-radius: var(--radius);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 680px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 헤더 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 28px 16px;
}

.modal-header-left {
  min-width: 0;
  flex: 1;
}

.modal-badges {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
}

.badge-blue {
  background: #dbeafe;
  color: #1e40af;
}

.badge-green {
  background: #dcfce7;
  color: #166534;
}

.badge-status {
  background: var(--accent);
  color: var(--primary);
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--gray800);
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray400);
  background: transparent;
  transition: all var(--transition);
  flex-shrink: 0;
}

.close-btn:hover {
  background: var(--gray100);
  color: var(--gray700);
}

/* 탭 */
.modal-tabs {
  display: flex;
  padding: 0 28px;
  border-bottom: 1px solid var(--gray200);
}

.modal-tab {
  padding: 10px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gray500);
  background: transparent;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all var(--transition);
}

.modal-tab:hover {
  color: var(--gray700);
}

.modal-tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

/* 본문 */
.modal-body {
  padding: 24px 28px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 상세 프로필 */
.detail-profile {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: var(--gray50);
  border-radius: var(--radius-sm);
  border: 1px solid var(--gray100);
}

.detail-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid var(--gray200);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray400);
  flex-shrink: 0;
}

.detail-profile-info {
  flex: 1;
}

.detail-profile-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--gray800);
}

.detail-profile-dept {
  font-size: 0.78rem;
  color: var(--gray500);
  margin-top: 1px;
}

.detail-profile-date {
  font-size: 0.78rem;
  color: var(--gray500);
  flex-shrink: 0;
}

/* 상세 그리드 */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--gray400);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.detail-value {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--gray700);
}

.detail-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  width: 120px;
  height: 7px;
  background: var(--gray100);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--primary);
  transition: width 0.5s ease;
}

.progress-pct {
  font-family: var(--font-num);
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--primary);
}

/* 상세 섹션 */
.detail-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-box {
  background: var(--gray50);
  border: 1px solid var(--gray100);
  border-radius: var(--radius-sm);
  padding: 16px 18px;
  font-size: 0.85rem;
  color: var(--gray700);
  line-height: 1.6;
}

.detail-box ul {
  padding-left: 18px;
  margin-top: 8px;
}

.detail-box li {
  list-style: disc;
  margin-bottom: 4px;
  color: var(--gray600);
}

.detail-box--result {
  background: var(--accent);
  border-color: var(--accent2);
  color: var(--primary-dark);
}

/* 경고 알림 */
.detail-alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  line-height: 1.5;
}

.detail-alert svg {
  flex-shrink: 0;
  margin-top: 1px;
}

.detail-alert.warn {
  background: #fefce8;
  border: 1px solid #fde68a;
  color: #92400e;
}

.detail-alert.warn strong {
  display: block;
  font-size: 0.82rem;
  margin-bottom: 2px;
}

.detail-alert.warn p {
  font-size: 0.78rem;
  margin-top: 2px;
}

/* 폼 요소 */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--gray700);
}

.form-textarea {
  width: 100%;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
  font-family: var(--font);
  color: var(--gray700);
  resize: none;
  transition: all var(--transition);
}

.form-textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--accent);
  outline: none;
}

.form-textarea::placeholder {
  color: var(--gray400);
}

/* 파일 카드 */
.file-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--gray200);
  border-radius: var(--radius-sm);
  padding: 14px 16px;
  transition: background var(--transition);
  cursor: pointer;
}

.file-card:hover {
  background: var(--gray50);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-xs);
  background: var(--gray100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray500);
}

.file-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gray800);
}

.file-size {
  font-size: 0.72rem;
  color: var(--gray400);
  margin-top: 1px;
}

.file-download {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--primary);
  background: transparent;
  transition: all var(--transition);
}

.file-download:hover {
  text-decoration: underline;
}

/* 모달 푸터 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 28px;
  border-top: 1px solid var(--gray100);
  background: var(--gray50);
}

.btn-outline {
  padding: 10px 22px;
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gray700);
  background: #fff;
  border: 1px solid var(--gray200);
  transition: all var(--transition);
}

.btn-outline:hover {
  background: var(--gray50);
  border-color: var(--gray300);
}

.btn-danger {
  padding: 10px 22px;
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--red);
  background: #fff;
  border: 1px solid #fecaca;
  transition: all var(--transition);
}

.btn-danger:hover {
  background: #fef2f2;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 22px;
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
  background: var(--primary);
  box-shadow: 0 2px 8px rgba(8, 145, 178, 0.25);
  transition: all var(--transition);
}

.btn-primary:hover {
  background: var(--primary-dark);
  box-shadow: 0 4px 14px rgba(8, 145, 178, 0.35);
}

/* ═══ 모달 애니메이션 ═══ */
.modal-enter-active { transition: all 0.25s ease; }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from { opacity: 0; }
.modal-leave-to { opacity: 0; }
.modal-enter-from .modal-card { transform: scale(0.95) translateY(10px); opacity: 0; }
.modal-leave-to .modal-card { transform: scale(0.97); opacity: 0; }
.modal-enter-active .modal-card { transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-leave-active .modal-card { transition: all 0.15s ease; }
</style>
