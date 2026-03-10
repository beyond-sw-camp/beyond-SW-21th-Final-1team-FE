<template>
  <div class="attendance-schedule">
    <!-- Header -->
    <div class="schedule-header-card">
      <div class="header-left">
        <div class="icon-calendar-rect">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </div>
        <div class="header-text">
          <h2 class="page-title">근무 일정</h2>
          <p class="page-desc">팀원들의 근무 일정과 휴가 현황을 확인하세요.</p>
        </div>
      </div>
      <div class="header-right">
        <div class="view-toggles">
          <button class="toggle-btn" :class="{ active: currentView === 'month' }" @click="currentView = 'month'">월간</button>
          <button class="toggle-btn" :class="{ active: currentView === 'week' }" @click="currentView = 'week'">주간</button>
          <button class="toggle-btn" :class="{ active: currentView === 'list' }" @click="currentView = 'list'">목록</button>
        </div>
        <button class="btn-add" @click="showRegisterModal = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          일정 등록
        </button>
      </div>
    </div>

    <div class="content-row">
      <!-- Left Sidebar -->
      <aside class="schedule-sidebar">
        <!-- 1. Mini Calendar -->
        <div class="sidebar-card mini-cal-card">
          <div class="mini-cal-header">
            <span class="mini-cal-title">{{ currentDate.year }}년 {{ currentDate.month }}월</span>
            <div class="mini-cal-nav">
              <button @click="prevMonth">&lt;</button>
              <button @click="nextMonth">&gt;</button>
            </div>
          </div>
          <div class="mini-cal-grid-header">
            <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
          </div>
          <div class="mini-cal-grid">
            <template v-for="week in miniCalendarGrid" :key="week[0].fullDate">
              <span 
                v-for="day in week" 
                :key="day.fullDate"
                :class="{ 
                  'prev-month': day.isPrevMonth || day.isNextMonth,
                  'today-circle': day.isToday 
                }"
              >
                {{ day.day }}
              </span>
            </template>
          </div>
        </div>

        <!-- 2. Team Filter -->
        <div class="sidebar-card filter-card">
          <h3 class="card-subtitle">팀원 필터</h3>
          <button class="filter-icon-btn">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          </button>
          
          <div class="filter-list">
            <div 
              class="filter-item" 
              :class="{ active: selectedFilter === 'ALL' }"
              @click="selectedFilter = 'ALL'"
            >
              <span class="avatar-circle blue">ALL</span>
              <span class="filter-name">전체 보기</span>
            </div>
            <div 
              class="filter-item" 
              :class="{ active: selectedFilter === 'user1' }"
              @click="selectedFilter = 'user1'"
            >
              <span class="avatar-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <div class="filter-info">
                <span class="filter-name bold">Steve 매니저</span>
                <span class="filter-sub">내 일정만 보기</span>
              </div>
            </div>
            <div 
              class="filter-item" 
              :class="{ active: selectedFilter === 'user2' }"
              @click="selectedFilter = 'user2'"
            >
              <span class="avatar-circle pink">S</span>
              <span class="filter-name">Sarah 사원</span>
            </div>
          </div>
        </div>

        <!-- 3. Legend -->
        <div class="sidebar-card legend-card">
          <h3 class="card-subtitle">범례</h3>
          <ul class="legend-list">
            <li><span class="dot blue"></span>기본 근무</li>
            <li><span class="dot pink"></span>휴가/연차</li>
            <li><span class="dot purple"></span>재택 근무</li>
            <li><span class="dot red"></span>휴무일</li>
          </ul>
        </div>
      </aside>

      <!-- Main Calendar -->
      <main class="schedule-main">
        <div class="main-cal-header">
          <h2 class="cal-title">{{ currentDate.year }}년 {{ currentDate.month }}월</h2>
          <div class="cal-nav">
            <button class="nav-btn" @click="prevMonth">&lt;</button>
            <button class="nav-btn" @click="nextMonth">&gt;</button>
          </div>
        </div>
        
        <div class="main-cal-content">
          <!-- Month View -->
          <div v-if="currentView === 'month'" class="main-cal-grid">
            <!-- Header Row -->
            <div class="cal-row header">
              <div class="cal-col sun">일</div>
              <div class="cal-col">월</div>
              <div class="cal-col">화</div>
              <div class="cal-col">수</div>
              <div class="cal-col">목</div>
              <div class="cal-col">금</div>
              <div class="cal-col sat">토</div>
            </div>

            <!-- Generate Month Grid Dynamically -->
            <div class="cal-row" v-for="week in calendarGrid" :key="week[0].fullDate">
              <div 
                v-for="day in week" 
                :key="day.fullDate" 
                class="cal-cell"
                :class="{ 
                  sun: day.dayOfWeek === 0, 
                  sat: day.dayOfWeek === 6,
                  today: day.isToday,
                  'prev-month': day.isPrevMonth || day.isNextMonth
                }"
              >
                <span class="day-num" :class="{ prev: day.isPrevMonth || day.isNextMonth }">{{ day.day }}</span>
                <span v-if="day.isToday" class="badge-today">Today</span>
                
                <!-- Events -->
                <div 
                  v-for="event in getEventsForDate(day.fullDate)" 
                  :key="event.id"
                  class="event-bar" 
                  :class="getEventColor(event.type)"
                >
                  {{ getEventLabel(event) }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Week View -->
          <div v-if="currentView === 'week'" class="main-cal-grid">
            <div class="cal-row header">
              <div class="cal-col sun">일</div>
              <div class="cal-col">월</div>
              <div class="cal-col">화</div>
              <div class="cal-col">수</div>
              <div class="cal-col">목</div>
              <div class="cal-col">금</div>
              <div class="cal-col sat">토</div>
            </div>
            
            <!-- Week View (Dynamic) -->
            <div class="cal-row week-view-row">
               <div 
                v-for="day in currentWeekGrid" 
                :key="day.fullDate" 
                class="cal-cell"
                :class="{ 
                  sun: day.dayOfWeek === 0, 
                  sat: day.dayOfWeek === 6,
                  today: day.isToday 
                }"
              >
                <span class="day-num">{{ day.day }}</span>
                <span v-if="day.isToday" class="badge-today">Today</span>
                
                <div 
                  v-for="event in getEventsForDate(day.fullDate)" 
                  :key="event.id"
                  class="event-bar" 
                  :class="getEventColor(event.type)"
                >
                  {{ getEventLabel(event) }}
                </div>
              </div>
            </div>
          </div>

          <!-- List View (Special Events Only) -->
          <div v-if="currentView === 'list'" class="list-view-container">
            <div class="list-view-header">
              <span class="list-col-date">날짜</span>
              <span class="list-col-type">구분</span>
              <span class="list-col-title">내용</span>
              <span class="list-col-memo">메모</span>
            </div>
            <div class="list-view-body">
              <div v-for="event in specialEvents" :key="event.id" class="list-row">
                 <div class="list-col-date">{{ event.startDate.substring(5, 10).replace('-', '.') }}</div>
                 <div class="list-col-type">
                   <span class="type-badge" :class="getEventColor(event.type)">{{ getTypeLabel(event.type) }}</span>
                 </div>
                 <div class="list-col-title">{{ event.title }}</div>
                 <div class="list-col-memo">{{ event.memo || '-' }}</div>
              </div>
              <div v-if="specialEvents.length === 0" class="no-data">
                특별한 일정이 없습니다.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Schedule Registration Modal -->
    <BaseModal v-model="showRegisterModal" width="500px">
      <div class="modal-header">
        <h3 class="modal-title">일정 등록</h3>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">일정 제목</label>
          <input type="text" v-model="scheduleForm.title" class="form-input" placeholder="일정 제목을 입력하세요" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">시작 일시</label>
            <input type="datetime-local" v-model="scheduleForm.startDate" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">종료 일시</label>
            <input type="datetime-local" v-model="scheduleForm.endDate" class="form-input" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">일정 구분</label>
          <select v-model="scheduleForm.type" class="form-select">
            <option value="work">기본 근무</option>
            <option value="meeting">회의/미팅</option>
            <option value="trip">출장/외근</option>
            <option value="vacation">휴가</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">메모</label>
          <textarea v-model="scheduleForm.memo" class="form-textarea" placeholder="메모를 입력하세요" rows="3"></textarea>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn-cancel" @click="showRegisterModal = false">취소</button>
        <button class="btn-submit" @click="handleRegister">등록</button>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'

const currentView = ref('month')
const showRegisterModal = ref(false)
const selectedFilter = ref('user1') // Default to 'user1' (Steve) as per requirement? Or 'ALL'? User request says "If click ALL... if click Sarah". Let's default to 'user1' (My schedule) as usually initial view.
// Actually, let's default to 'ALL' or 'user1' based on context. Typically 'My Schedule' is default. 
// User request: "If I click ALL button... If I click Sarah..."
// Let's set default to 'user1' (Steve - implied 'me').

// Date logic
const today = new Date()
const currentDate = ref({
  year: today.getFullYear(),
  month: today.getMonth() + 1,
  day: today.getDate()
})

// Mock Data: Initial events
// Mock Data: Initial events with user IDs
// user1: Steve (Manager), user2: Sarah (Employee)


// Generate Dynamic Calendar
const generateCalendar = (year, month) => {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const startDayOfWeek = firstDay.getDay() // 0 (Sun) to 6 (Sat)
  const daysInMonth = lastDay.getDate()
  
  // Previous month padding
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate()
  const days = []
  
  // Add prev month days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i
    const dateStr = `${year}-${String(month - 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` // Simplified logic, robust version below
    // Correct date navigation for prev month/year boundary
    const pmDate = new Date(year, month - 2, d)
    const pmStr = `${pmDate.getFullYear()}-${String(pmDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    
    days.push({
      day: d,
      fullDate: pmStr,
      dayOfWeek: new Date(pmStr).getDay(),
      isPrevMonth: true,
      isToday: false
    })
  }
  
  // Add current month days
  const todayStr = new Date().toISOString().slice(0, 10)
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    days.push({
      day: i,
      fullDate: dateStr,
      dayOfWeek: new Date(dateStr).getDay(),
      isToday: dateStr === todayStr
    })
  }
  
  // Add next month days (fill to 35 or 42 cells)
  const totalCells = days.length > 35 ? 42 : 35
  const remainingCells = totalCells - days.length
  for (let i = 1; i <= remainingCells; i++) {
    // Next month/year boundary
    const nmDate = new Date(year, month, i)
    const nmStr = `${nmDate.getFullYear()}-${String(nmDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    
    days.push({
      day: i,
      fullDate: nmStr,
      dayOfWeek: nmDate.getDay(),
      isNextMonth: true,
      isToday: false
    })
  }

  // Chunk into weeks
  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
}

const calendarGrid = computed(() => {
  return generateCalendar(currentDate.value.year, currentDate.value.month)
})

const miniCalendarGrid = computed(() => {
  return generateCalendar(currentDate.value.year, currentDate.value.month)
})

const currentWeekGrid = computed(() => {
  // Find the week containing today, or the first week of the month
  const todayStr = new Date().toISOString().slice(0, 10)
  for (const week of calendarGrid.value) {
    if (week.find(d => d.fullDate === todayStr)) {
      return week
    }
  }
  return calendarGrid.value[0] // Fallback to first week if today not in view (e.g. browsing other months)
})

const prevMonth = () => {
  if (currentDate.value.month === 1) {
    currentDate.value.year--
    currentDate.value.month = 12
  } else {
    currentDate.value.month--
  }
}

const nextMonth = () => {
  if (currentDate.value.month === 12) {
    currentDate.value.year++
    currentDate.value.month = 1
  } else {
    currentDate.value.month++
  }
}

// Generate Mock Data Relative to TODAY
const generateMockEvents = () => {
  const events = []
  const baseDate = new Date()
  const year = baseDate.getFullYear()
  const month = String(baseDate.getMonth() + 1).padStart(2, '0')
  const daysInMonth = new Date(year, baseDate.getMonth() + 1, 0).getDate()

  // Add some fixed events relative to current month
  // Steve: Vacation on 11th
  if (11 <= daysInMonth) events.push({ id: 8, userId: 'user1', title: '연차', type: 'vacation', startDate: `${year}-${month}-11T00:00`, endDate: `${year}-${month}-11T23:59` })
  // Sarah: WFH on 20th
  if (20 <= daysInMonth) events.push({ id: 15, userId: 'user2', title: '재택 근무', type: 'work_home', startDate: `${year}-${month}-20T09:00`, endDate: `${year}-${month}-20T18:00` })
  // Steve: Trip on 25th
  if (25 <= daysInMonth) events.push({ id: 18, userId: 'user1', title: '외근', type: 'trip', startDate: `${year}-${month}-25T09:00`, endDate: `${year}-${month}-25T18:00` })

  return events
}

const scheduleEvents = ref(generateMockEvents())

const users = [
  { id: 'user1', name: 'Steve' },
  { id: 'user2', name: 'Sarah' }
]

const getEventsForDate = (date) => {
  const dayOfWeek = new Date(date).getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  
  // 1. Existing events
  const existingEvents = scheduleEvents.value.filter(e => e.startDate.startsWith(date))

  // 2. Determine target users based on filter
  let targetUserIds = []
  if (selectedFilter.value === 'ALL') {
    targetUserIds = users.map(u => u.id)
  } else {
    targetUserIds = [selectedFilter.value]
  }

  const finalEvents = []

  targetUserIds.forEach(userId => {
    // Check if user has explicit event
    const userEvent = existingEvents.find(e => e.userId === userId)
    
    if (userEvent) {
      finalEvents.push(userEvent)
    } else {
      // If no event and it's a weekday, add Basic Work
      if (!isWeekend) {
        finalEvents.push({
          id: `auto-${userId}-${date}`,
          userId: userId,
          title: '기본 근무',
          type: 'work',
          startDate: `${date}T09:00`,
          endDate: `${date}T18:00`
        })
      }
    }
  })

  // Sort by user ID to keep order consistent in ALL view
  return finalEvents.sort((a, b) => a.userId.localeCompare(b.userId))
}

const getEventColor = (type) => {
  if (type === 'work') return 'blue'
  if (type === 'vacation') return 'pink'
  if (type === 'work_home' || type === 'remote') return 'purple'
  if (type === 'trip') return 'green'
  return 'blue'
}

const getEventLabel = (event) => {
  let label = event.title
  if (event.type === 'work') label = `🕒 09:00 - 18:00`
  else if (event.type === 'vacation') label = `🏖️ ${event.title}`
  else if (event.type === 'work_home') label = `🏠 ${event.title}`
  else if (event.type === 'trip') label = `🚗 ${event.title}`
  
  // In ALL view, prepend name
  if (selectedFilter.value === 'ALL' && event.userId) {
    const user = users.find(u => u.id === event.userId)
    const name = user ? user.name : ''
    return `${name} ${label}`
  }
  
  return label
}

const getTypeLabel = (type) => {
  const map = { work: '근무', vacation: '휴가', work_home: '재택', trip: '외근', meeting: '미팅' }
  return map[type] || type
}

// Special items for List View (exclude basic work)
const specialEvents = computed(() => {
  return scheduleEvents.value
    .filter(e => e.type !== 'work')
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
})

const scheduleForm = ref({
  title: '',
  startDate: '',
  endDate: '',
  type: 'work',
  memo: ''
})

const handleRegister = () => {
  const newId = scheduleEvents.value.length + 1
  scheduleEvents.value.push({
    id: newId,
    title: scheduleForm.value.title || '새 일정',
    type: scheduleForm.value.type,
    startDate: scheduleForm.value.startDate, // ISO string from input
    endDate: scheduleForm.value.endDate,
    memo: scheduleForm.value.memo
  })
  alert('일정이 등록되었습니다.')
  showRegisterModal.value = false
  // Reset form
  scheduleForm.value = { title: '', startDate: '', endDate: '', type: 'work', memo: '' }
}
</script>

<style scoped>
.attendance-schedule {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100vh - var(--header-h) - 48px);
  overflow: hidden;
}

/* Header */
.schedule-header-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--gray200);
}
.header-left {
  display: flex; gap: 16px; align-items: center;
}
.icon-calendar-rect {
  width: 48px; height: 48px;
  background: #EBF5FF; /* Slight blue tint */
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: var(--primary);
}
.page-title { font-size: 1.2rem; font-weight: 700; color: var(--gray900); margin-bottom: 4px; }
.page-desc { font-size: 0.9rem; color: var(--gray500); }

.header-right {
  display: flex; gap: 16px; align-items: center;
}
.view-toggles {
  display: flex; background: var(--gray50); border-radius: 6px; padding: 4px; gap: 4px;
}
.toggle-btn {
  border: none; background: transparent; padding: 6px 12px;
  font-size: 0.9rem; color: var(--gray500); cursor: pointer; border-radius: 4px;
}
.toggle-btn.active { background: #fff; color: var(--gray900); font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

.btn-add {
  display: flex; align-items: center; gap: 6px;
  background: var(--primary); color: #fff;
  border: none; padding: 8px 16px; border-radius: 8px;
  font-size: 0.9rem; font-weight: 600; cursor: pointer;
}
.btn-add:hover { opacity: 0.9; }


/* Content Row */
.content-row {
  display: flex; gap: 16px;
  flex: 1;
  min-height: 0;
}

/* Sidebar */
.schedule-sidebar {
  width: 280px;
  display: flex; flex-direction: column; gap: 16px;
  overflow-y: auto;
}
.sidebar-card {
  background: #fff; border-radius: 12px; border: 1px solid var(--gray200);
  padding: 20px;
}

/* 1. Mini Calendar */
.mini-cal-card { display: flex; flex-direction: column; gap: 16px; }
.mini-cal-header { display: flex; justify-content: space-between; align-items: center; }
.mini-cal-title { font-weight: 700; font-size: 1rem; color: var(--gray900); }
.mini-cal-nav button { border: none; background: transparent; cursor: pointer; color: var(--gray500); font-size: 1rem; }
.mini-cal-grid-header, .mini-cal-grid {
  display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-size: 0.8rem;
}
.mini-cal-grid-header { color: var(--gray500); margin-bottom: 8px; }
.mini-cal-grid { row-gap: 8px; }
.mini-cal-grid span { 
  display: flex; align-items: center; justify-content: center; 
  height: 28px; width: 28px; margin: 0 auto; border-radius: 50%; cursor: pointer;
  color: var(--gray800);
}
.prev-month { color: var(--gray300) !important; }
.today-circle { background: var(--primary); color: #fff !important; font-weight: 700; }

/* 2. Team Filter */
.filter-card { position: relative; }
.card-subtitle { font-size: 0.95rem; font-weight: 700; color: var(--gray800); margin-bottom: 16px; }
.filter-icon-btn { 
  position: absolute; top: 20px; right: 20px; 
  border: none; background: transparent; color: var(--gray400); cursor: pointer; 
}
.filter-list { display: flex; flex-direction: column; gap: 12px; }
.filter-item { display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 8px; cursor: pointer; }
.filter-item.active { background: var(--gray50); }
.avatar-circle {
  width: 36px; height: 36px; border-radius: 50%; 
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; color: #fff; font-weight: 600;
}
.avatar-circle.blue { background: #3B82F6; }
.avatar-circle.pink { background: #EC4899; }
.avatar-icon {
  width: 36px; height: 36px; border-radius: 50%; background: #E5E7EB;
  display: flex; align-items: center; justify-content: center; color: var(--gray600);
}
.filter-info { display: flex; flex-direction: column; }
.filter-name { font-size: 0.9rem; color: var(--gray700); }
.filter-name.bold { font-weight: 700; color: var(--gray900); }
.filter-sub { font-size: 0.75rem; color: var(--gray500); }

/* 3. Legend */
.legend-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.legend-list li { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--gray600); }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot.blue { background: #3B82F6; }
.dot.pink { background: #EC4899; }
.dot.purple { background: #A855F7; }
.dot.red { background: #EF4444; }


/* Main Calendar */
.schedule-main {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--gray200);
  display: flex; flex-direction: column;
  overflow: hidden;
}
.main-cal-header {
  padding: 20px 24px; border-bottom: 1px solid var(--gray200);
  display: flex; align-items: center; gap: 16px;
}
.cal-title { font-size: 1.4rem; font-weight: 800; color: var(--gray900); }
.cal-nav .nav-btn {
  border: 1px solid var(--gray200); background: #fff;
  width: 32px; height: 32px; border-radius: 4px;
  cursor: pointer; color: var(--gray600);
  margin-right: 4px;
}
.cal-nav .nav-btn:hover { background: var(--gray50); }

.main-cal-grid {
  flex: 1;
  display: flex; flex-direction: column;
  overflow-y: auto;
}
.cal-row { display: flex; flex: 1; border-bottom: 1px solid var(--gray100); min-height: 100px; }
.cal-row.header { 
  flex: 0 0 40px; min-height: 40px; border-bottom: 1px solid var(--gray200); background: var(--gray50);
}
.cal-col {
  flex: 1; display: flex; align-items: center; justify-content: center;
  font-size: 0.9rem; font-weight: 600; color: var(--gray600);
  border-right: 1px solid var(--gray100);
}
.cal-col.sun { color: var(--red); }
.cal-col.sat { color: #3B82F6; }

.cal-cell {
  flex: 1; border-right: 1px solid var(--gray100);
  padding: 8px;
  display: flex; flex-direction: column; gap: 4px;
}
.cal-cell.sun .day-num { color: var(--red); }
.cal-cell.sat .day-num { color: #3B82F6; }
.cal-cell:last-child { border-right: none; }
.day-num { font-size: 0.9rem; font-weight: 600; color: var(--gray700); margin-bottom: 4px; }
.day-num.prev { color: var(--gray300); }

.badge-today {
  display: inline-block; background: #E0F2FE; color: var(--primary);
  font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;
  margin-left: 6px; vertical-align: middle;
}

.event-bar {
  font-size: 0.75rem; padding: 4px 8px; border-radius: 4px;
  margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.event-bar.blue { background: #EFF6FF; color: #1E40AF; border: 1px solid #DBEAFE; }
.event-bar.pink { background: #FDF2F8; color: #BE185D; border: 1px solid #FCE7F3; }
.event-bar.purple { background: #FAF5FF; color: #7E22CE; border: 1px solid #F3E8FF; }
.event-bar.green { background: #ECFDF5; color: #047857; border: 1px solid #D1FAE5; }


.main-cal-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* View Placeholders */
.view-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--gray500);
  background: var(--gray50);
}
.placeholder-icon { font-size: 3rem; margin-bottom: 16px; opacity: 0.5; }
.view-placeholder h3 { font-size: 1.2rem; margin-bottom: 8px; color: var(--gray700); }

/* Modal Form Styles */
.modal-header { margin-bottom: 24px; }
.modal-title { font-size: 1.25rem; font-weight: 700; color: var(--gray900); }
.modal-body { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-row { display: flex; gap: 16px; }
.form-row .form-group { flex: 1; }
.form-label { font-size: 0.9rem; font-weight: 600; color: var(--gray700); }
.form-input, .form-select, .form-textarea {
  padding: 10px 12px;
  border: 1px solid var(--gray300);
  border-radius: 6px;
  font-size: 0.95rem;
  width: 100%;
}
.form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--primary); outline: none; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; }
.btn-cancel {
  padding: 10px 20px; border: 1px solid var(--gray300); background: #fff;
  border-radius: 6px; cursor: pointer; color: var(--gray700); font-weight: 600;
}
.btn-submit {
  padding: 10px 20px; border: none; background: var(--primary);
  border-radius: 6px; cursor: pointer; color: #fff; font-weight: 600;
}
.btn-submit:hover { opacity: 0.9; }
.week-view-row {
  flex: 1; /* Take up full height in week view */
  min-height: 400px;
}
/* List View Styles */
.list-view-container {
  display: flex; flex-direction: column; height: 100%;
}
.list-view-header {
  display: flex; padding: 12px 16px; background: var(--gray50);
  border-bottom: 1px solid var(--gray200); font-weight: 600; color: var(--gray600); font-size: 0.9rem;
}
.list-view-body { flex: 1; overflow-y: auto; }
.list-row {
  display: flex; padding: 14px 16px; border-bottom: 1px solid var(--gray100);
  align-items: center; color: var(--gray800); font-size: 0.95rem;
}
.list-row:hover { background: var(--gray50); }

.list-col-date { width: 120px; font-weight: 600; color: var(--gray600); }
.list-col-type { width: 100px; display: flex; align-items: center; }
.list-col-title { flex: 1; font-weight: 600; }
.list-col-memo { flex: 1; color: var(--gray500); font-size: 0.85rem; }

.type-badge {
  padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700;
}
.type-badge.pink { background: #FCE7F3; color: #BE185D; }
.type-badge.purple { background: #F3E8FF; color: #7E22CE; }
.type-badge.green { background: #D1FAE5; color: #047857; }
.type-badge.blue { background: #DBEAFE; color: #1E40AF; }

.no-data {
  padding: 40px; text-align: center; color: var(--gray400); font-size: 0.9rem;
}
</style>
