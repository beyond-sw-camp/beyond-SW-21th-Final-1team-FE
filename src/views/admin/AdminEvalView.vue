<template>
  <section class="admin-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">인사고과 관리</h1>
        <p class="page-desc">팀별 팀원을 선택하여 인사고과 점수를 등록하고 평가 내역을 확인합니다.</p>
      </div>
    </header>

    <section v-if="pageLoading" class="loading-card">
      <div class="loading-spinner"></div>
      <strong>팀 목록을 불러오는 중입니다.</strong>
    </section>

    <section v-else class="workspace">
      <!-- ══════════ 왼쪽 패널 ══════════ -->
      <article class="list-panel">
        <!-- 팀 목록 -->
        <div class="panel-head">
          <div>
            <h3>팀 목록</h3>
            <p>팀을 선택하면 팀원이 조회됩니다.</p>
          </div>
        </div>

        <div v-if="teams.length === 0" class="empty-state">팀이 없습니다.</div>
        <div v-else class="team-chips">
          <button
            v-for="team in teams"
            :key="team.orgId"
            type="button"
            class="team-chip"
            :class="{ active: selectedTeamId === team.orgId }"
            @click="selectTeam(team)"
          >
            {{ team.name }}
            <span class="chip-count">{{ team.memberCount }}</span>
          </button>
        </div>

        <!-- 팀원 목록 -->
        <template v-if="selectedTeam">
          <div class="panel-divider"></div>
          <div class="panel-head">
            <div>
              <h3>{{ selectedTeam.name }} 팀원</h3>
              <p>팀원을 선택하여 고과를 입력합니다.</p>
            </div>
          </div>

          <div v-if="membersLoading" class="sub-loading">
            <div class="loading-spinner loading-spinner--sm"></div>
            <span>팀원 불러오는 중...</span>
          </div>
          <div v-else-if="members.length === 0" class="empty-state">
            팀원이 없습니다.
          </div>
          <div v-else class="member-list">
            <button
              v-for="member in members"
              :key="member.employeeId"
              type="button"
              class="member-card"
              :class="{ active: selectedMember?.employeeId === member.employeeId }"
              @click="selectMember(member)"
            >
              <div class="member-avatar">{{ member.name?.[0] ?? '?' }}</div>
              <div class="member-info">
                <strong>{{ member.name }}</strong>
                <span>{{ member.position || member.jobTitle || '-' }}</span>
              </div>
              <div v-if="member.hasFinalScore" class="score-badge">
                {{ member.finalGrade }}
              </div>
            </button>
          </div>
        </template>
      </article>

      <!-- ══════════ 오른쪽 패널 ══════════ -->
      <article class="editor-panel">
        <!-- 미선택 상태 -->
        <div v-if="!selectedMember" class="empty-editor">
          <div class="empty-editor-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <p>왼쪽에서 팀과 팀원을 선택해주세요.</p>
        </div>

        <!-- 팀원 선택 후 -->
        <div v-else class="editor-content">
          <!-- 멤버 헤더 -->
          <div class="member-header">
            <div class="member-header-avatar">{{ selectedMember.name?.[0] ?? '?' }}</div>
            <div>
              <h2>{{ selectedMember.name }}</h2>
              <p>{{ selectedTeam?.name }} · {{ selectedMember.position || selectedMember.jobTitle || '-' }}</p>
            </div>
          </div>

          <!-- 인사고과 등급 입력 -->
          <div class="score-card">
            <div class="score-card-head">
              <strong>인사고과 등급 등록</strong>
              <span class="score-range-hint">S · A · B · C · D</span>
            </div>

            <div v-if="evalLoading" class="sub-loading">
              <div class="loading-spinner loading-spinner--sm"></div>
              <span>평가 데이터 불러오는 중...</span>
            </div>

            <template v-else>
              <div class="grade-select-row">
                <button
                  v-for="g in gradeGuide"
                  :key="g.label"
                  type="button"
                  class="grade-btn"
                  :class="[`grade-btn--${g.label.toLowerCase()}`, { active: selectedGrade === g.label }]"
                  @click="selectedGrade = g.label"
                >
                  <span class="grade-btn-label">{{ g.label }}</span>
                  <span class="grade-btn-range">{{ g.range }}</span>
                </button>
              </div>

              <div class="score-actions">
                <button
                  type="button"
                  class="btn-primary"
                  :disabled="saving || !selectedGrade"
                  @click="saveScore"
                >
                  {{ saving ? '저장 중...' : '고과 저장' }}
                </button>
                <span v-if="saveSuccess" class="save-feedback">저장되었습니다.</span>
                <span v-if="saveError" class="save-feedback save-feedback--error">{{ saveError }}</span>
              </div>
            </template>
          </div>

          <!-- 평가 상세 -->
          <template v-if="!evalLoading && evalData">
            <div class="eval-section-head">
              <h4>평가 상세 내역</h4>
            </div>
            <div class="eval-grid">
              <div class="eval-card">
                <div class="eval-card-icon eval-card-icon--team">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div class="eval-card-body">
                  <span class="eval-card-label">팀원 평가</span>
                  <strong class="eval-card-score">{{ evalData.teamEvalScore ?? '-' }}<small v-if="evalData.teamEvalScore != null">점</small></strong>
                  <span class="eval-card-sub">평가자 직접 평가</span>
                </div>
              </div>

              <div class="eval-card">
                <div class="eval-card-icon eval-card-icon--peer">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
                  </svg>
                </div>
                <div class="eval-card-body">
                  <span class="eval-card-label">동료 평가</span>
                  <strong class="eval-card-score">{{ evalData.peerReviewScore ?? '-' }}<small v-if="evalData.peerReviewScore != null">점</small></strong>
                  <span class="eval-card-sub">동료 피어리뷰 평균</span>
                </div>
              </div>

              <div class="eval-card">
                <div class="eval-card-icon eval-card-icon--system">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/>
                  </svg>
                </div>
                <div class="eval-card-body">
                  <span class="eval-card-label">시스템 점수</span>
                  <strong class="eval-card-score">{{ evalData.systemScore ?? '-' }}<small v-if="evalData.systemScore != null">점</small></strong>
                  <span class="eval-card-sub">성과 달성률 기반</span>
                </div>
              </div>
            </div>

            <!-- 가중 평균 미리보기 -->
            <div v-if="weightedAvg !== null" class="weighted-preview">
              <span class="weighted-label">산출 평균</span>
              <span class="weighted-value">{{ weightedAvg.toFixed(1) }}점</span>
              <span class="weighted-hint">(등록 점수와 다를 수 있습니다)</span>
            </div>
          </template>
        </div>
      </article>
    </section>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  getAdminEvalTeams,
  getAdminEvalMembers,
  getAdminEvalData,
  saveAdminEvalScore,
} from '@/api/performance'

// ─── 팀 목록 ────────────────────────────────
const pageLoading = ref(false)
const teams = ref([])
const selectedTeamId = ref(null)
const selectedTeam = computed(() => teams.value.find((t) => t.orgId === selectedTeamId.value) || null)

async function loadTeams() {
  pageLoading.value = true
  try {
    const res = await getAdminEvalTeams()
    teams.value = Array.isArray(res) ? res : []
  } catch (_e) {
    teams.value = []
  } finally {
    pageLoading.value = false
  }
}

function selectTeam(team) {
  selectedTeamId.value = team.orgId
  selectedMember.value = null
  evalData.value = null
}

// ─── 팀원 목록 ────────────────────────────────
const membersLoading = ref(false)
const members = ref([])

async function loadMembers(orgId) {
  membersLoading.value = true
  members.value = []
  try {
    const res = await getAdminEvalMembers(orgId)
    members.value = Array.isArray(res) ? res : []
  } catch (_e) {
    members.value = []
  } finally {
    membersLoading.value = false
  }
}

watch(selectedTeamId, (id) => {
  if (id) loadMembers(id)
})

// ─── 팀원 선택 ────────────────────────────────
const selectedMember = ref(null)
const evalLoading = ref(false)
const evalData = ref(null)
const selectedGrade = ref(null)
const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')

async function selectMember(member) {
  selectedMember.value = member
  saveSuccess.value = false
  saveError.value = ''
  evalLoading.value = true
  evalData.value = null
  selectedGrade.value = null
  try {
    const res = await getAdminEvalData(member.employeeId)
    evalData.value = res || null
    selectedGrade.value = res?.finalGrade ?? null
  } catch (_e) {
    evalData.value = null
    selectedGrade.value = null
  } finally {
    evalLoading.value = false
  }
}

async function saveScore() {
  if (saving.value || !selectedMember.value || !selectedGrade.value) return
  saving.value = true
  saveSuccess.value = false
  saveError.value = ''
  try {
    await saveAdminEvalScore(selectedMember.value.employeeId, selectedGrade.value)
    saveSuccess.value = true
    const m = members.value.find((m) => m.employeeId === selectedMember.value.employeeId)
    if (m) { m.hasFinalScore = true; m.finalGrade = selectedGrade.value }
    if (evalData.value) evalData.value.finalGrade = selectedGrade.value
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (e) {
    saveError.value = e?.response?.data?.error?.message || '저장에 실패했습니다.'
  } finally {
    saving.value = false
  }
}

// ─── 등급 가이드 ────────────────────────────────
const gradeGuide = [
  { label: 'S', range: '90-100점' },
  { label: 'A', range: '80-89점' },
  { label: 'B', range: '70-79점' },
  { label: 'C', range: '60-69점' },
  { label: 'D', range: '59점 이하' },
]

const weightedAvg = computed(() => {
  if (!evalData.value) return null
  const { teamEvalScore, peerReviewScore, systemScore } = evalData.value
  const scores = [teamEvalScore, peerReviewScore, systemScore].filter((v) => v != null)
  if (!scores.length) return null
  return scores.reduce((a, b) => a + b, 0) / scores.length
})

// ─── 초기화 ────────────────────────────────
loadTeams()
</script>

<style scoped>
/* ──── 공통 레이아웃 (AdminPerformanceView 동일 패턴) ──── */
.admin-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  min-height: 0;
  height: 100%;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--gray900);
  margin: 0 0 4px;
}

.page-desc {
  font-size: 0.84rem;
  color: var(--gray500);
  margin: 0;
}

/* 로딩 */
.loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 24px;
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: var(--radius);
  color: var(--gray600);
  font-size: 0.9rem;
}

.loading-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--gray200);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

.loading-spinner--sm {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* 워크스페이스 */
.workspace {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
  min-height: 0;
  flex: 1;
  align-items: start;
}

/* ──── 왼쪽 패널 ──── */
.list-panel {
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.panel-head {
  padding: 16px 16px 8px;
}

.panel-head h3 {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--gray800);
  margin: 0 0 2px;
}

.panel-head p {
  font-size: 0.76rem;
  color: var(--gray400);
  margin: 0;
}

.panel-divider {
  height: 1px;
  background: var(--gray100);
  margin: 8px 0;
}

.empty-state {
  padding: 20px 16px;
  text-align: center;
  font-size: 0.8rem;
  color: var(--gray400);
}

/* ──── 팀 칩 ──── */
.team-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 12px 12px;
}

.team-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid var(--gray200);
  background: #fff;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--gray700);
  cursor: pointer;
  transition: all var(--transition);
}

.team-chip:hover {
  background: var(--gray50);
  border-color: var(--gray300);
}

.team-chip.active {
  background: #f0fbff;
  border-color: var(--primary);
  color: var(--primary);
}

.chip-count {
  font-size: 0.7rem;
  font-weight: 700;
  background: var(--gray100);
  color: var(--gray500);
  padding: 1px 6px;
  border-radius: 10px;
  line-height: 1.5;
}

.team-chip.active .chip-count {
  background: rgba(8, 145, 178, 0.12);
  color: var(--primary);
}

/* ──── 팀원 카드 ──── */
.member-list {
  padding: 0 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.member-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: var(--radius-xs);
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: all var(--transition);
}

.member-card:hover {
  background: var(--gray50);
  border-color: var(--gray200);
}

.member-card.active {
  background: #f0fbff;
  border-color: var(--primary);
}

.member-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--gray200);
  color: var(--gray600);
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.member-card.active .member-avatar {
  background: rgba(8, 145, 178, 0.15);
  color: var(--primary);
}

.member-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.member-info strong {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--gray800);
}

.member-info span {
  font-size: 0.72rem;
  color: var(--gray400);
}

.score-badge {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--primary);
  background: rgba(8, 145, 178, 0.1);
  padding: 2px 7px;
  border-radius: 8px;
  white-space: nowrap;
}

.sub-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 0.8rem;
  color: var(--gray400);
}

/* ──── 오른쪽 패널 ──── */
.editor-panel {
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  min-height: 500px;
}

.empty-editor {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  height: 400px;
  color: var(--gray300);
}

.empty-editor-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: var(--gray50);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-editor p {
  font-size: 0.86rem;
  color: var(--gray400);
  margin: 0;
}

.editor-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ──── 멤버 헤더 ──── */
.member-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--gray100);
}

.member-header-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(8, 145, 178, 0.12);
  color: var(--primary);
  font-size: 1.3rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.member-header h2 {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--gray900);
  margin: 0 0 4px;
}

.member-header p {
  font-size: 0.82rem;
  color: var(--gray500);
  margin: 0;
}

/* ──── 점수 입력 카드 ──── */
.score-card {
  background: var(--gray50);
  border: 1px solid var(--gray200);
  border-radius: var(--radius);
  padding: 20px;
}

.score-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.score-card-head strong {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--gray800);
}

.score-range-hint {
  font-size: 0.76rem;
  color: var(--gray400);
  font-weight: 600;
}

.grade-select-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.grade-btn {
  flex: 1;
  min-width: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border-radius: 12px;
  border: 2px solid var(--gray200);
  background: #fff;
  cursor: pointer;
  transition: all var(--transition);
}

.grade-btn:hover {
  border-color: var(--gray400);
  background: var(--gray50);
}

.grade-btn-label {
  font-size: 1.3rem;
  font-weight: 900;
  color: var(--gray500);
  line-height: 1;
  transition: color var(--transition);
}

.grade-btn-range {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--gray400);
  transition: color var(--transition);
}

.grade-btn--s.active { border-color: #7c3aed; background: #f5f3ff; }
.grade-btn--s.active .grade-btn-label { color: #7c3aed; }
.grade-btn--s.active .grade-btn-range { color: #a78bfa; }

.grade-btn--a.active { border-color: #0891b2; background: #f0fbff; }
.grade-btn--a.active .grade-btn-label { color: #0891b2; }
.grade-btn--a.active .grade-btn-range { color: #38bdf8; }

.grade-btn--b.active { border-color: #16a34a; background: #f0fdf4; }
.grade-btn--b.active .grade-btn-label { color: #16a34a; }
.grade-btn--b.active .grade-btn-range { color: #4ade80; }

.grade-btn--c.active { border-color: #d97706; background: #fffbeb; }
.grade-btn--c.active .grade-btn-label { color: #d97706; }
.grade-btn--c.active .grade-btn-range { color: #fbbf24; }

.grade-btn--d.active { border-color: #dc2626; background: #fef2f2; }
.grade-btn--d.active .grade-btn-label { color: #dc2626; }
.grade-btn--d.active .grade-btn-range { color: #f87171; }

.score-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.btn-primary {
  height: 38px;
  padding: 0 20px;
  border-radius: 9px;
  background: var(--primary);
  color: #fff;
  font-size: 0.86rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: filter var(--transition);
}

.btn-primary:hover { filter: brightness(0.95); }
.btn-primary:disabled { opacity: 0.55; cursor: default; }

.save-feedback {
  font-size: 0.82rem;
  font-weight: 600;
  color: #16a34a;
}

.save-feedback--error { color: #dc2626; }

/* ──── 평가 상세 ──── */
.eval-section-head h4 {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--gray700);
  margin: 0;
}

.eval-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.eval-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: var(--gray50);
  border: 1px solid var(--gray100);
  border-radius: var(--radius);
}

.eval-card-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.eval-card-icon--team  { background: #eff6ff; color: #3b82f6; }
.eval-card-icon--peer  { background: #f0fdf4; color: #22c55e; }
.eval-card-icon--system{ background: #faf5ff; color: #a855f7; }

.eval-card-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.eval-card-label {
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--gray500);
}

.eval-card-score {
  font-size: 1.4rem;
  font-weight: 900;
  color: var(--gray800);
  line-height: 1.1;
}

.eval-card-score small {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--gray500);
}

.eval-card-sub {
  font-size: 0.7rem;
  color: var(--gray400);
}

/* ──── 가중 평균 미리보기 ──── */
.weighted-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(8, 145, 178, 0.05);
  border: 1px solid rgba(8, 145, 178, 0.2);
  border-radius: var(--radius);
}

.weighted-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gray600);
}

.weighted-value {
  font-size: 1rem;
  font-weight: 800;
  color: var(--primary);
}

.weighted-hint {
  font-size: 0.74rem;
  color: var(--gray400);
  margin-left: auto;
}

@media (max-width: 900px) {
  .workspace {
    grid-template-columns: 1fr;
  }
  .eval-grid {
    grid-template-columns: 1fr;
  }
}
</style>
