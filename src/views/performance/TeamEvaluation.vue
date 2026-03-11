<template>
  <div class="eval-wrap">
    <!-- ═══ 좌측: 팀원 목록 ═══ -->
    <div class="eval-sidebar">
      <div class="eval-sidebar-header">
        <h3 class="eval-sidebar-title">팀원 목록</h3>
        <p class="eval-sidebar-desc">평가할 팀원을 선택해주세요.</p>
      </div>
      <div v-if="teamLoadError" class="eval-load-error">
        <span>{{ teamLoadError }}</span>
        <button type="button" class="page-btn" @click="loadTeamEvaluationTargets">다시 시도</button>
      </div>
      <div class="eval-list">
        <button
          v-for="member in paginatedTeamMembers"
          :key="member.id"
          class="eval-item"
          :class="{ active: selectedMemberId === member.id }"
          @click="selectedMemberId = member.id"
        >
          <div class="eval-item-avatar-wrap">
            <img :src="member.image" :alt="member.name" class="eval-item-avatar" />
            <span
              class="eval-item-dot"
              :class="{
                'dot-done': member.status === '완료',
                'dot-progress': member.status === '진행 중',
                'dot-wait': member.status === '평가 대기',
              }"
            ></span>
          </div>
          <div class="eval-item-info">
            <span class="eval-item-name">{{ member.name }}</span>
            <span class="eval-item-role">{{ member.role }} · {{ member.department }}</span>
          </div>
          <span
            class="eval-item-badge"
            :class="{
              'badge-done': member.status === '완료',
              'badge-progress': member.status === '진행 중',
            }"
          >
            {{ member.status }}
          </span>
        </button>
      </div>
      <div v-if="teamMemberTotalPages > 1" class="eval-pagination">
        <button class="page-btn" :disabled="teamMemberCurrentPage === 1" @click="teamMemberCurrentPage--">이전</button>
        <span class="page-status">{{ teamMemberCurrentPage }} / {{ teamMemberTotalPages }}</span>
        <button class="page-btn" :disabled="teamMemberCurrentPage === teamMemberTotalPages" @click="teamMemberCurrentPage++">다음</button>
      </div>
      <div class="eval-sidebar-footer">
        <div class="eval-progress-label">
          <span>평가 진행률</span>
          <span class="eval-progress-num">{{ completedCount }}/{{ teamMembers.length }}</span>
        </div>
        <div class="eval-progress-bar">
          <div class="eval-progress-fill" :style="{ width: (completedCount / teamMembers.length * 100) + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- ═══ 우측: 평가 폼 ═══ -->
    <div class="eval-main">
      <template v-if="selectedMember">
        <!-- 폼 헤더 -->
        <div class="eval-form-header">
          <div class="eval-form-profile">
            <img :src="selectedMember.image" :alt="selectedMember.name" class="eval-form-avatar" />
            <div>
              <h2 class="eval-form-name">{{ selectedMember.name }}<span>님 평가</span></h2>
              <p class="eval-form-meta">{{ selectedMember.role }} | {{ selectedMember.department }}</p>
            </div>
          </div>
          <div class="eval-form-actions">
            <div class="system-score">
              시스템 평가점수 <strong>{{ selectedMember.systemScore }}점</strong>
            </div>
            <button class="btn-save" @click="handleTempSave">임시 저장</button>
            <button class="btn-submit" :disabled="isSubmitting || selectedMember.status === '완료'" @click="handleSubmitEvaluation">
              <Send :size="14" /> {{ isSubmitting ? '제출 중...' : '평가 제출' }}
            </button>
          </div>
        </div>

        <!-- 폼 본문 -->
        <div class="eval-form-body">
          <div class="eval-form-inner">
            <div
              v-for="criteria in evaluationCriteria"
              :key="criteria.id"
              class="criteria-card"
            >
              <div class="criteria-header">
                <div>
                  <h3 class="criteria-title">
                    {{ criteria.label }}
                    <span v-if="getScore(criteria.id) > 0" class="criteria-score">
                      ({{ getScore(criteria.id) }}점)
                    </span>
                  </h3>
                  <p class="criteria-peer-avg">동료평균 {{ getCriteriaPeerAverageText(criteria.id) }}점</p>
                  <p class="criteria-desc">{{ criteria.description }}</p>
                </div>
                <div class="star-buttons">
                  <button
                    v-for="score in 5"
                    :key="score"
                    class="star-btn"
                    :class="{ active: getScore(criteria.id) >= score }"
                    @click="handleScoreChange(criteria.id, score)"
                  >
                    <Star :size="18" :class="{ 'star-filled': getScore(criteria.id) >= score }" />
                  </button>
                </div>
              </div>
              <textarea
                v-model="currentForm.comments[criteria.id]"
                :placeholder="`${criteria.label}에 대한 구체적인 피드백을 작성해주세요.`"
                rows="3"
                class="criteria-textarea"
                @input="markInProgress(selectedMemberId)"
              ></textarea>
            </div>

            <!-- 안내 알림 -->
            <div class="eval-notice">
              <div class="eval-notice-icon">
                <User :size="14" />
              </div>
              <div>
                <p class="eval-notice-title">평가 시 유의사항</p>
                <p class="eval-notice-desc">
                  객관적인 사실에 근거하여 평가를 진행해 주시기 바랍니다. 작성된 내용은 인사평가의 중요한 자료로 활용됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 미선택 상태 -->
      <div v-else class="eval-empty">
        <div class="eval-empty-icon">
          <User :size="32" />
        </div>
        <h3 class="eval-empty-title">평가할 팀원을 선택해주세요</h3>
        <p class="eval-empty-desc">왼쪽 목록에서 팀원을 선택하면 평가를 시작할 수 있습니다.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { User, Star, Send } from 'lucide-vue-next'
import { getTeamEvaluationTargets, submitTeamEvaluation } from '@/api/performance'

const selectedMemberId = ref(null)
const evaluationForms = reactive({})
const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' rx='40' fill='%23eef2f7'/><circle cx='40' cy='31' r='14' fill='%2394a3b8'/><path d='M16 68c4-12 14-18 24-18s20 6 24 18' fill='%2394a3b8'/></svg>"

const teamMembers = ref([])
const teamMemberCurrentPage = ref(1)
const teamMemberPageSize = 10
const isSubmitting = ref(false)
const teamLoadError = ref('')

const evaluationCriteria = [
  { id: 'performance', label: '업무 성과', description: '목표 달성도 및 업무의 질적/양적 성과' },
  { id: 'attitude', label: '업무 태도', description: '책임감, 성실성 및 업무에 임하는 자세' },
  { id: 'collaboration', label: '협업 능력', description: '팀원과의 소통 및 협력적인 태도' },
  { id: 'creativity', label: '창의성과 문제 해결 능력', description: '새로운 아이디어 제안 및 문제 해결 역량' },
]

const selectedMember = computed(() => teamMembers.value.find((m) => m.id === selectedMemberId.value))
const completedCount = computed(() => teamMembers.value.filter((m) => m.status === '완료').length)
const teamMemberTotalPages = computed(() => Math.max(1, Math.ceil(teamMembers.value.length / teamMemberPageSize)))
const paginatedTeamMembers = computed(() => {
  const start = (teamMemberCurrentPage.value - 1) * teamMemberPageSize
  return teamMembers.value.slice(start, start + teamMemberPageSize)
})
const peerReviewAverageText = computed(() => Number(selectedMember.value?.peerReviewScore || 0).toFixed(1))
const getCriteriaPeerAverageText = (criteriaId) =>
  Number(selectedMember.value?.peerCriteriaAverages?.[criteriaId] || 0).toFixed(1)

const getMemberForm = (memberId) => {
  if (!evaluationForms[memberId]) {
    evaluationForms[memberId] = {
      scores: {},
      comments: {},
      savedAt: '',
    }
  }
  return evaluationForms[memberId]
}

const currentForm = computed(() => getMemberForm(selectedMemberId.value))

const markInProgress = (memberId) => {
  const target = teamMembers.value.find((member) => member.id === memberId)
  if (!target || target.status === '완료') return
  if (target.status === '평가 대기') target.status = '진행 중'
}

const handleScoreChange = (criteriaId, score) => {
  currentForm.value.scores[criteriaId] = score
  markInProgress(selectedMemberId.value)
}

const getScore = (criteriaId) => {
  return currentForm.value.scores[criteriaId] || 0
}

const handleTempSave = () => {
  const form = currentForm.value
  const hasScore = Object.values(form.scores).some((score) => Number(score) > 0)
  const hasComment = Object.values(form.comments).some((comment) => String(comment || '').trim().length > 0)
  if (!hasScore && !hasComment) {
    alert('임시 저장할 평가 내용이 없습니다.')
    return
  }
  form.savedAt = new Date().toISOString()
  markInProgress(selectedMemberId.value)
  alert('평가 내용이 임시 저장되었습니다.')
}

const handleSubmitEvaluation = async () => {
  if (isSubmitting.value) return
  if (!selectedMember.value) return
  if (selectedMember.value.status === '완료') {
    alert('이미 제출된 팀평가입니다.')
    return
  }
  const form = currentForm.value
  const hasAllScores = evaluationCriteria.every((criteria) => {
    const score = Number(form.scores[criteria.id] || 0)
    return score >= 1 && score <= 5
  })
  if (!hasAllScores) {
    alert('모든 평가 항목의 점수를 1점에서 5점 사이로 입력해주세요.')
    return
  }
  if (!confirm(`${selectedMember.value.name}님 평가를 제출하시겠습니까?`)) return

  try {
    isSubmitting.value = true
    await submitTeamEvaluation({
      appraiseeId: selectedMember.value.id,
      performanceScore: Number(form.scores.performance || 0),
      performanceComment: form.comments.performance || '',
      attitudeScore: Number(form.scores.attitude || 0),
      attitudeComment: form.comments.attitude || '',
      collaborationScore: Number(form.scores.collaboration || 0),
      collaborationComment: form.comments.collaboration || '',
      creativityScore: Number(form.scores.creativity || 0),
      creativityComment: form.comments.creativity || '',
    })
  } catch (_error) {
    alert('평가 제출에 실패했습니다.')
    return
  } finally {
    isSubmitting.value = false
  }

  const target = teamMembers.value.find((member) => member.id === selectedMemberId.value)
  if (target) target.status = '완료'
  form.savedAt = new Date().toISOString()
  alert('평가가 제출되었습니다.')
}

async function loadTeamEvaluationTargets() {
  try {
    teamLoadError.value = ''
    const response = await getTeamEvaluationTargets()
    const members = Array.isArray(response)
      ? response.map((member) => ({
          ...member,
          image: DEFAULT_AVATAR,
        }))
      : []
    teamMembers.value = members
    teamMemberCurrentPage.value = 1
    selectedMemberId.value = members[0]?.id ?? null
  } catch (error) {
    console.error('Failed to load team evaluation targets.', error)
    teamLoadError.value = '팀원 목록을 불러오지 못했습니다.'
  }
}

onMounted(loadTeamEvaluationTargets)
</script>

<style scoped>
/* ════════════════════════════════
   레이아웃: 좌우 분할
   ════════════════════════════════ */
.eval-wrap {
  display: flex;
  gap: 16px;
  min-height: 0;
  height: 100%;
}

/* ════════════════════════════════
   좌측 사이드바: 팀원 목록
   ════════════════════════════════ */
.eval-sidebar {
  width: 280px;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.eval-sidebar-header {
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--gray100);
}

.eval-sidebar-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--gray800);
}

.eval-sidebar-desc {
  font-size: 0.75rem;
  color: var(--gray400);
  margin-top: 4px;
}

.eval-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.eval-pagination {
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

/* 팀원 아이템 */
.eval-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--radius-xs);
  background: transparent;
  text-align: left;
  border: 1px solid transparent;
  transition: all var(--transition);
  margin-bottom: 2px;
}

.eval-item:hover {
  background: var(--gray50);
  border-color: var(--gray100);
}

.eval-item.active {
  background: var(--accent);
  border-color: var(--accent2);
  box-shadow: inset 3px 0 0 var(--primary);
}

.eval-item-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.eval-item-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.eval-item-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #fff;
}

.dot-done { background: var(--green); }
.dot-progress { background: var(--yellow); }
.dot-wait { background: var(--gray300); }

.eval-item-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.eval-item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gray800);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.eval-item.active .eval-item-name {
  color: var(--primary-dark);
  font-weight: 700;
}

.eval-item-role {
  font-size: 0.7rem;
  color: var(--gray400);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.eval-item-badge {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 8px;
  flex-shrink: 0;
  background: var(--gray100);
  color: var(--gray500);
}

.badge-done {
  background: #dcfce7;
  color: #166534;
}

.badge-progress {
  background: #fef9c3;
  color: #a16207;
}

/* 진행률 */
.eval-sidebar-footer {
  padding: 14px 20px;
  border-top: 1px solid var(--gray100);
}

.eval-progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: var(--gray500);
  margin-bottom: 6px;
}

.eval-progress-num {
  font-family: var(--font-num);
  font-weight: 700;
  color: var(--primary);
}

.eval-progress-bar {
  width: 100%;
  height: 5px;
  background: var(--gray100);
  border-radius: 3px;
  overflow: hidden;
}

.eval-progress-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--primary);
  transition: width 0.4s ease;
}

/* ════════════════════════════════
   우측: 메인 영역
   ════════════════════════════════ */
.eval-main {
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
.eval-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
}

.eval-empty-icon {
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

.eval-empty-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--gray700);
  margin-bottom: 6px;
}

.eval-empty-desc {
  font-size: 0.82rem;
  color: var(--gray400);
}

/* ═══ 폼 헤더 ═══ */
.eval-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--gray100);
  background: var(--accent);
}

.eval-form-profile {
  display: flex;
  align-items: center;
  gap: 14px;
}

.eval-form-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.eval-form-name {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--gray800);
}

.eval-form-name span {
  font-weight: 500;
  color: var(--gray500);
  margin-left: 2px;
}

.eval-form-meta {
  font-size: 0.78rem;
  color: var(--gray400);
  margin-top: 2px;
}

.eval-form-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.system-score {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: var(--radius-xs);
  background: #f8fafc;
  border: 1px solid var(--gray200);
  color: var(--gray600);
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}

.system-score strong {
  color: var(--primary-dark);
  font-family: var(--font-num);
}

.btn-save {
  padding: 9px 18px;
  border-radius: var(--radius-xs);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--gray600);
  background: #fff;
  border: 1px solid var(--gray200);
  transition: all var(--transition);
}

.btn-save:hover {
  background: var(--gray50);
  border-color: var(--gray300);
}

.btn-submit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: var(--radius-xs);
  font-size: 0.82rem;
  font-weight: 700;
  color: #fff;
  background: var(--primary);
  box-shadow: 0 2px 8px rgba(8, 145, 178, 0.25);
  transition: all var(--transition);
}

.btn-submit:hover {
  background: var(--primary-dark);
  box-shadow: 0 4px 14px rgba(8, 145, 178, 0.35);
}

/* ═══ 폼 본문 ═══ */
.eval-form-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.eval-form-inner {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.peer-score-summary {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  width: fit-content;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid var(--accent2);
  background: var(--accent);
  font-size: 0.7rem;
  color: var(--gray600);
}

.peer-score-summary strong {
  color: var(--primary-dark);
  font-family: var(--font-num);
}

/* 평가 항목 카드 */
.criteria-card {
  background: #fff;
  border: 1px solid var(--gray100);
  border-radius: var(--radius-sm);
  padding: 20px;
  transition: border-color var(--transition);
}

.criteria-card:hover {
  border-color: var(--accent2);
}

.criteria-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 14px;
}

.criteria-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--gray800);
}

.criteria-score {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--primary);
}

.criteria-desc {
  font-size: 0.78rem;
  color: var(--gray400);
  margin-top: 3px;
}

.criteria-peer-avg {
  font-size: 0.72rem;
  color: var(--primary);
  margin-top: 3px;
}

/* 별점 버튼 */
.star-buttons {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.star-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray50);
  color: var(--gray300);
  transition: all 0.2s ease;
}

.star-btn:hover {
  background: var(--gray100);
  color: var(--gray400);
}

.star-btn.active {
  background: var(--accent);
  color: var(--primary);
  transform: scale(1.08);
}

.star-filled {
  fill: currentColor;
}

/* 피드백 입력 */
.criteria-textarea {
  width: 100%;
  padding: 12px 14px;
  background: var(--gray50);
  border: 1px solid transparent;
  border-radius: var(--radius-xs);
  font-size: 0.85rem;
  font-family: var(--font);
  color: var(--gray700);
  resize: none;
  transition: all var(--transition);
}

.criteria-textarea:focus {
  background: #fff;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--accent);
  outline: none;
}

.criteria-textarea::placeholder {
  color: var(--gray400);
}

/* 안내 알림 */
.eval-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 18px;
  background: var(--accent);
  border: 1px solid var(--accent2);
  border-radius: var(--radius-sm);
}

.eval-notice-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #fff;
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.eval-notice-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin-bottom: 3px;
}

.eval-notice-desc {
  font-size: 0.78rem;
  color: var(--secondary);
  line-height: 1.5;
}
</style>
