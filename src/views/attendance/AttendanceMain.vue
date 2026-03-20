<template>
  <div class="attendance-dashboard">
    <div class="mobile-attendance">
      <div class="mobile-head">
        <button class="mobile-back" type="button" aria-label="뒤로가기" @click="handleBack">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <div class="mobile-head-content">
          <h1>근태</h1>
          <p>출퇴근 기록과 근태 현황을 확인합니다.</p>
        </div>
        <span class="status-badge" :class="workStatusClass">{{ workStatusLabel }}</span>
      </div>

      <div class="mobile-clock card">
        <div class="mobile-clock-head">
          <div class="mobile-date">{{ currentDate }}</div>
          <button type="button" class="mobile-record-btn" @click="$router.push('/attendance/record')">
            근태 현황
          </button>
        </div>
        <div class="mobile-time">{{ currentTime }}</div>
        <div class="mobile-location">서울, 대한민국</div>

        <div class="mobile-times">
          <div>
            <div class="label">출근</div>
            <div class="value">{{ checkInTime }}</div>
          </div>
          <div>
            <div class="label">퇴근</div>
            <div class="value">{{ checkOutTime }}</div>
          </div>
        </div>

        <button v-if="!isCheckedIn" class="btn-check-out btn-in" @click="handleCheckIn">출근하기</button>
        <button v-else class="btn-check-out" @click="handleCheckOut">퇴근하기</button>
      </div>
    </div>

    <!-- ═══ TOP ROW ═══ -->
    <div class="top-row">
      <!-- 1. 출퇴근 기록 카드 -->
      <div class="card clock-card">
        <div class="card-header-row">
          <div class="date-info">
            <span>{{ currentDate }}</span>
          </div>
          <span class="status-badge" :class="workStatusClass">{{ workStatusLabel }}</span>
        </div>
        
        <div class="clock-display">
          <div class="time-main">{{ currentTime }}</div>
          <div class="location-info">서울, 대한민국</div>
        </div>

        <div class="clock-actions">
          <div class="time-row">
            <div class="time-item time-item--check-in">
              <span class="time-item-caption">출근 시간</span>
              <span class="time-item-value">{{ checkInTime }}</span>
            </div>
            <div class="time-item time-item--check-out">
              <span class="time-item-caption">퇴근 시간</span>
              <span class="time-item-value">{{ checkOutTime }}</span>
            </div>
          </div>
          <button v-if="!isCheckedIn" class="btn-check-out btn-in" @click="handleCheckIn">출근하기</button>
          <button v-else class="btn-check-out" @click="handleCheckOut">퇴근하기</button>
        </div>
      </div>

      <!-- 2. 이번 주 근무 현황 -->
      <div class="card weekly-card">
        <div class="card-header-row">
          <span class="card-title">이번 주 근무</span>
        </div>
        <div class="period-info">{{ weeklyPeriodLabel }} (법정 52h)</div>

        <div class="weekly-stat">
          <div class="hours-display">
            <span class="hours-num">{{ weeklyHoursDisplay }}</span>
            <span class="hours-unit">h</span>
          </div>
          <div class="progress-info">
            <span>{{ weeklyProgressLabel }}</span>
            <span class="percent">{{ weeklyProgressPercent }}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" :style="{ width: `${weeklyProgressBarWidth}%` }"></div>
          </div>
        </div>

        <div class="weekly-breakdown">
          <div class="bd-item">
            <span class="label">기본 근무</span>
            <span class="value">{{ regularHoursDisplay }} / 40h</span>
          </div>
          <div class="bd-item">
            <span class="label">연장 근무</span>
            <span class="value blue">{{ overtimeHoursDisplay }} / 12h</span>
          </div>
        </div>
      </div>

      <!-- 3. 이번 달 현황 (Clickable) -->
      <div class="card monthly-card" @click="$router.push('/attendance/record')">
        <div class="card-header-row">
          <span class="card-title">이번 달 근태 현황</span>
          <span class="icon-arrow-right" @click.stop="$router.push('/attendance/vacation')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </span>
        </div>
        <div class="period-info">{{ monthPeriodLabel }} 기준</div>

        <div class="monthly-grid">
          <!-- Item 1 -->
          <div class="m-item">
            <div class="metric-col">
              <div class="icon-box blue-bg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div class="m-stat">
                <span class="num">{{ monthlySummary.normalCount }}</span>
                <span class="label">정상 출근</span>
              </div>
            </div>
          </div>
          <!-- Item 2 -->
          <div class="m-item">
            <div class="metric-col">
              <div class="icon-box orange-bg">
                 <!-- Late/Early Icon: Alert Circle -->
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <div class="m-stat">
                <span class="num">{{ monthlySummary.tardyCount + monthlySummary.earlyLeaveCount }}</span>
                <span class="label">지각/조퇴</span>
              </div>
            </div>
          </div>
          <!-- Item 3 -->
          <div class="m-item">
            <div class="metric-col">
              <div class="icon-box purple-bg">
                 <!-- Remote/Trip Icon: Home -->
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <div class="m-stat">
                <span class="num">{{ monthlySummary.absentCount }}</span>
                <span class="label">결근</span>
              </div>
            </div>
          </div>
          <!-- Item 4 -->
          <div class="m-item">
            <div class="metric-col">
              <div class="icon-box red-bg">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
              </div>
              <div class="m-stat">
                <span class="num">{{ monthlySummary.vacationCount }}</span>
                <span class="label">휴가 사용</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ BOTTOM ROW ═══ -->
    <div class="bottom-row">
      <!-- Left: Calendar -->
      <div class="col-left">
        <div class="card calendar-card" @click="$router.push('/attendance/schedule')">
          <div class="card-header-row">
            <div class="cal-title">
              <span class="card-title">근무 일정</span>
              <div class="cal-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {{ monthBadgeLabel }}
              </div>
            </div>
            <div class="cal-nav">
              <button class="icon-btn" @click.stop="moveCalendarMonth(-1)">&lt;</button>
              <button class="icon-btn" @click.stop="moveCalendarMonth(1)">&gt;</button>
            </div>
          </div>

          <div class="calendar-grid">
            <div class="cal-head">
              <span class="sun">일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span class="sat">토</span>
            </div>
            <div v-for="(week, weekIndex) in calendarWeeks" :key="weekIndex" class="cal-week week-flex">
              <div
                v-for="day in week"
                :key="day.date"
                class="day"
                :class="{
                  sun: day.dayOfWeek === 0,
                  sat: day.dayOfWeek === 6,
                  today: day.isToday,
                  'other-month': !day.isCurrentMonth,
                  'has-schedule': day.isCurrentMonth && day.label,
                }"
              >
                <span v-if="day.isCurrentMonth">{{ day.day }}</span>
                <div v-if="day.isCurrentMonth && day.label" :class="`bar-${day.variant}`">
                  {{ day.label }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Applications -->
      <div class="col-right">
        <!-- My Applications -->
        <div class="card history-card" @click="$router.push('/attendance/history')">
           <div class="card-header-row mb-2">
            <div class="history-heading">
              <span class="card-title">나의 신청 현황</span>
            </div>
            <span class="more-link">더보기</span>
          </div>
          <div class="history-list">
            <div v-if="recentApplications.length" class="history-stack">
              <div class="history-item" v-for="app in recentApplications" :key="app.id">
                <div class="history-item-top">
                  <span class="status-badge-sm" :class="getApprStatusClass(app.status)">{{ getApprStatusLabel(app.status) }}</span>
                  <span class="history-date-chip">{{ formatHistoryDate(app.appliedAt) }}</span>
                </div>
                <div class="history-item-body">
                  <div class="history-type-row">
                    <span class="history-type-badge">{{ app.type || '신청' }}</span>
                    <span v-if="app.period" class="history-period">{{ app.period }}</span>
                  </div>
                  <div class="h-title">{{ app.title }}</div>
                  <div class="history-meta">
                    <span class="history-meta-label">결재자</span>
                    <span class="history-meta-value">{{ app.approver || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="history-empty">
              <div class="history-empty-icon">+</div>
              <div class="history-empty-text">
                <strong>신청 내역이 없습니다.</strong>
                <span>휴가, 연장근무, 재택근무 신청이 여기 쌓입니다.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ActionConfirmModal
    v-model="showActionModal"
    :title="actionModalTitle"
    :message="actionModalMessage"
    :confirm-text="actionModalConfirmText"
    :require-reason="actionModalRequiresReason"
    :loading="actionLoading"
    v-model:reason="actionReason"
    @confirm="handleActionConfirm"
  />
</template>

<script setup>
import { useRouter } from 'vue-router'
import { safeBack } from '@/utils/navigation'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useAttendanceStore } from '@/store/attendance'
import { storeToRefs } from 'pinia'
import ActionConfirmModal from '@/components/common/ActionConfirmModal.vue'

const router = useRouter()
const store = useAttendanceStore()

const mapLeaveTypeWord = (value) => {
  const normalized = String(value || '').trim().toUpperCase()
  if (normalized === 'ANNUAL') return '연차'
  if (normalized === 'HALF') return '반차'
  if (normalized === 'SICK') return '병가'
  if (normalized === 'ETC') return '기타'
  return null
}

const normalizeApplicationTitle = (title, type) => {
  const raw = String(title || '').trim()
  if (!raw) {
    const mappedType = mapLeaveTypeWord(type)
    const typeLabel = (mappedType || String(type || '').trim()).replace(/\s*신청$/, '')
    return typeLabel ? `${typeLabel} 신청` : '신청'
  }

  const mapped = mapLeaveTypeWord(raw)
  if (mapped) return `${mapped} 신청`

  const matched = raw.match(/^([A-Za-z_]+)\s*신청$/)
  if (matched) {
    const mappedWord = mapLeaveTypeWord(matched[1])
    if (mappedWord) return `${mappedWord} 신청`
  }

  return raw
}

const recentApplications = computed(() => {
  return [...store.requestHistory]
    .map((app) => ({
      ...app,
      title: normalizeApplicationTitle(app.title, app.type),
    }))
    .sort((a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0))
    .slice(0, 3)
})

const getApprStatusLabel = (s) => ({ pending: '결재 대기', approved: '승인됨', rejected: '반려됨' }[s])
const getApprStatusClass = (s) => ({ pending: 'warning', approved: 'success', rejected: 'danger' }[s])

// -- Clock Logic --
const currentDate = ref('')
const currentTime = ref('')
const calendarMonthOffset = ref(0)
const showActionModal = ref(false)
const actionReason = ref('')
const actionType = ref('')
const actionLoading = ref(false)
const { checkInTime, checkOutTime, monthlySummary, weeklySummary, calendarEvents, dailyAttendance } = storeToRefs(store)

const isCheckedIn = computed(() => {
  return !!checkInTime.value && !checkOutTime.value
})

const workStatusLabel = computed(() => {
  if (isCheckedIn.value) return '근무 중'
  if (checkOutTime.value) return '퇴근 완료'
  return '출근 전'
})

const workStatusClass = computed(() => {
  if (isCheckedIn.value) return 'working'
  if (checkOutTime.value) return 'done'
  return 'before'
})

const isLateCheckIn = (timeText) => {
  if (!timeText) return false
  const [h, m] = timeText.split(':').map(Number)
  return h > 9 || (h === 9 && m > 0)
}

const moveCalendarMonth = (delta) => {
  calendarMonthOffset.value += delta
}

const formatHours = (minutes) => (minutes / 60).toFixed(1).replace(/\.0$/, '')

const getWeekStart = (date) => {
  const result = new Date(date)
  const day = result.getDay()
  const diff = day === 0 ? -6 : 1 - day
  result.setDate(result.getDate() + diff)
  result.setHours(0, 0, 0, 0)
  return result
}

const formatMonthDate = (date) =>
  `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`

const toDateKey = (value) => {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const toMinutesFromClock = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0
  const [checkInHour, checkInMinute] = String(checkIn).slice(0, 5).split(':').map(Number)
  const [checkOutHour, checkOutMinute] = String(checkOut).slice(0, 5).split(':').map(Number)
  if ([checkInHour, checkInMinute, checkOutHour, checkOutMinute].some(Number.isNaN)) {
    return 0
  }

  let diff = (checkOutHour * 60 + checkOutMinute) - (checkInHour * 60 + checkInMinute)
  if (diff < 0) {
    diff += 24 * 60
  }
  return Math.max(diff, 0)
}

const weeklyPeriodLabel = computed(() => {
  if (!effectiveWeeklySummary.value?.weekStartDate || !effectiveWeeklySummary.value?.weekEndDate) return '-'
  const weekStart = new Date(`${effectiveWeeklySummary.value.weekStartDate}T00:00:00`)
  const weekEnd = new Date(`${effectiveWeeklySummary.value.weekEndDate}T00:00:00`)
  return `${formatMonthDate(weekStart)} - ${formatMonthDate(weekEnd)}`
})

const fallbackWeeklySummary = computed(() => {
  const now = new Date()
  const weekStart = getWeekStart(now)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const totalWorkedMinutes = (dailyAttendance.value || [])
    .filter((record) => {
      if (!record?.date) return false
      const recordDate = new Date(`${record.date}T00:00:00`)
      return recordDate >= weekStart && recordDate <= weekEnd
    })
    .reduce(
      (sum, record) => sum + toMinutesFromClock(record.checkIn, record.checkOut),
      0,
    )

  const standardWeeklyMinutes = 40 * 60
  return {
    weekStartDate: toDateKey(weekStart),
    weekEndDate: toDateKey(weekEnd),
    totalWorkedMinutes,
    regularWorkedMinutes: Math.min(totalWorkedMinutes, standardWeeklyMinutes),
    overtimeWorkedMinutes: Math.max(totalWorkedMinutes - standardWeeklyMinutes, 0),
    progressPercent:
      standardWeeklyMinutes === 0 ? 0 : Math.round((totalWorkedMinutes / standardWeeklyMinutes) * 100),
  }
})

const effectiveWeeklySummary = computed(() => {
  const apiSummary = weeklySummary.value
  if (apiSummary?.weekStartDate && apiSummary?.weekEndDate) {
    return apiSummary
  }
  return fallbackWeeklySummary.value
})

const weeklyHoursDisplay = computed(() => formatHours(effectiveWeeklySummary.value?.totalWorkedMinutes || 0))
const regularHoursDisplay = computed(() => formatHours(effectiveWeeklySummary.value?.regularWorkedMinutes || 0))
const overtimeHoursDisplay = computed(() => formatHours(effectiveWeeklySummary.value?.overtimeWorkedMinutes || 0))
const weeklyProgressPercent = computed(() => effectiveWeeklySummary.value?.progressPercent || 0)
const weeklyProgressBarWidth = computed(() => Math.min(100, weeklyProgressPercent.value))
const weeklyProgressLabel = computed(() =>
  (effectiveWeeklySummary.value?.totalWorkedMinutes || 0) >= 40 * 60
    ? '표준 40h 달성'
    : `표준 40h까지 ${formatHours(40 * 60 - (effectiveWeeklySummary.value?.totalWorkedMinutes || 0))}h 남음`,
)

const displayMonth = computed(() => {
  const base = new Date()
  return new Date(base.getFullYear(), base.getMonth() + calendarMonthOffset.value, 1)
})

const monthPeriodLabel = computed(() =>
  `${displayMonth.value.getFullYear()}년 ${displayMonth.value.getMonth() + 1}월`,
)

const monthBadgeLabel = computed(
  () => `${displayMonth.value.getFullYear()}.${String(displayMonth.value.getMonth() + 1).padStart(2, '0')}`,
)

const resolveCalendarTone = (event) => {
  const title = String(event?.title || '')
  const category = String(event?.category || '').toUpperCase()

  if (title.includes('지각')) return 'tardy'
  if (title.includes('조퇴')) return 'early_leave'
  if (title.includes('결근')) return 'absent'
  if (title.includes('휴가') || category === 'LEAVE') return 'vacation'
  if (category === 'WEEKLY_SCHEDULE') return 'early_leave'
  if (category === 'BUSINESS_TRIP') return 'absent'
  return 'normal'
}

const eventLabelMap = computed(() => {
  const map = new Map()
  calendarEvents.value.forEach((event) => {
    if (!event.targetDate) return
    if (map.has(event.targetDate)) return
    map.set(event.targetDate, {
      label: event.title,
      variant: resolveCalendarTone(event),
    })
  })
  return map
})

const calendarWeeks = computed(() => {
  const year = displayMonth.value.getFullYear()
  const month = displayMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const start = new Date(firstDay)
  start.setDate(1 - firstDay.getDay())
  const todayKey = toDateKey(new Date())

  const weeks = Array.from({ length: 6 }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(start)
      date.setDate(start.getDate() + weekIndex * 7 + dayIndex)
      const key = toDateKey(date)
      const labelInfo = eventLabelMap.value.get(key)
      return {
        date: key,
        day: date.getDate(),
        dayOfWeek: dayIndex,
        isToday: key === todayKey,
        isCurrentMonth: date.getMonth() === month,
        label: labelInfo?.label || '',
        variant: labelInfo?.variant || 'normal',
      }
    }),
  )

  // Keep only weeks that contain at least one day of the displayed month.
  return weeks.filter((week) => week.some((day) => day.isCurrentMonth))
})

const formatHistoryDate = (value) => String(value || '').slice(5, 10).replace('-', '.')

const actionModalTitle = computed(() => {
  if (actionType.value === 'late-check-in') return '지각 사유 입력'
  if (actionType.value === 'check-out') return '퇴근 처리'
  return '확인'
})

const actionModalMessage = computed(() => {
  if (actionType.value === 'late-check-in') return '지각 사유를 입력한 뒤 출근 처리합니다.'
  if (actionType.value === 'check-out') return '퇴근 처리하시겠습니까?'
  return ''
})

const actionModalConfirmText = computed(() => (actionType.value === 'check-out' ? '퇴근하기' : '확인'))
const actionModalRequiresReason = computed(() => actionType.value === 'late-check-in')

const submitClockIn = async (tardyReason = null) => {
  await store.clockIn(tardyReason)
}

const handleCheckIn = async () => {
  const now = new Date()
  const hh = now.getHours()
  const mm = now.getMinutes()

  if (hh > 9 || (hh === 9 && mm > 0)) {
    actionType.value = 'late-check-in'
    actionReason.value = ''
    showActionModal.value = true
    return
  }

  try {
    await submitClockIn()
  } catch (error) {
    alert(error.response?.data?.message || '출근 처리에 실패했습니다.')
  }
}

const handleCheckOut = async () => {
  actionType.value = 'check-out'
  actionReason.value = ''
  showActionModal.value = true
}

const handleActionConfirm = async () => {
  if (actionLoading.value) return
  if (actionType.value === 'late-check-in') {
    if (!actionReason.value.trim()) {
      alert('지각 사유는 비워둘 수 없습니다.')
      return
    }
    actionLoading.value = true
    try {
      await submitClockIn(actionReason.value.trim())
      showActionModal.value = false
    } catch (error) {
      alert(error.response?.data?.message || '출근 처리에 실패했습니다.')
    } finally {
      actionLoading.value = false
    }
    return
  }

  if (actionType.value === 'check-out') {
    actionLoading.value = true
    try {
      await store.clockOut()
      showActionModal.value = false
    } catch (error) {
      alert(error.response?.data?.message || '퇴근 처리에 실패했습니다.')
    } finally {
      actionLoading.value = false
    }
  }
}

const updateTime = () => {
  const now = new Date()
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
  currentDate.value = now.toLocaleDateString('ko-KR', options)
  
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  currentTime.value = `${hours}시 ${minutes}분 ${seconds}초`
}

let timer = null
onMounted(async () => {
  updateTime()
  timer = setInterval(updateTime, 1000)
  const now = new Date()
  const today = toDateKey(now)
  await Promise.all([
    store.fetchMonthlyRecords(now.getFullYear(), now.getMonth() + 1),
    store.fetchMonthlySummary(now.getFullYear(), now.getMonth() + 1),
    store.fetchWeeklySummary(today),
    store.fetchAttendanceCalendar(now.getFullYear(), now.getMonth() + 1),
    store.refreshRequestHistory(),
  ])
})

watch(displayMonth, async (value) => {
  await Promise.all([
    store.fetchAttendanceCalendar(value.getFullYear(), value.getMonth() + 1),
    store.fetchMonthlySummary(value.getFullYear(), value.getMonth() + 1),
    store.fetchMonthlyRecords(value.getFullYear(), value.getMonth() + 1),
  ])
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const handleBack = () => {
  safeBack(router, '/')
}
</script>

<style scoped>
.attendance-dashboard {
  height: calc(100vh - var(--header-h) - 48px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden; /* Prevent scroll if content fits */
}  

/* ── Common Card ── */
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03); 
  border: 1px solid var(--gray200); /* Optional based on global style */
  padding: 24px;
}
.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gray800);
}
.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.period-info {
  font-size: 0.85rem;
  color: var(--gray500);
  margin-bottom: 14px;
}

/* ── Top Row ── */
.top-row {
  display: flex;
  gap: 16px;
}
.top-row > .card {
  flex: 1;
  min-height: 164px;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

/* 1. Clock Card */
.clock-card {
  min-width: 320px;
}
.date-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 1rem;
  color: var(--gray600);
}
.status-badge {
  font-size: 0.9rem; 
  font-weight: 700; 
  padding: 4px 10px; 
  border-radius: 20px;
}
.status-badge.working { background: #E6F7ED; color: #00C853; }
.status-badge.done { background: #E0E7FF; color: #3730A3; }
.status-badge.before { background: #F3F4F6; color: #4B5563; }
.clock-display {
  text-align: center;
  margin: 12px 0;
}
.time-main {
  font-size: 3.2rem;
  font-weight: 800;
  color: var(--gray900);
  letter-spacing: -1px;
  margin-bottom: 2px;
}
.location-info {
  font-size: 0.95rem;
  color: var(--gray400);
}
.clock-actions {
  margin-top: auto;
}
.time-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 10px;
}
.time-item {
  min-width: 0;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid #dbe4f0;
  background: linear-gradient(180deg, #fbfdff 0%, #f2f6fb 100%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
}
.time-item--check-in {
  border-color: #d8e7fb;
}
.time-item--check-out {
  border-color: #dfe6ef;
}

.mobile-attendance {
  display: none;
  background: #f5f8fc;
  border: 1px solid #eef2f7;
  border-radius: 18px;
  padding: 18px;
}

.mobile-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.mobile-back{
  width:32px;height:32px;border-radius:10px;border:1px solid #e2e8f0;background:#fff;
  display:flex;align-items:center;justify-content:center;color:#475569;cursor:pointer;
  flex-shrink: 0;
}

.mobile-head-content {
  flex: 1;
  min-width: 0;
}

.status-badge {
  flex-shrink: 0;
}

.mobile-head h1 {
  margin: 0;
  font-size: 1.3rem;
  color: var(--gray800);
}

.mobile-head p {
  margin: 6px 0 0;
  font-size: 0.86rem;
  color: var(--gray500);
}

.mobile-clock {
  margin-top: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mobile-clock-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.mobile-date {
  font-size: 0.88rem;
  color: var(--gray500);
}

.mobile-record-btn {
  flex-shrink: 0;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid #dbe4f3;
  background: #ffffff;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--gray700);
  cursor: pointer;
}

.mobile-record-btn:hover {
  background: #f8fbff;
}

.mobile-time {
  font-size: 2rem;
  font-weight: 800;
  color: var(--gray800);
}

.mobile-location {
  font-size: 0.8rem;
  color: var(--gray400);
}

.mobile-times {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 6px;
}

.mobile-times .label {
  font-size: 0.76rem;
  color: var(--gray500);
}

.mobile-times .value {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--gray800);
}

@media (max-width: 768px) {
  .attendance-dashboard {
    height: auto;
    overflow: visible;
  }

  .mobile-attendance {
    display: block;
  }

  .top-row,
  .bottom-row {
    display: none;
  }
}
.time-item-caption {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--gray500);
}
.time-item-value {
  font-size: 1.55rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--gray800);
}
.btn-check-out {
  width: 100%;
  padding: 10px;
  background: var(--gray800);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-check-out.btn-in {
  background: var(--primary);
}
.btn-check-out:hover {
  opacity: 0.9;
}

/* 2. Weekly Card */
.weekly-stat {
  margin-bottom: 10px;
}
.hours-display {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 4px;
}
.hours-num {
  font-size: 3rem;
  font-weight: 800;
  color: var(--primary);
  line-height: 1;
}
.hours-unit {
  font-size: 1.5rem;
  color: var(--gray400);
  font-weight: 400;
}
.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--gray500);
  margin-bottom: 6px;
}
.progress-info .percent {
  color: var(--primary);
  font-weight: 700;
}
.progress-bar-bg {
  width: 100%;
  height: 8px;
  background: var(--gray100);
  border-radius: 4px;
  overflow: hidden;
}
.progress-bar-fill {
  background: var(--primary);
  height: 100%;
  border-radius: 4px;
}
.weekly-breakdown {
  display: flex;
  justify-content: space-between;
  background: var(--gray50);
  padding: 12px;
  border-radius: 10px;
}
.bd-item {
  display: flex;
  flex-direction: column;
}
.bd-item .label {
  font-size: 0.8rem;
  color: var(--gray400);
  margin-bottom: 4px;
}
.bd-item .value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray800);
}
.bd-item .value.blue { color: var(--primary); }

/* 3. Monthly Grid */
.monthly-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.monthly-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
}
.monthly-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  flex: 1;
  align-items: stretch;
}
.m-item {
  background: var(--gray50);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.metric-col {
  width: 100%;
  max-width: 112px;
  display: grid;
  grid-template-rows: 40px minmax(56px, auto);
  gap: 8px;
  align-content: start;
  justify-items: center;
}
.icon-box {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}
.icon-box svg {
  display: block;
  width: 20px;
  height: 20px;
}
.blue-bg { background: #E0F7FA; color: var(--primary); }
.orange-bg { background: #FFF3E0; color: var(--orange); }
.purple-bg { background: #F3E5F5; color: var(--purple); }
.red-bg { background: #FFEBEE; color: var(--red); }

.m-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
  min-height: 64px;
  justify-content: flex-start;
  text-align: center;
}
.m-stat .num {
  display: block;
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--gray800);
  line-height: 1;
  min-height: 2rem;
}
.m-stat .label {
  font-size: 0.8rem;
  color: var(--gray500);
  line-height: 1.25;
  min-height: 1.25rem;
}

/* ── Bottom Row ── */
.bottom-row {
  flex: 1;
  display: flex;
  gap: 16px;
  min-height: 0;
}
.col-left {
  flex: 2;
  order: 2; /* Move to right */
  display: flex;
  flex-direction: column;
}
.col-right {
  flex: 1;
  order: 1; /* Move to left */
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Calendar Card */
.calendar-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.calendar-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
}
.cal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cal-badge {
  background: var(--gray100);
  color: var(--gray600);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}
.cal-nav {
  display: flex;
  gap: 4px;
}
.icon-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--gray200);
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: var(--gray500);
}
.icon-btn:hover { background: var(--gray50); }

.calendar-grid {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0;
}
.cal-head {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--gray100);
  font-size: 0.85rem;
  color: var(--gray500);
  flex-shrink: 0;
}
.cal-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  min-height: 60px; 
}
.week-flex {
  flex: 1;
  min-height: 0;
}
.day {
  position: relative;
  border-top: 1px solid transparent;
  padding: 8px;
  font-size: 0.9rem;
  color: var(--gray700);
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%; /* Force height */
}
.day.sun { color: var(--red); }
.day.sat { color: #3F51B5; }
.day.other-month { opacity: 0.3; }
.day.today {
  background: var(--gray800);
  color: #fff;
  border-radius: 8px;
}

.bar-normal,
.bar-tardy,
.bar-early_leave,
.bar-absent,
.bar-vacation {
  margin-top: 6px;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  width: 90%;
  text-align: center;
}
.bar-normal { background: #DBEAFE; color: #1D4ED8; }
.bar-tardy { background: #FED7AA; color: #C2410C; }
.bar-early_leave { background: #FDE68A; color: #92400E; }
.bar-absent { background: #E2E8F0; color: #475569; }
.bar-vacation { background: #BBF7D0; color: #15803D; }
.today .bar-normal,
.today .bar-tardy,
.today .bar-early_leave,
.today .bar-absent,
.today .bar-vacation {
  background: rgba(255,255,255,0.2);
  color: #fff;
}

/* Quick Apps */
.quick-card, .history-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.history-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}
.history-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
}
.quick-list, .history-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.quick-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.quick-item:hover { background: var(--gray50); }
.icon-circle {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.quick-text {
  flex: 1;
}
.quick-text .main-text {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--gray800);
  margin-bottom: 2px;
}
.quick-text .sub-text {
  font-size: 0.8rem;
  color: var(--gray400);
}
.chevron {
  color: var(--gray300);
  font-size: 1.2rem;
}

/* History Card */
.more-link {
  font-size: 0.8rem;
  color: var(--gray500);
  cursor: pointer;
}
.history-heading {
  display: flex;
  flex-direction: column;
}
.history-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.history-item {
  background: rgba(255,255,255,0.9);
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}
.history-list {
  justify-content: flex-start;
  padding-top: 4px;
}
.history-item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.status-badge-sm {
  font-size: 0.72rem;
  padding: 5px 10px;
  border-radius: 999px;
  font-weight: 700;
}
.status-badge-sm.warning {
  background: #FFF8E1;
  color: #B7791F;
}
.status-badge-sm.success {
  background: #DCFCE7;
  color: #166534;
}
.status-badge-sm.danger {
  background: #FEE2E2;
  color: #991B1B;
}
.history-date-chip {
  font-size: 0.76rem;
  color: var(--gray500);
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 4px 9px;
  border-radius: 999px;
}
.history-item-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.history-type-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.history-type-badge {
  display: inline-flex;
  align-items: center;
  background: #e8f1ff;
  color: #2155a3;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.72rem;
  font-weight: 700;
}
.history-period {
  font-size: 0.78rem;
  color: var(--gray500);
  line-height: 1.4;
}
.h-title {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--gray800);
  line-height: 1.45;
}
.history-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--gray500);
  font-size: 0.78rem;
}
.history-meta-label {
  color: var(--gray400);
}
.history-meta-value {
  color: var(--gray700);
  font-weight: 600;
}
.history-empty {
  flex: 1;
  min-height: 220px;
  border: 1px dashed #cbd5e1;
  border-radius: 18px;
  background: rgba(255,255,255,0.68);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 20px;
}
.history-empty-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: #eef6ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 700;
}
.history-empty-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.history-empty-text strong {
  color: var(--gray700);
  font-size: 0.95rem;
}
.history-empty-text span {
  color: var(--gray500);
  font-size: 0.82rem;
  line-height: 1.45;
}

.mb-4 { margin-bottom: 16px; }
.mb-2 { margin-bottom: 8px; }

/* Responsive */
@media (max-width: 1200px) {
  .top-row { flex-wrap: wrap; }
  .bottom-row { flex-direction: column; }
}
</style>
