<template>
  <div class="peer-wrap">
    <!-- ═══ 좌측: 동료 목록 ═══ -->
    <div class="peer-sidebar">
      <div class="peer-sidebar-header">
        <h3 class="peer-sidebar-title">평가 대상</h3>
        <span class="peer-sidebar-count">{{ colleagues.length }}명</span>
      </div>
      <div v-if="peerReviewError" class="peer-error-banner">
        <span>{{ peerReviewError }}</span>
        <button type="button" class="page-btn" @click="loadPeerReviewTargets">다시 시도</button>
      </div>
      <div class="peer-list">
        <button
          v-for="c in paginatedColleagues"
          :key="c.id"
          class="peer-item"
          :class="{ active: selectedColleague?.id === c.id }"
          @click="selectColleague(c)"
        >
          <img :src="DEFAULT_AVATAR" :alt="`${c.name} 프로필`" class="peer-avatar" />
          <div class="peer-item-info">
            <span class="peer-item-name">{{ c.name }}</span>
            <span class="peer-item-team">{{ c.team }}</span>
          </div>
          <span v-if="c.evaluated" class="peer-done-badge">완료</span>
        </button>
      </div>
      <div v-if="colleagueTotalPages > 1" class="peer-pagination">
        <button class="page-btn" :disabled="colleagueCurrentPage === 1" @click="colleagueCurrentPage--">이전</button>
        <span class="page-status">{{ colleagueCurrentPage }} / {{ colleagueTotalPages }}</span>
        <button class="page-btn" :disabled="colleagueCurrentPage === colleagueTotalPages" @click="colleagueCurrentPage++">다음</button>
      </div>
      <div class="peer-sidebar-footer">
        <div class="peer-progress-label">
          <span>진행률</span>
          <span class="peer-progress-num">{{ evaluatedCount }}/{{ colleagues.length }}</span>
        </div>
        <div class="peer-progress-bar">
          <div class="peer-progress-fill" :style="{ width: `${progressPercent}%` }"></div>
        </div>
      </div>
    </div>

    <!-- ═══ 우측: 평가 폼 ═══ -->
    <div class="peer-main">
      <!-- 미선택 상태 -->
      <div v-if="!selectedColleague" class="peer-empty">
        <div class="peer-empty-icon">
          <Users :size="32" />
        </div>
        <h3 class="peer-empty-title">평가할 동료를 선택해주세요</h3>
        <p class="peer-empty-desc">왼쪽 목록에서 동료를 선택하면 평가를 시작할 수 있습니다.</p>
      </div>

      <!-- 선택됨: 평가 폼 -->
      <template v-else>
        <!-- 헤더 -->
        <div class="peer-form-header">
          <div class="peer-form-profile">
            <img :src="DEFAULT_AVATAR" :alt="`${selectedColleague.name} 프로필`" class="peer-form-avatar" />
            <div>
              <h2 class="peer-form-name">{{ selectedColleague.name }}<span>님에 대한 평가</span></h2>
              <p class="peer-form-meta">{{ selectedColleague.team }} · 평가 기간: 2023년 상반기</p>
            </div>
          </div>
          <div class="peer-anonymous-badge">
            <Shield :size="13" /> 익명 평가
          </div>
        </div>

        <!-- 평가 항목 -->
        <div class="peer-form-body">
          <div v-for="item in criteria" :key="item.id" class="criteria-row">
            <div class="criteria-label-wrap">
              <span class="criteria-label">{{ item.label }}</span>
              <span v-if="scores[item.id]" class="criteria-selected">{{ scores[item.id] }}점</span>
            </div>
            <div class="score-buttons">
              <button
                v-for="score in 5"
                :key="score"
                class="score-btn"
                :class="{
                  active: scores[item.id] === score,
                  filled: scores[item.id] >= score
                }"
                @click="scores[item.id] = score"
              >
                <span class="score-num">{{ score }}</span>
                <span class="score-label">{{ scoreLabels[score] }}</span>
              </button>
            </div>
          </div>

          <!-- 코멘트 -->
          <div class="comment-section">
            <label class="comment-label">
              <MessageSquare :size="14" /> 종합 코멘트 <span>(선택사항)</span>
            </label>
            <textarea
              v-model="comment"
              rows="4"
              class="comment-textarea"
              placeholder="동료의 장점이나 바라는 점을 자유롭게 작성해주세요."
            ></textarea>
          </div>
        </div>

        <!-- 푸터 -->
        <div class="peer-form-footer">
          <button class="btn-cancel" @click="resetForm">초기화</button>
          <button class="btn-submit" :disabled="!isFormValid || isSubmitting" @click="submitReview">
            <Send :size="14" /> {{ isSubmitting ? '제출 중...' : '평가 제출하기' }}
          </button>
        </div>
      </template>
    </div>

    <!-- ═══ 제출 완료 모달 ═══ -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-card">
            <div class="modal-icon-wrap">
              <div class="modal-icon">
                <CheckCircle2 :size="32" />
              </div>
            </div>
            <h3 class="modal-title">평가가 제출되었습니다</h3>
            <p class="modal-desc">
              <strong>{{ selectedColleague?.name }}</strong>님에 대한 평가가 익명으로 제출되었습니다.<br />
              소중한 피드백에 감사드립니다.
            </p>
            <div class="modal-actions">
              <button class="btn-modal-sub" @click="closeAndNext">다음 동료 평가</button>
              <button class="btn-modal-main" @click="closeModal">확인</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Users, Shield, MessageSquare, Send, CheckCircle2 } from 'lucide-vue-next'
import { getPeerReviewTargets, submitPeerReview } from '@/api/performance'

const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' rx='40' fill='%23eef2f7'/><circle cx='40' cy='31' r='14' fill='%2394a3b8'/><path d='M16 68c4-12 14-18 24-18s20 6 24 18' fill='%2394a3b8'/></svg>"

const colleagues = ref([])
const colleagueCurrentPage = ref(1)
const colleaguePageSize = 10

const evaluatedCount = computed(() => colleagues.value.filter((c) => c.evaluated).length)
const progressPercent = computed(() => {
  if (!colleagues.value.length) return 0
  const percent = (evaluatedCount.value / colleagues.value.length) * 100
  return Math.min(100, Math.max(0, percent))
})
const colleagueTotalPages = computed(() => Math.max(1, Math.ceil(colleagues.value.length / colleaguePageSize)))
const paginatedColleagues = computed(() => {
  const start = (colleagueCurrentPage.value - 1) * colleaguePageSize
  return colleagues.value.slice(start, start + colleaguePageSize)
})

const selectedColleague = ref(null)
const showModal = ref(false)
const comment = ref('')
const isSubmitting = ref(false)
const peerReviewError = ref('')

const scores = reactive({})
const scoreLabels = { 1: '미흡', 2: '부족', 3: '보통', 4: '우수', 5: '탁월' }

const criteria = [
  { id: 1, label: '협업 및 커뮤니케이션 능력' },
  { id: 2, label: '문제 해결 능력' },
  { id: 3, label: '책임감 및 자기 주도성' },
  { id: 4, label: '팀 기여도' },
  { id: 5, label: '조직 문화 기여도' },
]

const isFormValid = computed(() => criteria.every(c => scores[c.id]))

function markSelectedColleagueEvaluated() {
  if (!selectedColleague.value) return
  selectedColleague.value.evaluated = true
  const target = colleagues.value.find((colleague) => colleague.id === selectedColleague.value.id)
  if (target) target.evaluated = true
}

function selectColleague(c) {
  selectedColleague.value = c
  resetForm()
}

function resetForm() {
  criteria.forEach(c => { scores[c.id] = 0 })
  comment.value = ''
}

function closeModal() {
  showModal.value = false
}

async function submitReview() {
  if (isSubmitting.value) return
  if (!selectedColleague.value || !isFormValid.value) return

  try {
    isSubmitting.value = true
    await submitPeerReview({
      appraiseeId: selectedColleague.value.id,
      communicationScore: scores[1],
      solvingScore: scores[2],
      responsibilityScore: scores[3],
      teamContributionScore: scores[4],
      cultureContributionScore: scores[5],
      comment: comment.value,
    })
    markSelectedColleagueEvaluated()
    showModal.value = true
  } catch (_error) {
    alert('동료 평가 제출에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

function closeAndNext() {
  showModal.value = false
  const next = colleagues.value.find((c) => !c.evaluated)
  if (next) selectColleague(next)
  else selectedColleague.value = null
}

async function loadPeerReviewTargets() {
  try {
    peerReviewError.value = ''
    const response = await getPeerReviewTargets()
    colleagues.value = Array.isArray(response) ? response.map((item) => ({ ...item })) : []
    colleagueCurrentPage.value = 1
    const refreshedSelected = colleagues.value.find((item) => item.id === selectedColleague.value?.id)
    selectedColleague.value = refreshedSelected || null
  } catch (error) {
    console.error('Failed to load peer review targets.', error)
    peerReviewError.value = '평가 대상을 불러오지 못했습니다.'
    colleagues.value = []
    colleagueCurrentPage.value = 1
    selectedColleague.value = null
  }
}

onMounted(loadPeerReviewTargets)
</script>

<style scoped>
/* ════════════════════════════════
   레이아웃: 좌우 분할
   ════════════════════════════════ */
.peer-wrap {
  display: flex;
  gap: 16px;
  min-height: 0;
  height: 100%;
}

/* ════════════════════════════════
   좌측 사이드바: 동료 목록
   ════════════════════════════════ */
.peer-sidebar {
  width: 260px;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.peer-error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 16px;
  background: #fef2f2;
  color: #b91c1c;
  border-bottom: 1px solid #fecaca;
  font-size: 0.78rem;
}

.peer-sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--gray100);
}

.peer-sidebar-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--gray800);
}

.peer-sidebar-count {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--gray400);
  background: var(--gray100);
  padding: 2px 8px;
  border-radius: 8px;
}

.peer-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.peer-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px 16px 0;
}

.page-btn {
  min-width: 64px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--gray200);
  border-radius: var(--radius-xs);
  background: var(--gray50);
  color: var(--gray700);
  font-size: 0.78rem;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.page-status {
  min-width: 52px;
  text-align: center;
  font-size: 0.78rem;
  color: var(--gray600);
}

.peer-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--radius-xs);
  background: transparent;
  text-align: left;
  transition: all var(--transition);
  margin-bottom: 2px;
}

.peer-item:hover {
  background: var(--gray50);
}

.peer-item.active {
  background: var(--accent);
  box-shadow: inset 3px 0 0 var(--primary);
}

.peer-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--gray200);
  flex-shrink: 0;
}

.peer-item-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.peer-item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gray800);
}

.peer-item-team {
  font-size: 0.7rem;
  color: var(--gray400);
}

.peer-done-badge {
  font-size: 0.65rem;
  font-weight: 700;
  color: #22c55e;
  background: #dcfce7;
  padding: 2px 8px;
  border-radius: 8px;
  flex-shrink: 0;
}

/* 진행률 */
.peer-sidebar-footer {
  padding: 14px 20px;
  border-top: 1px solid var(--gray100);
}

.peer-progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: var(--gray500);
  margin-bottom: 6px;
}

.peer-progress-num {
  font-family: var(--font-num);
  font-weight: 700;
  color: var(--primary);
}

.peer-progress-bar {
  width: 100%;
  height: 5px;
  background: var(--gray100);
  border-radius: 3px;
  overflow: hidden;
}

.peer-progress-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--primary);
  transition: width 0.4s ease;
}

/* ════════════════════════════════
   우측: 메인 영역
   ════════════════════════════════ */
.peer-main {
  flex: 1;
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

/* 빈 상태 */
.peer-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
}

.peer-empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--gray50);
  color: var(--gray300);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.peer-empty-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--gray700);
  margin-bottom: 6px;
}

.peer-empty-desc {
  font-size: 0.82rem;
  color: var(--gray400);
}

/* ═══ 폼 헤더 ═══ */
.peer-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--gray100);
  background: var(--accent);
}

.peer-form-profile {
  display: flex;
  align-items: center;
  gap: 14px;
}

.peer-form-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--gray200);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.peer-form-name {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--gray800);
}

.peer-form-name span {
  font-weight: 500;
  color: var(--gray500);
  margin-left: 2px;
}

.peer-form-meta {
  font-size: 0.78rem;
  color: var(--gray400);
  margin-top: 2px;
}

.peer-anonymous-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--primary);
  background: #fff;
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid var(--accent2);
}

/* ═══ 폼 바디 ═══ */
.peer-form-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 평가 항목 */
.criteria-row {
  padding-bottom: 20px;
  border-bottom: 1px solid var(--gray100);
}

.criteria-row:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.criteria-label-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.criteria-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gray800);
}

.criteria-selected {
  font-family: var(--font-num);
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--primary);
  background: var(--accent);
  padding: 2px 10px;
  border-radius: 8px;
}

.score-buttons {
  display: flex;
  gap: 8px;
}

.score-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: transparent;
  transition: all 0.2s ease;
}

.score-num {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--gray200);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-num);
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--gray400);
  transition: all 0.2s ease;
}

.score-btn:hover .score-num {
  border-color: var(--secondary);
  color: var(--secondary);
  background: var(--accent);
}

.score-btn.active .score-num {
  border-color: var(--primary);
  background: var(--primary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(8, 145, 178, 0.3);
}

.score-btn.filled:not(.active) .score-num {
  border-color: var(--accent2);
  background: var(--accent);
  color: var(--primary);
}

.score-label {
  font-size: 0.62rem;
  color: var(--gray400);
  min-height: 14px;
}

.score-btn.active .score-label {
  color: var(--primary);
  font-weight: 600;
}

/* 코멘트 */
.comment-section {
  margin-top: 4px;
}

.comment-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--gray800);
  margin-bottom: 10px;
}

.comment-label svg {
  color: var(--gray400);
}

.comment-label span {
  font-weight: 400;
  color: var(--gray400);
  font-size: 0.78rem;
}

.comment-textarea {
  width: 100%;
  padding: 14px 16px;
  background: var(--gray50);
  border: 1px solid var(--gray200);
  border-radius: var(--radius-xs);
  font-size: 0.88rem;
  font-family: var(--font);
  color: var(--gray700);
  resize: none;
  transition: all var(--transition);
}

.comment-textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--accent);
  background: #fff;
  outline: none;
}

.comment-textarea::placeholder {
  color: var(--gray400);
}

/* ═══ 폼 푸터 ═══ */
.peer-form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--gray100);
}

.btn-cancel {
  padding: 10px 22px;
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gray600);
  background: var(--gray100);
  transition: all var(--transition);
}

.btn-cancel:hover {
  background: var(--gray200);
}

.btn-submit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
  background: var(--primary);
  box-shadow: 0 2px 8px rgba(8, 145, 178, 0.25);
  transition: all var(--transition);
}

.btn-submit:hover:not(:disabled) {
  background: var(--primary-dark);
  box-shadow: 0 4px 14px rgba(8, 145, 178, 0.35);
}

.btn-submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
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
  max-width: 420px;
  padding: 36px 32px 28px;
  text-align: center;
}

.modal-icon-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
}

.modal-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #f0fdf4;
  color: #22c55e;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--gray800);
  margin-bottom: 8px;
}

.modal-desc {
  font-size: 0.82rem;
  color: var(--gray500);
  line-height: 1.6;
  margin-bottom: 24px;
}

.modal-desc strong {
  color: var(--gray700);
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.btn-modal-sub {
  flex: 1;
  padding: 11px;
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
  font-weight: 600;
  background: var(--gray100);
  color: var(--gray600);
  transition: all var(--transition);
}

.btn-modal-sub:hover {
  background: var(--gray200);
}

.btn-modal-main {
  flex: 1;
  padding: 11px;
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
  font-weight: 700;
  background: var(--primary);
  color: #fff;
  transition: all var(--transition);
}

.btn-modal-main:hover {
  background: var(--primary-dark);
}

/* 모달 애니메이션 */
.modal-enter-active { transition: all 0.25s ease; }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from { opacity: 0; }
.modal-leave-to { opacity: 0; }
.modal-enter-from .modal-card { transform: scale(0.95) translateY(10px); opacity: 0; }
.modal-leave-to .modal-card { transform: scale(0.97); opacity: 0; }
.modal-enter-active .modal-card { transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-leave-active .modal-card { transition: all 0.15s ease; }
</style>
