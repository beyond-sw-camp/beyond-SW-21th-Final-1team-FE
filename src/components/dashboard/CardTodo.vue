<template>
  <div class="card fade-up delay-5 todo-card">
    <div class="card-header">
      <h3>TODO List</h3>
      <div class="icon-actions">
        <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.6.77 1.05 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg></span>
        <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg></span>
        <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></span>
      </div>
    </div>
    <div class="card-body todo-body">
      <div v-if="isLoading" class="todo-state">성과 TODO를 불러오는 중입니다.</div>
      <div v-else-if="loadError" class="todo-state todo-state--error">{{ loadError }}</div>
      <div v-else-if="todos.length === 0" class="todo-state">진행중인 성과가 없습니다.</div>
      <template v-else>
        <TodoRow v-for="item in todos" :key="item.id" v-bind="item" />
      </template>
      <div class="todo-footer">
        <button type="button" class="todo-link" @click="goToInquiry">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          성과 조회로 이동
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getPerformanceInquiryItems } from '@/api/performance'
import { usePerformanceStore } from '@/store/performance'
import { AUTH_KEYS } from '@/utils/auth'
import { filterVisiblePerformanceInquiryItems, normalizePerformanceInquiryItem } from '@/utils/performanceInquiry'
import TodoRow from './TodoRow.vue'

const router = useRouter()
const perfStore = usePerformanceStore()
const inquiryItems = ref([])
const isLoading = ref(false)
const loadError = ref('')
const currentEmployeeId = computed(() => sessionStorage.getItem(AUTH_KEYS.employeeId) || '')
const currentUserName = computed(() => sessionStorage.getItem(AUTH_KEYS.userName) || '')

const IN_PROGRESS_STATUS_KEYS = new Set(['ACTIVE', 'INPROGRESS', '진행중'])

const normalizeStatus = (status) => String(status || '')
  .trim()
  .toUpperCase()
  .replace(/[\s_-]/g, '')

const toDateFromMatch = (match, fallbackHour = 23, fallbackMinute = 59) => {
  if (!match) return null

  const [, year, month, day, hour, minute] = match
  const parsed = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour ?? fallbackHour),
    Number(minute ?? fallbackMinute),
    59,
    999,
  )

  return Number.isFinite(parsed.getTime()) ? parsed : null
}

const parseDateValue = (value, fallbackHour = 23, fallbackMinute = 59) => {
  if (!value) return null
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value : null
  }

  const match = String(value)
    .trim()
    .match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?/)

  return toDateFromMatch(match, fallbackHour, fallbackMinute)
}

const parsePeriodEndDate = (period) => {
  const matches = [...String(period || '').matchAll(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?/g)]
  if (!matches.length) return null
  return toDateFromMatch(matches.at(-1), 23, 59)
}

const resolveExpectedEndDate = (item) => {
  const candidates = [
    item.expectedEndDate,
    item.expectedEndAt,
    item.expectedCompletionDate,
    item.estimatedEndDate,
    item.targetEndDate,
    item.dueDate,
    item.endDate,
  ]

  for (const candidate of candidates) {
    const parsed = parseDateValue(candidate)
    if (parsed) return parsed
  }

  return parsePeriodEndDate(item.date)
}

const clampProgress = (progress) => {
  const numeric = Number(progress)
  if (!Number.isFinite(numeric)) return 0
  return Math.min(100, Math.max(0, numeric))
}

const getUrgencyColor = (expectedEndDate) => {
  if (!expectedEndDate) return '#06B6D4'

  const daysLeft = Math.ceil((expectedEndDate.getTime() - Date.now()) / 86400000)
  if (daysLeft <= 1) return '#EF4444'
  if (daysLeft <= 3) return '#F97316'
  if (daysLeft <= 7) return '#EAB308'
  return '#06B6D4'
}

const visibleItems = computed(() => filterVisiblePerformanceInquiryItems(inquiryItems.value, {
  currentEmployeeId: currentEmployeeId.value,
  userName: currentUserName.value,
}))

const todos = computed(() => {
  const now = Date.now()

  return visibleItems.value
    .filter((item) => IN_PROGRESS_STATUS_KEYS.has(normalizeStatus(item.status)))
    .map((item) => {
      const expectedEndDate = resolveExpectedEndDate(item)
      const expectedEndTime = expectedEndDate?.getTime() ?? Number.POSITIVE_INFINITY
      return {
        id: item.id ?? item.performanceId ?? item.title,
        title: item.title || item.coreTask || '제목 없음',
        pct: clampProgress(item.progress),
        color: getUrgencyColor(expectedEndDate),
        expectedEndTime,
        distanceFromNow: Number.isFinite(expectedEndTime)
          ? Math.abs(expectedEndTime - now)
          : Number.POSITIVE_INFINITY,
      }
    })
    .sort((left, right) =>
      left.distanceFromNow - right.distanceFromNow ||
      left.expectedEndTime - right.expectedEndTime ||
      right.pct - left.pct ||
      left.title.localeCompare(right.title, 'ko'))
    .slice(0, 5)
    .map(({ expectedEndTime, distanceFromNow, ...item }) => item)
})

const goToInquiry = () => {
  perfStore.setPage('inquiry')
  router.push('/performance/inquiry')
}

const loadTodos = async () => {
  try {
    isLoading.value = true
    loadError.value = ''
    const response = await getPerformanceInquiryItems()
    inquiryItems.value = Array.isArray(response)
      ? response.map((item) => normalizePerformanceInquiryItem(item))
      : []
  } catch (error) {
    inquiryItems.value = []
    loadError.value = error?.response?.data?.error?.message || '성과 TODO를 불러오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadTodos)
</script>

<style scoped>
.todo-body {
  padding: 6px 18px;
}

.todo-state {
  padding: 18px 0 12px;
  text-align: center;
  font-size: 0.82rem;
  color: var(--gray500);
}

.todo-state--error {
  color: #dc2626;
}

.todo-footer {
  text-align: center;
  padding-top: 8px;
}

.todo-link {
  font-size: 0.75rem;
  color: var(--gray400);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
}

.todo-link:hover {
  color: var(--primary);
}
</style>
