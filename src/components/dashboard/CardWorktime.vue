<template>
  <div class="card fade-up delay-4 worktime-card">
    <div class="card-header">
      <div class="wt-tabs">
        <div v-for="tab in tabs" :key="tab.key" class="wt-tab" :class="{active:activeTab===tab.key}" @click="activeTab=tab.key">{{tab.label}}</div>
      </div>
      <span class="icon-refresh">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
      </span>
    </div>
    <div class="card-body">
      <div class="wt-week">{{ periodLabel }}</div>
      <div class="wt-value">
        <span class="wt-num font-num">{{ totalHours }}</span>
        <span class="wt-unit">h</span>
      </div>
      <div class="wt-chart">
        <svg viewBox="0 0 300 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.18"/>
              <stop offset="100%" stop-color="#06B6D4" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <polyline :points="chartLinePoints" fill="none" stroke="#06B6D4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline :points="chartAreaPoints" fill="url(#chartGrad)" stroke="none"/>
        </svg>
      </div>
      <div class="wt-days">
        <span v-for="d in chartLabels" :key="d">{{ d }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAttendanceStore } from '@/store/attendance'

const activeTab = ref('weekly')
const tabs = [
  { key: 'weekly', label: '주간 근무시간' },
  { key: 'monthly', label: '월간 근무시간' },
]

const store = useAttendanceStore()

const parseDateKey = (dateText) => {
  const [y, m, d] = String(dateText || '').split('-').map(Number)
  return new Date(y || 1970, (m || 1) - 1, d || 1)
}

const toDateKey = (dateObj) => {
  const y = dateObj.getFullYear()
  const m = String(dateObj.getMonth() + 1).padStart(2, '0')
  const d = String(dateObj.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const parseWorkHours = (text) => {
  if (!text) return 0
  const matched = String(text).match(/(\d+)\s*h(?:\s*(\d+)\s*m)?/)
  if (!matched) return 0
  const h = Number(matched[1] || 0)
  const m = Number(matched[2] || 0)
  return h * 60 + m
}

const myRecords = computed(() => {
  return store.dailyAttendance
    .filter((item) => item.userId === 'user1')
    .map((item) => ({ ...item, dateObj: parseDateKey(item.date) }))
})

const today = computed(() => new Date())

const startOfWeek = computed(() => {
  const d = new Date(today.value)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
})

const endOfWeek = computed(() => {
  const d = new Date(startOfWeek.value)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
})

const weeklyRecords = computed(() => {
  return myRecords.value.filter((item) => item.dateObj >= startOfWeek.value && item.dateObj <= endOfWeek.value)
})

const monthlyRecords = computed(() => {
  const y = today.value.getFullYear()
  const m = today.value.getMonth()
  return myRecords.value.filter((item) => item.dateObj.getFullYear() === y && item.dateObj.getMonth() === m)
})

const totalMinutesByTab = computed(() => {
  const source = activeTab.value === 'weekly' ? weeklyRecords.value : monthlyRecords.value
  return source.reduce((sum, row) => sum + parseWorkHours(row.workHours), 0)
})

const totalHours = computed(() => (totalMinutesByTab.value / 60).toFixed(1).replace('.0', ''))

const periodLabel = computed(() => {
  if (activeTab.value === 'weekly') {
    const month = startOfWeek.value.getMonth() + 1
    const weekNum = Math.ceil(startOfWeek.value.getDate() / 7)
    return `${month}월 ${weekNum}주`
  }
  const y = today.value.getFullYear()
  const m = today.value.getMonth() + 1
  return `${y}년 ${m}월`
})

const weeklySeries = computed(() => {
  const labels = ['월', '화', '수', '목', '금', '토', '일']
  const values = labels.map((_, idx) => {
    const target = new Date(startOfWeek.value)
    target.setDate(startOfWeek.value.getDate() + idx)
    const key = toDateKey(target)
    const row = weeklyRecords.value.find((item) => item.date === key)
    return Number((parseWorkHours(row?.workHours) / 60).toFixed(1))
  })
  return { labels, values }
})

const monthlySeries = computed(() => {
  const base = new Date(today.value.getFullYear(), today.value.getMonth(), 1)
  const labels = Array.from({ length: 6 }, (_, idx) => {
    const d = new Date(base.getFullYear(), base.getMonth() - (5 - idx), 1)
    return `${d.getMonth() + 1}월`
  })
  const values = labels.map((_, idx) => {
    const d = new Date(base.getFullYear(), base.getMonth() - (5 - idx), 1)
    const y = d.getFullYear()
    const m = d.getMonth()
    const total = myRecords.value
      .filter((item) => item.dateObj.getFullYear() === y && item.dateObj.getMonth() === m)
      .reduce((sum, row) => sum + parseWorkHours(row.workHours), 0)
    return Number((total / 60).toFixed(1))
  })
  return { labels, values }
})

const activeSeries = computed(() => (activeTab.value === 'weekly' ? weeklySeries.value : monthlySeries.value))
const chartLabels = computed(() => activeSeries.value.labels)

const buildChartPoints = (values) => {
  const width = 280
  const left = 10
  const right = 290
  const top = 20
  const bottom = 85
  const max = Math.max(1, ...values)
  const step = values.length > 1 ? width / (values.length - 1) : 0
  return values
    .map((val, idx) => {
      const x = left + step * idx
      const y = bottom - ((val / max) * (bottom - top))
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

const chartLinePoints = computed(() => buildChartPoints(activeSeries.value.values))
const chartAreaPoints = computed(() => `${chartLinePoints.value} 290,100 10,100`)
</script>

<style scoped>
.worktime-card{height:100%}
.wt-tabs{display:flex;gap:0}
.wt-tab{
  font-size:0.85rem;font-weight:600;color:var(--gray400);cursor:pointer;
  padding-bottom:4px;margin-right:14px;border-bottom:2px solid transparent;
  transition:all var(--transition);
}
.wt-tab.active{color:var(--gray800);border-bottom-color:var(--gray800)}
.icon-refresh{color:var(--gray400);cursor:pointer;display:flex}
.icon-refresh:hover{color:var(--gray600)}
.wt-week{font-size:0.78rem;color:var(--gray400);margin-bottom:2px}
.wt-num{font-size:2.5rem;font-weight:800;color:var(--gray800);line-height:1}
.wt-unit{font-size:1rem;font-weight:400;color:var(--secondary);margin-left:2px}
.wt-chart{width:100%;height:130px;margin-top:14px}
.wt-chart svg{width:100%;height:100%}
.wt-days{display:flex;justify-content:space-between;margin-top:5px;padding:0 6px}
.wt-days span{font-size:0.7rem;color:var(--gray400)}
</style>
