<template>
  <div class="monthly-wrap">
    <!-- ═══ 상단: 리포트 헤더 + 요약 지표 ═══ -->
    <div class="monthly-card">
      <!-- 헤더: 월 선택 + 등급 -->
      <div class="report-header">
        <div class="report-header-left">
          <div class="month-selector">
            <button class="month-arrow" @click="prevMonth">
              <ChevronLeft :size="16" />
            </button>
            <span class="month-label">{{ currentYear }}년 {{ currentMonth }}월 성과 리포트</span>
            <button class="month-arrow" @click="nextMonth">
              <ChevronRight :size="16" />
            </button>
          </div>
          <p class="report-period">{{ currentYear }}년 {{ currentMonth }}월 1일 - {{ currentMonth }}월 {{ lastDay }}일</p>
        </div>
        <div v-if="isPerformanceManager" class="report-header-right">
          <label class="report-filter-label" for="member-filter">팀원 선택</label>
          <select id="member-filter" v-model="selectedMemberId" class="report-filter-select">
            <option v-for="member in teamMemberOptions" :key="member.id" :value="member.id">
              {{ member.name }} ({{ member.role }})
            </option>
          </select>
        </div>
      </div>

      <!-- 요약 지표 카드 -->
      <div class="stat-grid">
        <div v-for="stat in stats" :key="stat.label" class="stat-item">
          <div class="stat-icon-wrap" :style="{ background: stat.bgColor }">
            <component :is="stat.icon" :size="16" :style="{ color: stat.iconColor }" />
          </div>
          <div class="stat-info">
            <span class="stat-label">{{ stat.label }}</span>
            <span class="stat-value">{{ stat.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ 중간: 차트 ═══ -->
    <div class="monthly-card chart-card">
      <div class="chart-header">
        <h3 class="chart-title">
          <BarChart3 :size="16" />
          월별 성과 추이 (개인 vs 팀 평균)
        </h3>
        <div class="chart-legend">
          <span class="legend-item"><span class="legend-dot blue"></span>{{ personalLegendLabel }}</span>
          <span class="legend-item"><span class="legend-dot gray"></span>팀 평균</span>
        </div>
      </div>
      <div class="chart-wrap">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <!-- ═══ 하단: 월별 상세 항목 ═══ -->
    <div class="monthly-card">
      <div class="detail-header">
        <h3 class="detail-title">
          <FileText :size="16" />
          {{ currentMonth }}월 성과 상세 항목
        </h3>
        <span class="detail-count">총 {{ detailItems.length }}건</span>
      </div>
      <div class="detail-list">
        <div
          v-for="item in paginatedDetailItems"
          :key="item.id"
          class="detail-row"
          role="button"
          tabindex="0"
          @click="openDetailModal(item)"
          @keydown.enter="openDetailModal(item)"
        >
          <div class="detail-row-left">
            <span class="badge" :class="item.type === 'team' ? 'badge-blue' : 'badge-green'">
              {{ item.type === 'team' ? '팀' : '개인' }}
            </span>
            <div class="detail-row-info">
              <span class="detail-row-title">{{ item.title }}</span>
              <span class="detail-row-date">{{ item.date }}</span>
            </div>
          </div>
          <div class="detail-row-right">
            <div class="detail-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: item.progress + '%' }"></div>
              </div>
              <span class="progress-text">{{ item.progress }}%</span>
            </div>
            <span class="detail-score">{{ item.score }}점</span>
          </div>
        </div>
      </div>
      <div v-if="detailTotalPages > 1" class="detail-pagination">
        <button class="page-btn" :disabled="detailCurrentPage === 1" @click="detailCurrentPage--">이전</button>
        <span class="page-status">{{ detailCurrentPage }} / {{ detailTotalPages }}</span>
        <button class="page-btn" :disabled="detailCurrentPage === detailTotalPages" @click="detailCurrentPage++">다음</button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selectedDetailItem" class="modal-overlay" @click.self="closeDetailModal">
          <div class="modal-card">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <span class="badge" :class="selectedDetailItem.type === 'team' ? 'badge-blue' : 'badge-green'">
                  {{ selectedDetailItem.type === 'team' ? '팀' : '개인' }}
                </span>
                <h3 class="modal-title">성과 상세 조회</h3>
              </div>
              <button class="icon-close" @click="closeDetailModal">×</button>
            </div>

            <div class="modal-body">
              <div class="modal-summary">
                <h4>{{ selectedDetailItem.title }}</h4>
                <p>{{ selectedDetailItem.date }}</p>
              </div>

              <div class="modal-grid">
                <div class="modal-item">
                  <span class="modal-label">진행률</span>
                  <span class="modal-value">{{ selectedDetailItem.progress }}%</span>
                </div>
                <div class="modal-item">
                  <span class="modal-label">점수</span>
                  <span class="modal-value">{{ selectedDetailItem.score }}점</span>
                </div>
              </div>

              <div class="modal-section">
                <span class="modal-label">업무 상세 내용</span>
                <p class="modal-box">{{ selectedDetailItem.description }}</p>
              </div>

              <div class="modal-section" v-if="selectedDetailItem.achievement">
                <span class="modal-label">성과 요약</span>
                <p class="modal-box">{{ selectedDetailItem.achievement }}</p>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-outline" @click="closeDetailModal">닫기</button>
              <button class="btn-primary" @click="openFeedbackModal">피드백 보기</button>
            </div>
          </div>
        </div>
      </Transition>

      <Transition name="modal">
        <div v-if="showFeedbackModal && selectedDetailItem" class="modal-overlay" @click.self="closeFeedbackModal">
          <div class="modal-card modal-card-sm">
            <div class="modal-header">
              <h3 class="modal-title">피드백</h3>
              <button class="icon-close" @click="closeFeedbackModal">×</button>
            </div>

            <div class="feedback-list">
              <div v-for="feedback in selectedDetailItem.feedbacks" :key="feedback.id" class="feedback-item">
                <div class="feedback-head">
                  <span class="feedback-author">{{ feedback.author }}</span>
                  <span class="feedback-date">{{ feedback.date }}</span>
                </div>
                <p class="feedback-text">{{ feedback.text }}</p>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn-outline" @click="closeFeedbackModal">닫기</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ChevronLeft, ChevronRight, BarChart3, FileText, TrendingUp, Users, Award, Star } from 'lucide-vue-next'
import { Bar } from 'vue-chartjs'
import { getPerformanceMonthlyReport, getPerformanceTeamStats } from '@/api/performance'
import { AUTH_KEYS, USER_ROLES, isAdminRole, isEvaluatorRole } from '@/utils/auth'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)
const TREND_MONTH_COUNT = 6
const isPerformanceManager = computed(() => {
  const sessionRole = sessionStorage.getItem(AUTH_KEYS.role) || USER_ROLES.user
  return isEvaluatorRole() || isAdminRole() || sessionRole === USER_ROLES.admin
})
const teamMemberOptions = ref([])
const selectedMemberId = ref(teamMemberOptions.value[0]?.id || null)
const selectedMember = computed(() => teamMemberOptions.value.find((member) => member.id === selectedMemberId.value) || null)
const monthlyData = ref({
  initialYear: new Date().getFullYear(),
  initialMonth: new Date().getMonth() + 1,
  stats: [],
  chartLabels: [],
  myScores: [],
  teamScores: [],
  detailItems: [],
})
const currentOffset = ref(0)

const currentYear = computed(() => monthlyData.value.initialYear)
const currentMonth = computed(() => monthlyData.value.initialMonth)

const lastDay = computed(() => new Date(currentYear.value, currentMonth.value, 0).getDate())

function prevMonth() {
  currentOffset.value -= 1
}

function nextMonth() {
  currentOffset.value += 1
}

const recentChartLabels = computed(() => (monthlyData.value.chartLabels || []).slice(-TREND_MONTH_COUNT))
const recentMyScores = computed(() => (monthlyData.value.myScores || []).slice(-TREND_MONTH_COUNT))
const recentTeamScores = computed(() => (monthlyData.value.teamScores || []).slice(-TREND_MONTH_COUNT))
const personalLegendLabel = computed(() => {
  if (!isPerformanceManager.value || !selectedMember.value) return '내 점수'
  return `${selectedMember.value.name} 점수`
})

const currentMonthDataIndex = computed(() => {
  const monthLabel = `${currentMonth.value}월`
  const idx = recentChartLabels.value.findIndex((label) => label === monthLabel)
  return idx >= 0 ? idx : recentMyScores.value.length - 1
})

const currentMyScore = computed(() => recentMyScores.value[currentMonthDataIndex.value] ?? 0)
const currentTeamScore = computed(() => recentTeamScores.value[currentMonthDataIndex.value] ?? 0)

const monthChangePercent = computed(() => {
  const current = currentMyScore.value
  const prevIndex = currentMonthDataIndex.value - 1
  const prev = prevIndex >= 0 ? (recentMyScores.value[prevIndex] ?? 0) : 0
  if (!prev) return 0
  return ((current - prev) / prev) * 100
})

const totalScore = computed(() => currentMyScore.value)

const stats = computed(() => {
  if ((monthlyData.value.stats || []).length > 0) {
    const iconMap = [TrendingUp, Users, Award, Star]
    const colorMap = [
      { bgColor: '#eff6ff', iconColor: '#3b82f6' },
      { bgColor: '#f0fdf4', iconColor: '#22c55e' },
      { bgColor: '#fef3c7', iconColor: '#f59e0b' },
      { bgColor: '#faf5ff', iconColor: '#a855f7' },
    ]
    return monthlyData.value.stats.map((stat, index) => ({
      label: stat.label,
      value: stat.value,
      icon: iconMap[index] || Star,
      ...colorMap[index % colorMap.length],
    }))
  }

  return [
    { label: '개인 업무 달성률', value: `${currentMyScore.value}%`, icon: TrendingUp, bgColor: '#eff6ff', iconColor: '#3b82f6' },
    { label: '팀 업무 달성률', value: `${currentTeamScore.value}%`, icon: Users, bgColor: '#f0fdf4', iconColor: '#22c55e' },
    {
      label: '전월 대비 점수 변화율',
      value: `${monthChangePercent.value >= 0 ? '+' : ''}${monthChangePercent.value.toFixed(1)}%`,
      icon: Award,
      bgColor: '#fef3c7',
      iconColor: '#f59e0b',
    },
    { label: '종합 점수', value: `${totalScore.value}점`, icon: Star, bgColor: '#faf5ff', iconColor: '#a855f7' },
  ]
})

const chartData = computed(() => ({
  labels: recentChartLabels.value,
  datasets: [
    {
      label: personalLegendLabel.value,
      data: recentMyScores.value,
      backgroundColor: 'rgba(8, 145, 178, 0.85)',
      borderRadius: { topLeft: 5, topRight: 5 },
      barPercentage: 0.5,
      categoryPercentage: 0.6,
    },
    {
      label: '팀 평균',
      data: recentTeamScores.value,
      backgroundColor: 'rgba(203, 213, 225, 0.7)',
      borderRadius: { topLeft: 5, topRight: 5 },
      barPercentage: 0.5,
      categoryPercentage: 0.6,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 12, family: "'Noto Sans KR', sans-serif" }, color: '#94A3B8', padding: 8 },
    },
    y: {
      grid: { color: '#F1F5F9' },
      ticks: { font: { size: 12 }, color: '#94A3B8' },
      beginAtZero: false,
      min: 60,
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#fff',
      titleColor: '#1E293B',
      bodyColor: '#475569',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      cornerRadius: 10,
      padding: 12,
      boxPadding: 4,
    },
  },
}

const selectedDetailItem = ref(null)
const showFeedbackModal = ref(false)
const detailCurrentPage = ref(1)
const detailPageSize = 4

function openDetailModal(item) {
  selectedDetailItem.value = item
  showFeedbackModal.value = false
}

function closeDetailModal() {
  showFeedbackModal.value = false
  selectedDetailItem.value = null
}

function openFeedbackModal() {
  showFeedbackModal.value = true
}

function closeFeedbackModal() {
  showFeedbackModal.value = false
}

const detailItems = computed(() => monthlyData.value.detailItems || [])
const detailTotalPages = computed(() => Math.max(1, Math.ceil(detailItems.value.length / detailPageSize)))
const paginatedDetailItems = computed(() => {
  const start = (detailCurrentPage.value - 1) * detailPageSize
  return detailItems.value.slice(start, start + detailPageSize)
})

async function loadMemberOptions() {
  if (!isPerformanceManager.value) return
  try {
    const teamStats = await getPerformanceTeamStats()
    const members = (teamStats?.members || []).map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
    }))
    if (members.length > 0) {
      teamMemberOptions.value = members
      if (!members.some((member) => member.id === selectedMemberId.value)) {
        selectedMemberId.value = members[0].id
      }
    }
  } catch (_error) {}
}

async function loadMonthly() {
  try {
    const params = { offset: currentOffset.value }
    if (isPerformanceManager.value && selectedMemberId.value) {
      params.targetEmployeeId = selectedMemberId.value
    }
    const response = await getPerformanceMonthlyReport(params)
    if (response) monthlyData.value = response
  } catch (_error) {}
}

onMounted(async () => {
  await loadMemberOptions()
  await loadMonthly()
})

watch([selectedMemberId, currentOffset], loadMonthly)
watch([selectedMemberId, currentOffset], () => {
  detailCurrentPage.value = 1
})
watch(detailItems, () => {
  if (detailCurrentPage.value > detailTotalPages.value) {
    detailCurrentPage.value = detailTotalPages.value
  }
})
</script>

<style scoped>
/* ════════════════════════════════
   레이아웃
   ════════════════════════════════ */
.monthly-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  height: 100%;
}

.monthly-card {
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 24px;
}

/* ════════════════════════════════
   리포트 헤더
   ════════════════════════════════ */
.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.report-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.report-filter-label {
  font-size: 0.78rem;
  color: var(--gray500);
  font-weight: 600;
}

.report-filter-select {
  min-width: 210px;
  padding: 7px 10px;
  border: 1px solid var(--gray200);
  border-radius: var(--radius-xs);
  background: #fff;
  color: var(--gray700);
  font-size: 0.8rem;
  font-family: var(--font);
}

.month-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.month-arrow {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray500);
  background: var(--gray50);
  transition: all var(--transition);
}

.month-arrow:hover {
  background: var(--gray200);
  color: var(--gray700);
}

.month-label {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--gray800);
}

.report-period {
  font-size: 0.8rem;
  color: var(--gray400);
  padding-left: 40px;
}

.report-grade-wrap {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.report-grade {
  font-family: var(--font-num);
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--primary);
  line-height: 1;
}

.report-grade-label {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--gray400);
}

/* ════════════════════════════════
   요약 지표
   ════════════════════════════════ */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--gray50);
  border: 1px solid var(--gray100);
  border-radius: var(--radius-sm);
  transition: all var(--transition);
}

.stat-item:hover {
  box-shadow: var(--shadow);
}

.stat-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--gray500);
  margin-bottom: 2px;
}

.stat-value {
  font-family: var(--font-num);
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--gray800);
}

/* ════════════════════════════════
   차트
   ════════════════════════════════ */
.chart-card {
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.chart-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--gray800);
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-title svg {
  color: var(--gray400);
}

.chart-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray500);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.legend-dot.blue {
  background: var(--primary);
}

.legend-dot.gray {
  background: var(--gray300);
}

.chart-wrap {
  flex: 0 0 auto;
  height: 260px;
  min-height: 260px;
}

/* ════════════════════════════════
   상세 항목
   ════════════════════════════════ */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.detail-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--gray800);
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-title svg {
  color: var(--gray400);
}

.detail-count {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray400);
  background: var(--gray100);
  padding: 3px 10px;
  border-radius: 10px;
}

.detail-list {
  display: flex;
  flex-direction: column;
}

.detail-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.page-btn {
  min-width: 64px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--gray200);
  border-radius: var(--radius-xs);
  background: var(--gray50);
  color: var(--gray700);
  font-size: 0.82rem;
  cursor: pointer;
}

.page-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

.page-status {
  min-width: 52px;
  text-align: center;
  font-size: 0.82rem;
  color: var(--gray600);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid var(--gray100);
  transition: all var(--transition);
  cursor: pointer;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row:hover {
  background: var(--gray50);
  margin: 0 -24px;
  padding-left: 24px;
  padding-right: 24px;
  border-radius: var(--radius-xs);
}

.detail-row-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.detail-row-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.detail-row-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--gray800);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-row-date {
  font-size: 0.72rem;
  color: var(--gray400);
  margin-top: 2px;
}

.detail-row-right {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.detail-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  width: 80px;
  height: 5px;
  background: var(--gray100);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--primary);
  transition: width 0.5s ease;
}

.progress-text {
  font-family: var(--font-num);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray500);
  min-width: 32px;
}

.detail-score {
  font-family: var(--font-num);
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--primary);
  min-width: 40px;
  text-align: right;
}

/* 뱃지 */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.68rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.badge-blue { background: #dbeafe; color: #1e40af; }
.badge-green { background: #dcfce7; color: #166534; }

/* ════════════════════════════════
   모달
   ════════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  width: min(760px, 100%);
  max-height: calc(100vh - 40px);
  overflow: hidden;
  background: #fff;
  border-radius: 16px;
  border: 1px solid var(--gray200);
  box-shadow: 0 20px 60px rgba(2, 6, 23, 0.25);
  display: flex;
  flex-direction: column;
}

.modal-card-sm {
  width: min(620px, 100%);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid var(--gray100);
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: var(--gray900);
}

.icon-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: var(--gray500);
  background: var(--gray50);
  font-size: 20px;
  line-height: 1;
}

.icon-close:hover {
  background: var(--gray100);
  color: var(--gray700);
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.modal-summary h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray900);
}

.modal-summary p {
  margin: 6px 0 0;
  font-size: 0.82rem;
  color: var(--gray500);
}

.modal-grid {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.modal-item {
  background: var(--gray50);
  border: 1px solid var(--gray100);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.modal-label {
  font-size: 0.76rem;
  color: var(--gray500);
  font-weight: 600;
}

.modal-value {
  font-size: 0.92rem;
  color: var(--gray900);
  font-weight: 700;
}

.modal-section {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-box {
  margin: 0;
  padding: 12px;
  border: 1px solid var(--gray100);
  background: var(--gray50);
  border-radius: 10px;
  color: var(--gray700);
  font-size: 0.86rem;
  line-height: 1.55;
}

.feedback-list {
  padding: 18px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feedback-item {
  border: 1px solid var(--gray100);
  border-radius: 10px;
  background: var(--gray50);
  padding: 12px;
}

.feedback-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.feedback-author {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--gray900);
}

.feedback-date {
  font-size: 0.74rem;
  color: var(--gray400);
}

.feedback-text {
  margin: 0;
  font-size: 0.84rem;
  color: var(--gray700);
  line-height: 1.5;
}

.modal-footer {
  border-top: 1px solid var(--gray100);
  padding: 14px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-outline,
.btn-primary {
  padding: 9px 14px;
  border-radius: 9px;
  font-size: 0.83rem;
  font-weight: 700;
}

.btn-outline {
  border: 1px solid var(--gray200);
  background: #fff;
  color: var(--gray700);
}

.btn-outline:hover {
  background: var(--gray50);
}

.btn-primary {
  background: var(--primary);
  color: #fff;
}

.btn-primary:hover {
  filter: brightness(0.96);
}

.modal-enter-active { transition: all 0.22s ease; }
.modal-leave-active { transition: all 0.18s ease; }
.modal-enter-from { opacity: 0; }
.modal-leave-to { opacity: 0; }
.modal-enter-from .modal-card { transform: scale(0.96) translateY(8px); opacity: 0; }
.modal-leave-to .modal-card { transform: scale(0.98); opacity: 0; }

@media (max-width: 768px) {
  .modal-grid {
    grid-template-columns: 1fr;
  }

  .modal-header,
  .modal-body,
  .feedback-list,
  .modal-footer {
    padding-left: 14px;
    padding-right: 14px;
  }
}
</style>
