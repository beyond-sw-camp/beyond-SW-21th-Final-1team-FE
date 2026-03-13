<template>
  <div class="tab-history">
    <div class="history-grid">
      <section class="history-card">
        <div class="card-header"><h3>인사 변경 이력</h3></div>
        <div class="history-list">
          <button
            v-for="item in employeeEvents"
            :key="item.hrEventId"
            type="button"
            class="history-item"
            :class="{ active: selectedEventId === item.hrEventId }"
            @click="selectedEventId = item.hrEventId"
          >
            <div class="item-row top">
              <div class="item-title-wrap">
                <span class="type-tag">{{ item.eventTypeDescription }}</span>
                <strong class="item-title">{{ item.eventTitle }}</strong>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            <div class="item-meta">
              <span>적용일: {{ item.effectiveFrom }}</span>
            </div>
            <div class="item-row bottom">
              <span class="change-value">{{ summarizeChanges(item.beforeChange, item.afterChange) }}</span>
            </div>
          </button>

          <div v-if="employeeEvents.length === 0" class="empty-history">
            해당 조건의 히스토리가 없습니다.
          </div>
        </div>
      </section>

      <section class="history-card">
        <div class="card-header"><h3>상세 정보</h3></div>

        <div v-if="selectedEvent" class="detail-rows">
          <div class="detail-top">
            <span class="type-tag">{{ selectedEvent.eventTypeDescription }}</span>
            <strong class="detail-title">{{ selectedEvent.eventTitle }}</strong>
          </div>

          <div class="detail-row"><span>적용일</span><strong>{{ selectedEvent.effectiveFrom }}</strong></div>
          <div class="detail-row detail-row-multi">
            <span>변경 항목</span>
            <strong class="change-diff-list">
              <template v-for="(diff, idx) in selectedEventDiffs" :key="`${diff.key}-${idx}`">
                <div class="change-diff-item">{{ diff.key }}: {{ diff.before }} -> {{ diff.after }}</div>
              </template>
            </strong>
          </div>
          <div class="detail-row"><span>기간</span><strong>{{ selectedEvent.effectiveFrom }} ~ {{ selectedEvent.effectiveTo || '현재' }}</strong></div>
          <div class="detail-row"><span>변경 사유</span><strong>{{ selectedEvent.reason || '-' }}</strong></div>
          <div class="detail-row">
            <span>처리 상태</span>
            <strong>
              <span class="status-tag" :class="statusClass(selectedEvent.eventStatus)">
                {{ selectedEvent.eventStatusDescription || statusText(selectedEvent.eventStatus) }}
              </span>
            </strong>
          </div>
          <div class="detail-row"><span>처리일시</span><strong>{{ selectedEvent.appliedAt || '-' }}</strong></div>
        </div>

        <div v-else class="detail-empty">
          <svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="8" y1="13" x2="16" y2="13" />
            <line x1="8" y1="17" x2="13" y2="17" />
          </svg>
          <p>히스토리 항목을 선택해주세요</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { getMyHrEventDetail, getMyHrEvents } from '@/api/hr'

const selectedEventId = ref(null)
const hrEvents = ref([])
const selectedEvent = ref(null)
const detailRequestSeq = ref(0)

const employeeEvents = computed(() => hrEvents.value)
const selectedEventDiffs = computed(() =>
  extractChangedFields(selectedEvent.value?.beforeChange, selectedEvent.value?.afterChange),
)

watch(employeeEvents, (list) => {
  if (!list.some((item) => item.hrEventId === selectedEventId.value)) {
    if (list.length > 0) {
      selectedEventId.value = list[0].hrEventId
      return
    }
    selectedEventId.value = null
    selectedEvent.value = null
  }
})

watch(selectedEventId, async (id) => {
  const requestSeq = ++detailRequestSeq.value
  if (!id) {
    selectedEvent.value = null
    return
  }
  try {
    const detail = await getMyHrEventDetail(id)
    if (requestSeq !== detailRequestSeq.value) return
    selectedEvent.value = {
      ...detail,
      effectiveFrom: normalizeDate(detail?.effectiveFrom),
      effectiveTo: normalizeDate(detail?.effectiveTo),
      appliedAt: detail?.appliedAt ? String(detail.appliedAt).replace('T', ' ') : '-',
    }
  } catch (error) {
    if (requestSeq !== detailRequestSeq.value) return
    selectedEvent.value = null
    alert(error?.response?.data?.error?.message || '인사 이력 상세 조회에 실패했습니다.')
  }
})

const statusText = (status) => {
  if (status === 'APPLIED') return '완료'
  if (status === 'FAILED') return '실패'
  return '진행중'
}

const statusClass = (status) => {
  if (status === 'APPLIED') return 'done'
  if (status === 'FAILED') return 'rejected'
  return 'pending'
}

const normalizeDate = (value) => {
  if (!value) return '-'
  return String(value).replaceAll('-', '.')
}

const parseChangeMap = (value) => {
  const text = String(value || '').trim()
  if (!text) return {}

  const entries = text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const idx = part.indexOf(':')
      if (idx < 0) return null
      const key = part.slice(0, idx).trim()
      const val = part.slice(idx + 1).trim()
      if (!key) return null
      return [key, val || '-']
    })
    .filter(Boolean)

  if (entries.length === 0) {
    return { 변경값: text }
  }

  return Object.fromEntries(entries)
}

const extractChangedFields = (beforeChange, afterChange) => {
  const beforeRaw = String(beforeChange || '').trim()
  const afterRaw = String(afterChange || '').trim()
  if (!beforeRaw && !afterRaw) return []

  const beforeMap = parseChangeMap(beforeChange)
  const afterMap = parseChangeMap(afterChange)
  const keys = [...new Set([...Object.keys(beforeMap), ...Object.keys(afterMap)])]

  const diffs = keys
    .map((key) => ({
      key,
      before: beforeMap[key] ?? '-',
      after: afterMap[key] ?? '-',
    }))
    .filter((diff) => diff.before !== diff.after)

  if (diffs.length > 0) return diffs

  if (!beforeRaw && !afterRaw) return []

  return [
    {
      key: '변경값',
      before: beforeChange || '-',
      after: afterChange || '-',
    },
  ]
}

const summarizeChanges = (beforeChange, afterChange) => {
  const diffs = extractChangedFields(beforeChange, afterChange)
  if (diffs.length === 0) return '-'
  if (diffs.length === 1) {
    const only = diffs[0]
    return `${only.key}: ${only.before} -> ${only.after}`
  }
  const first = diffs[0]
  return `${first.key}: ${first.before} -> ${first.after} 외 ${diffs.length - 1}건`
}

onMounted(async () => {
  try {
    const rows = await getMyHrEvents()
    hrEvents.value = (rows || []).map((row) => ({
      ...row,
      effectiveFrom: normalizeDate(row.effectiveFrom),
      effectiveTo: normalizeDate(row.effectiveTo),
    }))
    if (hrEvents.value.length > 0) {
      selectedEventId.value = hrEvents.value[0].hrEventId
    }
  } catch (error) {
    hrEvents.value = []
    alert(error?.response?.data?.error?.message || '인사 이력 조회에 실패했습니다.')
  }
})
</script>

<style scoped>
.tab-history { margin-top: 20px; }

.history-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;
}

.history-card {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.card-header {
  height: 58px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--gray100);
}

.card-header h3 {
  font-size: 1.06rem;
  font-weight: 700;
  color: var(--gray800);
}

.history-list {
  max-height: 492px;
  overflow-y: auto;
}

.detail-rows {
  max-height: 492px;
  overflow-y: auto;
}

.history-item {
  width: 100%;
  text-align: left;
  border: none;
  background: #fff;
  border-bottom: 1px solid var(--gray100);
  padding: 14px 16px;
  min-height: 123px;
  cursor: pointer;
}

.history-item:hover { background: #F8FAFC; }
.history-item.active { background: #E6F6F9; }

.item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.item-title {
  font-size: 1.03rem;
  font-weight: 700;
  color: var(--gray800);
}

.type-tag {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: .74rem;
  font-weight: 700;
  color: #0891B2;
  background: #E0F2FE;
}

.item-meta {
  margin-top: 8px;
  display: flex;
  gap: 14px;
  color: var(--gray500);
  font-size: .82rem;
  font-weight: 600;
  font-family: var(--font-num);
}

.item-row.bottom { margin-top: 8px; }

.change-value {
  color: var(--gray800);
  font-size: .92rem;
  font-weight: 700;
  line-height: 1.35;
  display: inline-block;
  max-width: 92%;
  word-break: break-word;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: .75rem;
  font-weight: 700;
}

.status-tag.done {
  color: #16A34A;
  background: #DCFCE7;
}

.status-tag.pending {
  color: #D97706;
  background: #FEF3C7;
}

.status-tag.rejected {
  color: #DC2626;
  background: #FEE2E2;
}

.detail-empty {
  min-height: 492px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #CBD5E1;
}

.detail-empty p {
  color: var(--gray400);
  font-size: .94rem;
  font-weight: 600;
}

.detail-rows {
  padding: 14px 16px;
  min-height: 492px;
}

.detail-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.detail-title {
  font-size: 1.03rem;
  font-weight: 700;
  color: var(--gray800);
}

.detail-row {
  display: flex;
  align-items: center;
  min-height: 47px;
  border-bottom: 1px solid var(--gray100);
}

.detail-row span {
  flex: 0 0 110px;
  color: var(--gray500);
  font-size: .85rem;
}

.detail-row strong {
  color: var(--gray800);
  font-size: .94rem;
  font-family: var(--font-num);
}

.detail-row-multi {
  align-items: flex-start;
  padding-top: 10px;
  padding-bottom: 10px;
}

.change-diff-list {
  display: grid;
  gap: 6px;
  width: 100%;
}

.change-diff-item {
  line-height: 1.4;
  word-break: break-word;
}

.empty-history {
  min-height: 492px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray400);
  font-size: .9rem;
}

@media (max-width: 1200px) {
  .history-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
