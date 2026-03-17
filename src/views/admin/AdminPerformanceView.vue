<template>
  <section class="admin-page">
    <header class="page-header">
      <div>
        <h1 class="page-title">성과 시스템 관리</h1>
        <p class="page-desc">팀별 팀 성과 · 개인 성과 반영 비율을 설정합니다. 두 비율의 합은 항상 100%입니다.</p>
      </div>
    </header>

    <section v-if="loading" class="loading-card">
      <div class="loading-spinner"></div>
      <strong>성과 반영 비율을 불러오는 중입니다.</strong>
      <p>조직 정보와 저장된 팀별 비율을 조회하고 있습니다.</p>
    </section>

    <section v-else class="workspace">
      <article class="list-panel">
        <div class="panel-head">
          <div>
            <h3>팀 목록</h3>
            <p>조직도 기준 팀 단위로 반영 비율을 관리합니다.</p>
          </div>
        </div>

        <div class="list-controls">
          <label class="search-field">
            <span>팀 검색</span>
            <input
              v-model.trim="searchKeyword"
              type="text"
              placeholder="팀명 또는 조직 경로 검색"
            />
          </label>

          <label class="filter-field">
            <span>표시 조건</span>
            <select v-model="filterMode">
              <option value="ALL">전체 팀</option>
              <option value="CUSTOMIZED">설정 저장 팀</option>
              <option value="CHANGED">변경된 팀</option>
            </select>
          </label>
        </div>

        <div v-if="filteredTeams.length === 0" class="empty-state">
          검색 조건에 맞는 팀이 없습니다.
        </div>

        <div v-else class="team-list">
          <button
            v-for="team in filteredTeams"
            :key="team.orgId"
            type="button"
            class="team-card"
            :class="{ active: isSelected(team.orgId) }"
            @click="selectTeam(team.orgId)"
          >
            <div class="team-card-top">
              <strong>{{ team.name }}</strong>
              <span class="state-chip" :class="stateClass(team)">
                {{ stateLabel(team) }}
              </span>
            </div>

            <p class="team-path">{{ team.path }}</p>

            <div class="ratio-bar" aria-hidden="true">
              <span class="ratio-segment ratio-segment--team" :style="{ width: `${team.teamWeightRate}%` }"></span>
              <span class="ratio-segment ratio-segment--personal" :style="{ width: `${team.personalWeightRate}%` }"></span>
            </div>

            <div class="team-meta">
              <span>팀 {{ team.teamWeightRate }}%</span>
              <span>개인 {{ team.personalWeightRate }}%</span>
            </div>
          </button>
        </div>
      </article>

      <article class="editor-panel">
        <div v-if="selectedTeam" class="editor-content">
          <div class="panel-head panel-head--editor">
            <div>
              <p class="team-type">{{ selectedTeam.typeLabel }}</p>
              <h3>{{ selectedTeam.name }}</h3>
              <p>{{ selectedTeam.path }}</p>
            </div>
            <div class="editor-side-note">
              <span>최근 저장</span>
              <strong>{{ formatUpdatedAt(selectedTeam.updatedAt) }}</strong>
            </div>
          </div>

          <div class="preview-card">
            <div class="preview-head">
              <strong>현재 반영 구조</strong>
              <span>합계 100%</span>
            </div>
            <div class="preview-bar" aria-hidden="true">
              <span
                class="preview-segment preview-segment--team"
                :style="{ width: `${selectedTeam.teamWeightRate}%` }"
              >
                팀 {{ selectedTeam.teamWeightRate }}%
              </span>
              <span
                class="preview-segment preview-segment--personal"
                :style="{ width: `${selectedTeam.personalWeightRate}%` }"
              >
                개인 {{ selectedTeam.personalWeightRate }}%
              </span>
            </div>
          </div>

          <div class="field-grid">
            <label class="ratio-field">
              <div class="field-head">
                <span>팀 성과 반영 비율</span>
                <input
                  class="number-input"
                  type="number"
                  min="0"
                  max="100"
                  :value="selectedTeam.teamWeightRate"
                  @input="updateTeamRate(selectedTeam.orgId, $event.target.value)"
                />
              </div>
              <input
                class="range-input range-input--team"
                type="range"
                min="0"
                max="100"
                :value="selectedTeam.teamWeightRate"
                @input="updateTeamRate(selectedTeam.orgId, $event.target.value)"
              />
            </label>

            <label class="ratio-field">
              <div class="field-head">
                <span>개인 성과 반영 비율</span>
                <input
                  class="number-input"
                  type="number"
                  min="0"
                  max="100"
                  :value="selectedTeam.personalWeightRate"
                  @input="updatePersonalRate(selectedTeam.orgId, $event.target.value)"
                />
              </div>
              <input
                class="range-input range-input--personal"
                type="range"
                min="0"
                max="100"
                :value="selectedTeam.personalWeightRate"
                @input="updatePersonalRate(selectedTeam.orgId, $event.target.value)"
              />
            </label>
          </div>

          <div class="preset-block">
            <span class="preset-label">빠른 적용</span>
            <div class="preset-actions">
              <button type="button" class="preset-btn" @click="applyPreset(40)">팀 60 / 개인 40</button>
              <button type="button" class="preset-btn" @click="applyPreset(50)">팀 50 / 개인 50</button>
              <button type="button" class="preset-btn" @click="applyPreset(60)">팀 40 / 개인 60</button>
              <button type="button" class="preset-btn" @click="applyPreset(70)">팀 30 / 개인 70</button>
            </div>
          </div>

          <div class="guide-card">
            <div class="guide-head">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <strong>운영 기준</strong>
            </div>
            <p>팀 반영 비율이 높을수록 팀 단위 성과 기여도가, 개인 반영 비율이 높을수록 개인 목표 달성도가 최종 점수에 더 크게 반영됩니다.</p>
          </div>

          <div class="editor-actions">
            <button type="button" class="btn-ghost" @click="resetSelectedToDefault">
              50:50 기본값
            </button>
            <button
              type="button"
              class="btn-ghost"
              :disabled="!isTeamChanged(selectedTeam)"
              @click="revertSelectedTeam"
            >
              선택 팀 되돌리기
            </button>
            <button
              type="button"
              class="btn-primary"
              :disabled="saving || !isTeamChanged(selectedTeam)"
              @click="saveSelectedTeam"
            >
              {{ saving ? '저장 중...' : '선택 팀 저장' }}
            </button>
          </div>
        </div>

        <div v-else class="empty-state empty-state--editor">
          팀을 선택하면 성과 반영 비율을 수정할 수 있습니다.
        </div>
      </article>
    </section>

    <div v-if="toastMessage" class="toast">{{ toastMessage }}</div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getOrganizationTree } from '@/api/hr'
import {
  getAdminPerformanceWeights,
  saveAdminPerformanceWeights,
} from '@/api/performance'

const DEFAULT_PERSONAL_RATE = 50
const DEFAULT_TEAM_RATE = 50

const ORG_TYPE_LABEL = {
  COMPANY: '회사',
  HEADQUARTER: '본부',
  HEADQUARTERS: '본부',
  CENTER: '센터',
  DIVISION: '실',
  DEPARTMENT: '부서',
  PART: '파트',
  TEAM: '팀',
}

const loading = ref(false)
const saving = ref(false)
const teamSettings = ref([])
const selectedOrgId = ref('')
const searchKeyword = ref('')
const filterMode = ref('ALL')
const persistenceSource = ref('api')
const toastMessage = ref('')
let toastTimer = null

const normalize = (value) => String(value || '').trim().toLowerCase()

const clampRate = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) return 0
  return Math.min(100, Math.max(0, Math.round(number)))
}

const normalizeTreeNode = (node) => {
  if (!node) return null
  const children = Array.isArray(node.children)
    ? node.children.map(normalizeTreeNode).filter(Boolean)
    : []

  return {
    id: node.orgId ?? node.id,
    parentId: node.parentOrgId ?? node.parentId ?? null,
    name: node.orgName ?? node.name,
    type: node.orgType ?? node.type,
    typeLabel: ORG_TYPE_LABEL[node.orgType ?? node.type] || node.orgType || node.type || '-',
    level: Number(node.orgLevel || node.level || 0),
    sortOrder: Number(node.sortOrder || node.order || 0),
    memberCount: Number(node.memberCount || 0),
    children,
  }
}

const sortNodes = (nodes = []) => {
  nodes.sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
    if (a.level !== b.level) return a.level - b.level
    return String(a.name || '').localeCompare(String(b.name || ''), 'ko')
  })
  nodes.forEach((node) => {
    sortNodes(node.children)
  })
}

const buildTreeFromFlat = (rows) => {
  const normalized = (Array.isArray(rows) ? rows : [])
    .map((item) => normalizeTreeNode(item))
    .filter((item) => item?.id != null)
  if (!normalized.length) return null

  const nodeMap = new Map(normalized.map((node) => [node.id, { ...node, children: [] }]))

  for (const node of nodeMap.values()) {
    if (node.parentId == null || node.parentId === node.id) continue
    const parent = nodeMap.get(node.parentId)
    if (parent) parent.children.push(node)
  }

  const roots = [...nodeMap.values()].filter(
    (node) => node.parentId == null || node.parentId === node.id || !nodeMap.has(node.parentId),
  )

  sortNodes(roots)

  if (roots.length === 1) return roots[0]
  return {
    id: 'org-root',
    parentId: null,
    name: '전체 조직',
    type: 'COMPANY',
    typeLabel: '회사',
    level: 0,
    sortOrder: 0,
    memberCount: 0,
    children: roots,
  }
}

const normalizeOrganizationTree = (raw) => {
  if (Array.isArray(raw)) {
    const hasNestedChildren = raw.some(
      (item) => Array.isArray(item?.children) && item.children.length > 0,
    )
    if (!hasNestedChildren) {
      return buildTreeFromFlat(raw)
    }
    const roots = raw.map((item) => normalizeTreeNode(item)).filter(Boolean)
    sortNodes(roots)
    if (roots.length === 1) return roots[0]
    return {
      id: 'org-root',
      parentId: null,
      name: '전체 조직',
      type: 'COMPANY',
      typeLabel: '회사',
      level: 0,
      sortOrder: 0,
      memberCount: 0,
      children: roots,
    }
  }
  return normalizeTreeNode(raw)
}

const extractTeams = (node, ancestors = [], bucket = []) => {
  if (!node) return bucket
  const isSyntheticRoot = String(node.id) === 'org-root'
  const nextAncestors = isSyntheticRoot ? ancestors : [...ancestors, node.name]
  const hasChildren = Array.isArray(node.children) && node.children.length > 0
  const isTeamNode =
    !isSyntheticRoot &&
    (node.type === 'TEAM' || (!hasChildren && node.type !== 'COMPANY'))

  if (isTeamNode) {
    bucket.push({
      orgId: Number(node.id),
      name: node.name,
      path: nextAncestors.join(' / '),
      typeLabel: node.typeLabel,
      sortOrder: node.sortOrder,
      level: node.level,
    })
  }

  ;(node.children || []).forEach((child) => {
    extractTeams(child,nextAncestors,bucket)
  })
  return bucket
}

const buildTeamSettings = (root, weightItems = []) => {
  const savedMap = new Map(
    (Array.isArray(weightItems) ? weightItems : []).map((item) => [String(item.orgId), item]),
  )

  return extractTeams(root)
    .filter((item) => Number.isFinite(item.orgId) && item.orgId > 0)
    .sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
      return String(a.path).localeCompare(String(b.path), 'ko')
    })
    .map((team) => {
      const saved = savedMap.get(String(team.orgId))
      const personalWeightRate = clampRate(saved?.personalWeightRate ?? DEFAULT_PERSONAL_RATE)
      const teamWeightRate = clampRate(saved?.teamWeightRate ?? (100 - personalWeightRate))
      const normalizedTeamRate =
        personalWeightRate + teamWeightRate === 100 ? teamWeightRate : 100 - personalWeightRate

      return {
        orgId: team.orgId,
        name: team.name,
        path: team.path,
        typeLabel: team.typeLabel,
        personalWeightRate,
        teamWeightRate: normalizedTeamRate,
        savedPersonalWeightRate: personalWeightRate,
        savedTeamWeightRate: normalizedTeamRate,
        updatedAt: saved?.updatedAt || null,
      }
    })
}

const isTeamChanged = (team) =>
  team.personalWeightRate !== team.savedPersonalWeightRate
  || team.teamWeightRate !== team.savedTeamWeightRate

const isTeamCustomized = (team) =>
  team.savedPersonalWeightRate !== DEFAULT_PERSONAL_RATE
  || team.savedTeamWeightRate !== DEFAULT_TEAM_RATE

const filteredTeams = computed(() => {
  const keyword = normalize(searchKeyword.value)
  return teamSettings.value.filter((team) => {
    const matchesKeyword =
      !keyword || normalize(`${team.name} ${team.path}`).includes(keyword)
    if (!matchesKeyword) return false
    if (filterMode.value === 'CHANGED') return isTeamChanged(team)
    if (filterMode.value === 'CUSTOMIZED') return isTeamCustomized(team)
    return true
  })
})

const selectedTeam = computed(
  () => teamSettings.value.find((team) => String(team.orgId) === String(selectedOrgId.value)) || null,
)

const pendingCount = computed(() => teamSettings.value.filter((team) => isTeamChanged(team)).length)
const customizedCount = computed(
  () => teamSettings.value.filter((team) => isTeamCustomized(team)).length,
)
const averageTeamRate = computed(() => {
  if (!teamSettings.value.length) return 0
  const total = teamSettings.value.reduce((sum, team) => sum + team.teamWeightRate, 0)
  return Math.round(total / teamSettings.value.length)
})
const hasPendingChanges = computed(() => pendingCount.value > 0)

const persistenceSourceLabel = computed(() =>
  persistenceSource.value === 'api' ? '서버 저장 연결' : '브라우저 임시 저장',
)

const kpiCards = computed(() => [
  {
    label: '관리 대상 팀',
    value: `${teamSettings.value.length}개`,
    note: '조직도 기준 팀 단위',
  },
  {
    label: '저장된 커스텀 설정',
    value: `${customizedCount.value}개`,
    note: '기본값 50:50 제외',
  },
  {
    label: '평균 팀 반영 비율',
    value: `${averageTeamRate.value}%`,
    note: '전체 팀 평균',
  },
  {
    label: '미저장 변경',
    value: `${pendingCount.value}건`,
    note: '저장 전 임시 변경 사항',
  },
])

watch(
  filteredTeams,
  (teams) => {
    if (!teams.length) {
      selectedOrgId.value = ''
      return
    }
    const exists = teams.some((team) => String(team.orgId) === String(selectedOrgId.value))
    if (!exists) {
      selectedOrgId.value = String(teams[0].orgId)
    }
  },
  { immediate: true },
)

const showToast = (message) => {
  toastMessage.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 2400)
}

const mergeSavedItems = (savedItems = []) => {
  const savedMap = new Map(
    (Array.isArray(savedItems) ? savedItems : []).map((item) => [String(item.orgId), item]),
  )
  teamSettings.value = teamSettings.value.map((team) => {
    const saved = savedMap.get(String(team.orgId))
    if (!saved) return team
    const personalWeightRate = clampRate(saved.personalWeightRate ?? team.personalWeightRate)
    const teamWeightRate = clampRate(saved.teamWeightRate ?? (100 - personalWeightRate))
    const normalizedTeamRate =
      personalWeightRate + teamWeightRate === 100 ? teamWeightRate : 100 - personalWeightRate
    return {
      ...team,
      personalWeightRate,
      teamWeightRate: normalizedTeamRate,
      savedPersonalWeightRate: personalWeightRate,
      savedTeamWeightRate: normalizedTeamRate,
      updatedAt: saved.updatedAt || new Date().toISOString(),
    }
  })
}

const loadPageData = async () => {
  loading.value = true
  try {
    const [orgTreeRaw, weightResult] = await Promise.all([
      getOrganizationTree(),
      getAdminPerformanceWeights(),
    ])
    const root = normalizeOrganizationTree(orgTreeRaw)
    teamSettings.value = buildTeamSettings(root, weightResult.items)
    persistenceSource.value = weightResult.source
  } catch (error) {
    teamSettings.value = []
    window.alert(error?.response?.data?.error?.message || '성과 반영 비율을 불러오지 못했습니다.')
  } finally {
    loading.value = false
  }
}

const updateTeamRate = (orgId, value) => {
  const target = teamSettings.value.find((team) => String(team.orgId) === String(orgId))
  if (!target) return
  const nextTeamRate = clampRate(value)
  target.teamWeightRate = nextTeamRate
  target.personalWeightRate = 100 - nextTeamRate
}

const updatePersonalRate = (orgId, value) => {
  const target = teamSettings.value.find((team) => String(team.orgId) === String(orgId))
  if (!target) return
  const nextPersonalRate = clampRate(value)
  target.personalWeightRate = nextPersonalRate
  target.teamWeightRate = 100 - nextPersonalRate
}

const applyPreset = (personalRate) => {
  if (!selectedTeam.value) return
  updatePersonalRate(selectedTeam.value.orgId, personalRate)
}

const resetSelectedToDefault = () => {
  if (!selectedTeam.value) return
  updatePersonalRate(selectedTeam.value.orgId, DEFAULT_PERSONAL_RATE)
}

const revertSelectedTeam = () => {
  if (!selectedTeam.value) return
  selectedTeam.value.personalWeightRate = selectedTeam.value.savedPersonalWeightRate
  selectedTeam.value.teamWeightRate = selectedTeam.value.savedTeamWeightRate
}

const revertAllChanges = () => {
  teamSettings.value = teamSettings.value.map((team) => ({
    ...team,
    personalWeightRate: team.savedPersonalWeightRate,
    teamWeightRate: team.savedTeamWeightRate,
  }))
}

const persistChanges = async (items, successMessage) => {
  if (!items.length) return
  saving.value = true
  try {
    const result = await saveAdminPerformanceWeights(
      items.map((item) => ({
        orgId: item.orgId,
        personalWeightRate: item.personalWeightRate,
        teamWeightRate: item.teamWeightRate,
      })),
    )
    persistenceSource.value = result.source
    mergeSavedItems(result.items)
    showToast(successMessage)
  } catch (error) {
    window.alert(error?.response?.data?.error?.message || '성과 반영 비율 저장에 실패했습니다.')
  } finally {
    saving.value = false
  }
}

const saveSelectedTeam = async () => {
  if (!selectedTeam.value || !isTeamChanged(selectedTeam.value)) return
  await persistChanges([selectedTeam.value], `${selectedTeam.value.name} 비율을 저장했습니다.`)
}

const saveAllChanges = async () => {
  const changedItems = teamSettings.value.filter((team) => isTeamChanged(team))
  if (!changedItems.length) return
  await persistChanges(changedItems, `${changedItems.length}개 팀의 비율을 저장했습니다.`)
}

const selectTeam = (orgId) => {
  selectedOrgId.value = String(orgId)
}

const isSelected = (orgId) => String(orgId) === String(selectedOrgId.value)

const stateLabel = (team) => {
  if (isTeamChanged(team)) return '변경됨'
  if (isTeamCustomized(team)) return '저장됨'
  return '기본값'
}

const stateClass = (team) => {
  if (isTeamChanged(team)) return 'state-chip--changed'
  if (isTeamCustomized(team)) return 'state-chip--customized'
  return 'state-chip--default'
}

const formatUpdatedAt = (value) => {
  if (!value) return '미저장'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '미저장'
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

onMounted(loadPageData)

onBeforeUnmount(() => {
  if (toastTimer) clearTimeout(toastTimer)
})
</script>

<style scoped>
.admin-page {
  width: 100%;
  max-width: none;
  min-width: 0;
}

.page-header {
  padding: 4px 2px 20px;
  border-bottom: 1px solid var(--gray100);
}

.page-title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--gray900);
}

.page-desc {
  margin: 6px 0 0;
  font-size: 0.875rem;
  color: var(--gray500);
}

.loading-card,
.list-panel,
.editor-panel {
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: 20px;
  box-shadow: var(--shadow);
}

.loading-card {
  margin-top: 16px;
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--gray100);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 4px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-card strong {
  display: block;
  color: var(--gray800);
  font-size: 0.95rem;
}

.loading-card p {
  margin: 0;
  color: var(--gray500);
  font-size: 0.85rem;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(340px, 420px) minmax(0, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.list-panel,
.editor-panel {
  padding: 20px;
  min-height: 640px;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--gray100);
}

.panel-head h3 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--gray900);
}

.panel-head p {
  margin: 4px 0 0;
  color: var(--gray500);
  font-size: 0.83rem;
}

.list-controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 148px;
  gap: 10px;
  margin-top: 18px;
}

.search-field,
.filter-field,
.ratio-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-field span,
.filter-field span,
.preset-label,
.field-head span {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--gray600);
}

.search-field input,
.filter-field select,
.number-input {
  height: 42px;
  border: 1px solid var(--gray200);
  border-radius: 12px;
  padding: 0 12px;
  background: #fff;
  color: var(--gray800);
}

.team-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
  max-height: 520px;
  overflow: auto;
  padding-right: 4px;
}

.team-list::-webkit-scrollbar { width: 4px; }
.team-list::-webkit-scrollbar-thumb { background: var(--gray200); border-radius: 99px; }

.team-card {
  width: 100%;
  text-align: left;
  padding: 14px 16px;
  border: 1.5px solid var(--gray100);
  border-radius: 14px;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  cursor: pointer;
}

.team-card:hover {
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(8, 145, 178, 0.1);
  transform: translateY(-1px);
}

.team-card.active {
  border-color: var(--primary);
  background: #f0fbff;
  box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.12);
}

.team-card-top,
.team-meta,
.preview-head,
.field-head,
.editor-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.team-card-top strong {
  color: var(--gray800);
  font-size: 0.98rem;
}

.team-path {
  margin: 8px 0 0;
  font-size: 0.82rem;
  line-height: 1.45;
  color: var(--gray500);
}

.ratio-bar,
.preview-bar {
  display: flex;
  width: 100%;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
}

.ratio-bar {
  height: 10px;
  margin-top: 14px;
}

.preview-bar {
  height: 44px;
  margin-top: 12px;
}

.ratio-segment,
.preview-segment {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ratio-segment--team,
.preview-segment--team {
  background: var(--primary);
}

.ratio-segment--personal,
.preview-segment--personal {
  background: #a5d8e6;
}

.preview-segment {
  min-width: 0;
  font-size: 0.82rem;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
}

.team-meta {
  margin-top: 10px;
  font-size: 0.8rem;
  color: var(--gray600);
}

.state-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
}

.state-chip--default {
  color: var(--gray400);
  background: var(--gray100);
}

.state-chip--customized {
  color: var(--primary);
  background: #e0f5f9;
}

.state-chip--changed {
  color: #b45309;
  background: #fef3c7;
}

.panel-head--editor {
  border-bottom: 1px solid var(--gray100);
  padding-bottom: 16px;
  margin-bottom: 0;
}

.team-type {
  margin: 0 0 6px;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--primary);
  text-transform: uppercase;
}

.editor-side-note {
  text-align: right;
}

.editor-side-note span {
  display: block;
  font-size: 0.75rem;
  color: var(--gray500);
}

.editor-side-note strong {
  display: block;
  margin-top: 6px;
  color: var(--gray700);
  font-size: 0.86rem;
}

.preview-card {
  margin-top: 18px;
  padding: 18px;
  border-radius: 14px;
  border: 1px solid var(--gray100);
  background: #F8FAFC;
}

.guide-card {
  margin-top: 18px;
  padding: 16px 18px;
  border-radius: 14px;
  border: 1px solid #cdeef5;
  background: #f0fbff;
}

.guide-head {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--primary);
  margin-bottom: 8px;
}

.guide-head strong {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--primary);
}

.preview-head strong {
  color: var(--gray800);
  font-size: 0.88rem;
}

.preview-head span,
.guide-card p {
  color: var(--gray500);
  font-size: 0.83rem;
}

.guide-card p {
  color: var(--gray600);
  margin: 0;
  font-size: 0.83rem;
  line-height: 1.6;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.ratio-field {
  padding: 16px;
  border-radius: 14px;
  border: 1.5px solid var(--gray100);
  background: #fff;
  transition: border-color 0.15s;
}

.ratio-field:first-child {
  border-top: 2px solid var(--primary);
}

.ratio-field:last-child {
  border-top: 2px solid #a5d8e6;
}

.ratio-field:hover {
  border-color: var(--gray200);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.number-input {
  width: 88px;
  text-align: right;
  font-family: var(--font-num);
}

.range-input {
  width: 100%;
  accent-color: var(--primary);
}

.range-input--personal {
  accent-color: #a5d8e6;
}

.preset-block {
  margin-top: 18px;
}

.preset-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.preset-btn {
  height: 34px;
  padding: 0 14px;
  border: 1.5px solid var(--gray200);
  border-radius: 999px;
  background: #fff;
  color: var(--gray600);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.preset-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: #f0fbff;
}

.guide-card p {
  margin: 10px 0 0;
  line-height: 1.6;
}

.editor-actions {
  margin-top: 18px;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.btn-primary,
.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  padding: 0 16px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn-primary {
  background: var(--primary);
  color: #fff;
  border: 1.5px solid var(--primary);
  box-shadow: 0 2px 6px rgba(8, 145, 178, 0.25);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
  border-color: var(--primary-dark);
  box-shadow: 0 4px 10px rgba(8, 145, 178, 0.3);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-ghost {
  background: #fff;
  color: var(--gray700);
  border: 1.5px solid var(--gray200);
}

.btn-ghost:hover:not(:disabled) {
  background: var(--gray50);
  border-color: var(--gray300);
  color: var(--gray900);
}

.btn-ghost:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  border: 1px dashed var(--gray300);
  border-radius: 18px;
  margin-top: 14px;
  color: var(--gray500);
  background: #f8fafc;
}

.empty-state--editor {
  min-height: 100%;
  margin-top: 0;
}

.toast {
  position: fixed;
  right: 28px;
  bottom: 28px;
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.92);
  color: #fff;
  font-size: 0.86rem;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.24);
  z-index: 40;
}

@media (max-width: 1180px) {
  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .workspace {
    grid-template-columns: 1fr;
  }

  .list-panel,
  .editor-panel {
    min-height: auto;
  }
}

@media (max-width: 760px) {
  .list-controls,
  .field-grid {
    grid-template-columns: 1fr;
  }

  .preview-bar {
    height: auto;
    flex-direction: column;
  }

  .preview-segment {
    min-height: 40px;
    justify-content: flex-start;
    padding: 0 14px;
  }
}
</style>
