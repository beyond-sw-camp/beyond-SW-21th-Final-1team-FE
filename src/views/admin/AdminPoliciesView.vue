<template>
  <section class="admin-page">
    <article class="card">
      <div class="card-head">
        <h3>인사 정책 관리</h3>
        <button class="btn-primary" type="button" @click="openCreateModal">정책 추가</button>
      </div>

      <div class="policy-grid">
        <article v-for="policy in hrPolicies" :key="policy.id" class="policy-card">
          <div class="policy-top">
            <strong>{{ policy.name }}</strong>
            <span class="type-chip">{{ policy.policyType }}</span>
          </div>
          <p class="meta">현재 버전: <strong>{{ policy.version }}</strong></p>
          <p class="meta">적용일: <span class="font-num">{{ policy.effectiveDate }}</span></p>
          <p class="meta">결재: 전자결재 상신 후 승인 시 반영</p>
          <p class="content" :title="policy.content">{{ policy.content }}</p>

          <div class="actions">
            <button class="btn-ghost" type="button" @click="openPolicyDetail(policy)">상세보기</button>
            <button class="btn-ghost" type="button" @click="openEditModal(policy)">수정</button>
            <button class="btn-danger" type="button" @click="removePolicy(policy.id)">삭제</button>
          </div>
        </article>
      </div>
    </article>

    <article class="card history-card">
      <div class="card-head">
        <h3>정책 변경 이력</h3>
      </div>

      <div class="filter-row">
        <button
          v-for="type in historyTypeOptions"
          :key="type"
          type="button"
          class="filter-chip"
          :class="{ active: selectedHistoryType === type }"
          @click="selectedHistoryType = type"
        >
          {{ type }}
        </button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>정책 유형</th>
            <th>변경 전 내용</th>
            <th>변경 후 내용</th>
            <th>변경자</th>
            <th>변경일</th>
            <th>적용일</th>
            <th>상세</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredHistory" :key="item.id">
            <td>{{ item.policyType }}</td>
            <td class="preview-cell" :title="item.beforeContent">{{ previewText(item.beforeContent) }}</td>
            <td class="preview-cell" :title="item.afterContent">{{ previewText(item.afterContent) }}</td>
            <td>{{ item.changedBy }}</td>
            <td class="font-num">{{ item.changedAt }}</td>
            <td class="font-num">{{ item.effectiveDate }}</td>
            <td>
              <button class="btn-ghost btn-small" type="button" @click="openHistoryDetail(item)">
                상세보기
              </button>
            </td>
          </tr>
          <tr v-if="filteredHistory.length === 0">
            <td colspan="7" class="empty">조회된 정책 변경 이력이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </article>

    <div v-if="showPolicyModal" class="overlay" @click.self="closePolicyModal">
      <div class="modal">
        <h2>{{ editingPolicyId ? '정책 수정' : '정책 추가' }}</h2>

        <label class="field">
          <span>정책명</span>
          <input v-model.trim="form.name" type="text" placeholder="예: 직급 승진 정책" />
        </label>
        <label class="field">
          <span>정책 유형</span>
          <select v-model="form.policyType">
            <option v-for="item in manageablePolicyTypes" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>
        <label class="field">
          <span>적용일</span>
          <input v-model="form.effectiveDate" type="date" />
        </label>
        <label class="field">
          <span>정책 내용</span>
          <textarea v-model.trim="form.content" rows="10" placeholder="정책 내용을 입력하세요" />
        </label>

        <div class="modal-actions">
          <button class="btn-ghost" type="button" @click="closePolicyModal">취소</button>
          <button class="btn-primary" type="button" :disabled="!canSavePolicy" @click="savePolicy">
            저장
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDetailModal" class="overlay" @click.self="closeDetailModal">
      <div class="modal detail-modal">
        <div class="detail-head">
          <h2>{{ detailView?.kind === 'history' ? '정책 변경 이력 상세' : '정책 상세' }}</h2>
          <button class="close-btn" type="button" @click="closeDetailModal">×</button>
        </div>

        <template v-if="detailView?.kind === 'history'">
          <div class="detail-grid">
            <p><strong>정책 유형</strong><span>{{ detailView.policyType }}</span></p>
            <p><strong>변경자</strong><span>{{ detailView.changedBy }}</span></p>
            <p><strong>변경일</strong><span class="font-num">{{ detailView.changedAt }}</span></p>
            <p><strong>적용일</strong><span class="font-num">{{ detailView.effectiveDate }}</span></p>
          </div>
          <label class="diff-only-toggle">
            <input v-model="showDiffOnly" type="checkbox" />
            <span>변경된 부분만 보기</span>
          </label>
          <div class="diff-columns">
            <section class="diff-block">
              <strong>변경 전 내용</strong>
              <div class="diff-lines">
                <p
                  v-for="(line, index) in displayedBeforeLines"
                  :key="`before-${index}-${line.text}`"
                  :class="['diff-line', line.status]"
                >
                  {{ line.text }}
                </p>
              </div>
            </section>
            <section class="diff-block">
              <strong>변경 후 내용</strong>
              <div class="diff-lines">
                <p
                  v-for="(line, index) in displayedAfterLines"
                  :key="`after-${index}-${line.text}`"
                  :class="['diff-line', line.status]"
                >
                  {{ line.text }}
                </p>
              </div>
            </section>
          </div>
        </template>

        <template v-else-if="detailView">
          <div class="detail-grid">
            <p><strong>정책명</strong><span>{{ detailView.name }}</span></p>
            <p><strong>정책 유형</strong><span>{{ detailView.policyType }}</span></p>
            <p><strong>버전</strong><span>{{ detailView.version }}</span></p>
            <p><strong>적용일</strong><span class="font-num">{{ detailView.effectiveDate }}</span></p>
          </div>
          <div class="detail-block">
            <strong>정책 내용</strong>
            <p>{{ detailView.content }}</p>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

const manageablePolicyTypes = ['직급 정책', '재직 정책', '발령 정책']
const historyPolicyTypes = [...manageablePolicyTypes, '연차/휴가 정책', '휴직 정책', '결재선 정책']
const longPolicyMockText = Array.from(
  { length: 50 },
  (_, index) => `${index + 1}. 직급 심사 기준 및 예외 처리 관련 테스트 문장입니다.`
).join('\n')

const hrPolicies = ref([
  {
    id: 'POL-001',
    name: '직급 승진 정책',
    policyType: '직급 정책',
    version: 'v2.3',
    effectiveDate: '2026.02.01',
    content: longPolicyMockText
  },
  {
    id: 'POL-002',
    name: '재직 상태 처리 정책',
    policyType: '재직 정책',
    version: 'v1.9',
    effectiveDate: '2026.01.15',
    content: '재직/휴직/사직/퇴직 상태 변경 시 적용일과 사유 기록을 필수로 남긴다.'
  },
  {
    id: 'POL-003',
    name: '발령 운영 정책',
    policyType: '발령 정책',
    version: 'v1.6',
    effectiveDate: '2026.02.10',
    content: '부서, 직무, 직책 변경 발령은 대상자 통보 후 적용일 기준 반영한다.'
  }
])

const policyHistories = ref([
  {
    id: 'PH-001',
    policyType: '연차/휴가 정책',
    beforeContent: '연차 이월 최대 10일',
    afterContent: '연차 이월 최대 12일',
    changedBy: '인사팀 관리자',
    changedAt: '2026.02.10',
    effectiveDate: '2026.03.01'
  },
  {
    id: 'PH-002',
    policyType: '휴직 정책',
    beforeContent: '육아휴직 최대 1년',
    afterContent: '육아휴직 최대 1년 6개월',
    changedBy: '인사팀 관리자',
    changedAt: '2026.02.05',
    effectiveDate: '2026.02.20'
  },
  {
    id: 'PH-003',
    policyType: '결재선 정책',
    beforeContent: '부서장 결재 1단계',
    afterContent: '부서장 + 본부장 결재 2단계',
    changedBy: '인사팀 관리자',
    changedAt: '2026.01.28',
    effectiveDate: '2026.02.01'
  }
])

const historyTypeOptions = ['전체', ...historyPolicyTypes]
const selectedHistoryType = ref('전체')

const showPolicyModal = ref(false)
const editingPolicyId = ref('')
const showDetailModal = ref(false)
const detailView = ref(null)
const showDiffOnly = ref(false)
const form = reactive({
  name: '',
  policyType: manageablePolicyTypes[0],
  effectiveDate: '',
  content: ''
})

const toDotDate = (dateText) => (dateText ? dateText.replaceAll('-', '.') : '')
const todayText = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

const canSavePolicy = computed(() => {
  return [form.name, form.policyType, form.effectiveDate, form.content].every(
    (value) => String(value).trim().length > 0
  )
})

const filteredHistory = computed(() => {
  if (selectedHistoryType.value === '전체') return policyHistories.value
  return policyHistories.value.filter((item) => item.policyType === selectedHistoryType.value)
})
const splitLines = (text) =>
  String(text ?? '')
    .split('\n')
    .filter((line) => line.trim().length > 0)
const createCountMap = (lines) => {
  const map = new Map()
  lines.forEach((line) => {
    map.set(line, (map.get(line) ?? 0) + 1)
  })
  return map
}
const buildDiffLines = (sourceLines, oppositeCounts, changedStatus) => {
  return sourceLines.map((line) => {
    const remain = oppositeCounts.get(line) ?? 0
    if (remain > 0) {
      oppositeCounts.set(line, remain - 1)
      return { text: line, status: 'unchanged' }
    }
    return { text: line, status: changedStatus }
  })
}
const beforeDiffLines = computed(() => {
  if (detailView.value?.kind !== 'history') return []
  const beforeLines = splitLines(detailView.value.beforeContent)
  const afterLines = splitLines(detailView.value.afterContent)
  return buildDiffLines(beforeLines, createCountMap(afterLines), 'removed')
})
const afterDiffLines = computed(() => {
  if (detailView.value?.kind !== 'history') return []
  const beforeLines = splitLines(detailView.value.beforeContent)
  const afterLines = splitLines(detailView.value.afterContent)
  return buildDiffLines(afterLines, createCountMap(beforeLines), 'added')
})
const displayedBeforeLines = computed(() => {
  if (!showDiffOnly.value) return beforeDiffLines.value
  return beforeDiffLines.value.filter((line) => line.status !== 'unchanged')
})
const displayedAfterLines = computed(() => {
  if (!showDiffOnly.value) return afterDiffLines.value
  return afterDiffLines.value.filter((line) => line.status !== 'unchanged')
})
const previewText = (text, max = 24) => {
  const safe = String(text ?? '')
  if (safe.length <= max) return safe
  return `${safe.slice(0, max)}...`
}

const resetForm = () => {
  form.name = ''
  form.policyType = manageablePolicyTypes[0]
  form.effectiveDate = ''
  form.content = ''
}

const openCreateModal = () => {
  editingPolicyId.value = ''
  resetForm()
  showPolicyModal.value = true
}

const openEditModal = (policy) => {
  editingPolicyId.value = policy.id
  form.name = policy.name
  form.policyType = policy.policyType
  form.effectiveDate = policy.effectiveDate.replaceAll('.', '-')
  form.content = policy.content
  showPolicyModal.value = true
}

const closePolicyModal = () => {
  showPolicyModal.value = false
}
const openPolicyDetail = (policy) => {
  detailView.value = { kind: 'policy', ...policy }
  showDetailModal.value = true
}
const openHistoryDetail = (history) => {
  detailView.value = { kind: 'history', ...history }
  showDiffOnly.value = false
  showDetailModal.value = true
}
const closeDetailModal = () => {
  showDetailModal.value = false
  detailView.value = null
  showDiffOnly.value = false
}

const appendHistory = ({ policyType, beforeContent, afterContent, effectiveDate }) => {
  policyHistories.value.unshift({
    id: `PH-${Date.now()}`,
    policyType,
    beforeContent,
    afterContent,
    changedBy: '인사팀 관리자',
    changedAt: todayText(),
    effectiveDate: toDotDate(effectiveDate)
  })
}

const bumpVersion = (version) => {
  const matched = String(version).match(/^v(\d+)\.(\d+)$/i)
  if (!matched) return 'v1.1'
  const major = Number(matched[1])
  const minor = Number(matched[2]) + 1
  return `v${major}.${minor}`
}

const savePolicy = () => {
  if (!canSavePolicy.value) return

  if (editingPolicyId.value) {
    const target = hrPolicies.value.find((item) => item.id === editingPolicyId.value)
    if (!target) return

    appendHistory({
      policyType: form.policyType,
      beforeContent: target.content,
      afterContent: form.content,
      effectiveDate: form.effectiveDate
    })

    target.name = form.name
    target.policyType = form.policyType
    target.effectiveDate = toDotDate(form.effectiveDate)
    target.content = form.content
    target.version = bumpVersion(target.version)
  } else {
    const newPolicy = {
      id: `POL-${Date.now()}`,
      name: form.name,
      policyType: form.policyType,
      version: 'v1.0',
      effectiveDate: toDotDate(form.effectiveDate),
      content: form.content
    }
    hrPolicies.value.unshift(newPolicy)

    appendHistory({
      policyType: form.policyType,
      beforeContent: '신규 생성',
      afterContent: form.content,
      effectiveDate: form.effectiveDate
    })
  }

  closePolicyModal()
}

const removePolicy = (policyId) => {
  const target = hrPolicies.value.find((item) => item.id === policyId)
  if (!target) return
  if (!window.confirm(`"${target.name}" 정책을 삭제하시겠습니까?`)) return

  appendHistory({
    policyType: target.policyType,
    beforeContent: target.content,
    afterContent: '정책 삭제',
    effectiveDate: target.effectiveDate.replaceAll('.', '-')
  })

  hrPolicies.value = hrPolicies.value.filter((item) => item.id !== policyId)
}
</script>

<style scoped>
.admin-page { width: 100%; max-width: none; min-width: 0; }

.card {
  margin-top: 12px;
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px;
}

.card-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.card-head h3 { margin: 0; color: var(--gray800); }

.policy-grid { margin-top: 12px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.policy-card { border: 1px solid var(--gray100); border-radius: 10px; background: var(--gray50); padding: 12px; }
.policy-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
.policy-top strong { color: var(--gray800); font-size: .92rem; }
.type-chip {
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  border-radius: 999px;
  font-size: .74rem;
  background: #E0F2FE;
  color: #075985;
  font-weight: 700;
}
.meta { margin: 0 0 4px; color: var(--gray500); font-size: .8rem; }
.content {
  margin: 8px 0 10px;
  color: var(--gray700);
  font-size: .82rem;
  line-height: 1.5;
  min-height: 58px;
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.actions { display: flex; gap: 8px; }

.btn-primary {
  height: 34px;
  border: none;
  border-radius: 8px;
  background: var(--primary);
  color: #fff;
  padding: 0 12px;
  font-weight: 700;
}
.btn-primary:disabled { opacity: .45; cursor: default; }
.btn-ghost {
  height: 32px;
  border: 1px solid var(--gray200);
  border-radius: 8px;
  background: #fff;
  color: var(--gray600);
  padding: 0 10px;
  font-size: .8rem;
  font-weight: 700;
}
.btn-danger {
  height: 32px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fff;
  color: #dc2626;
  padding: 0 10px;
  font-size: .8rem;
  font-weight: 700;
}

.history-card { margin-top: 12px; }
.filter-row { margin: 10px 0 12px; display: flex; flex-wrap: wrap; gap: 8px; }
.filter-chip {
  height: 30px;
  border: 1px solid var(--gray200);
  border-radius: 999px;
  background: #fff;
  color: var(--gray600);
  padding: 0 10px;
  font-size: .78rem;
  font-weight: 700;
}
.filter-chip.active { background: #E0F2FE; border-color: #B9E6FE; color: #075985; }

.table { width: 100%; border-collapse: collapse; font-size: .82rem; }
.table th, .table td { border-bottom: 1px solid var(--gray100); padding: 10px 8px; text-align: left; }
.table th { color: var(--gray500); }
.preview-cell { max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.empty { text-align: center; color: var(--gray400); }
.btn-small { height: 28px; padding: 0 8px; font-size: .74rem; }

.overlay {
  position: fixed;
  inset: 0;
  z-index: 1300;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, .4);
}
.modal {
  width: min(760px, calc(100vw - 36px));
  max-height: calc(100vh - 36px);
  overflow: auto;
  border-radius: 14px;
  border: 1px solid var(--gray200);
  background: #fff;
  box-shadow: 0 24px 40px rgba(15, 23, 42, .22);
  padding: 16px;
}
.modal h2 { margin: 0 0 12px; color: var(--gray800); font-size: 1.1rem; }
.field { display: grid; gap: 6px; margin-bottom: 10px; }
.field span { color: var(--gray600); font-size: .82rem; font-weight: 700; }
.field input, .field select, .field textarea {
  width: 100%;
  border: 1px solid var(--gray200);
  border-radius: 8px;
  background: #fff;
  color: var(--gray700);
  font-size: .86rem;
  padding: 8px 10px;
}
.field textarea { resize: vertical; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
.detail-modal { width: min(820px, calc(100vw - 36px)); }
.detail-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}
.detail-grid p {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: 1px solid var(--gray100);
  border-radius: 8px;
  background: var(--gray50);
  padding: 10px;
}
.detail-grid strong { font-size: .76rem; color: var(--gray500); }
.detail-grid span { color: var(--gray800); font-size: .84rem; }
.detail-block {
  border: 1px solid var(--gray100);
  border-radius: 8px;
  background: var(--gray50);
  padding: 10px;
  margin-bottom: 10px;
}
.detail-block strong { color: var(--gray600); font-size: .8rem; }
.detail-block p {
  margin: 8px 0 0;
  color: var(--gray800);
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}
.diff-only-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--gray600);
  font-size: .82rem;
  margin-bottom: 10px;
}
.diff-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.diff-block {
  border: 1px solid var(--gray100);
  border-radius: 8px;
  background: var(--gray50);
  padding: 10px;
  min-height: 220px;
}
.diff-block strong { color: var(--gray600); font-size: .8rem; }
.diff-lines {
  margin-top: 8px;
  max-height: 360px;
  overflow: auto;
  display: grid;
  gap: 6px;
}
.diff-line {
  margin: 0;
  padding: 7px 8px;
  border-radius: 6px;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: .82rem;
  line-height: 1.5;
  color: var(--gray700);
  background: #fff;
  border: 1px solid var(--gray100);
}
.diff-line.removed {
  color: #b91c1c;
  background: #fef2f2;
  border-color: #fecaca;
}
.diff-line.added {
  color: #075985;
  background: #ecfeff;
  border-color: #bae6fd;
}
.diff-line.unchanged {
  color: var(--gray500);
}
.close-btn {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 1px solid var(--gray200);
  background: #fff;
  color: var(--gray500);
  font-size: 1.05rem;
  line-height: 1;
}

@media (max-width: 1100px) {
  .policy-grid { grid-template-columns: minmax(0, 1fr); }
  .detail-grid { grid-template-columns: minmax(0, 1fr); }
  .diff-columns { grid-template-columns: minmax(0, 1fr); }
}
</style>
