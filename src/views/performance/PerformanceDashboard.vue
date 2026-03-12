<template>
  <div class="perf-dashboard">
    <div v-if="dashboardError" class="dashboard-error">
      <span>{{ dashboardError }}</span>
      <button type="button" class="dashboard-retry" @click="loadDashboard">다시 시도</button>
    </div>
    <!-- Top Section: Key Metrics -->
    <div class="perf-metrics" :class="{ 'perf-metrics--manager': isPerformanceManager }">
      <!-- Metric 1 -->
      <div class="metric-card">
        <div class="metric-deco blue"></div>
        <div class="metric-body">
          <h3 class="metric-label">개인 KPI 달성률</h3>
          <div class="metric-value-row">
            <span class="metric-num">{{ personalKpiAchievementRate }}%</span>
            <span class="metric-change blue">
              <TrendingUp :size="13" /> 종합 반영
            </span>
          </div>
          <div class="metric-bar">
            <div class="metric-fill blue" :style="{ width: `${personalKpiAchievementRate}%` }"></div>
          </div>
        </div>
      </div>

      <!-- Metric 2 -->
      <div class="metric-card">
        <div class="metric-deco green"></div>
        <div class="metric-body">
          <h3 class="metric-label">팀 KPI 달성률</h3>
          <div class="metric-value-row">
            <span class="metric-num">{{ teamKpiAchievementRate }}%</span>
            <span class="metric-change green">
              <Target :size="13" /> 월간 집계
            </span>
          </div>
          <div class="metric-bar">
            <div class="metric-fill green" :style="{ width: `${teamKpiAchievementRate}%` }"></div>
          </div>
        </div>
      </div>

      <!-- Metric 3 -->
      <div class="metric-card">
        <div class="metric-deco purple"></div>
        <div class="metric-body">
          <h3 class="metric-label">이번 달 핵심 목표 진행률</h3>
          <div class="metric-value-row">
            <span class="metric-num">{{ monthlyCoreGoalProgressRate }}%</span>
            <span class="metric-change purple">
              <Award :size="13" /> {{ scoreChangeRateText }}
            </span>
          </div>
          <div class="metric-bar">
            <div class="metric-fill purple" :style="{ width: `${monthlyCoreGoalProgressRate}%` }"></div>
          </div>
        </div>
      </div>

      <button
        v-if="isPerformanceManager"
        type="button"
        class="metric-card metric-card--pending"
        @click="perfStore.setPage('approval-list')"
      >
        <div class="metric-deco orange"></div>
        <div class="metric-body">
          <h3 class="metric-label">승인 대기</h3>
          <div class="metric-value-row">
            <span class="metric-num">{{ pendingApprovalCount }}건</span>
            <span class="metric-change orange">
              <Target :size="13" /> 확인 필요
            </span>
          </div>
          <div class="metric-bar">
            <div class="metric-fill orange" style="width: 100%"></div>
          </div>
        </div>
      </button>
    </div>

    <!-- Middle Section: Monthly Trend -->
    <div class="perf-chart-card">
      <h3 class="section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M12 18v-6" /><path d="M8 18v-1" /><path d="M16 18v-3" />
        </svg>
        개인별 월별 성과 추이
      </h3>
      <div class="chart-wrap">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>

    <!-- Bottom Section: Feedback -->
    <div class="perf-feedback-card">
      <h3 class="section-title">
        <MessageSquare :size="18" /> 최근 업무 피드백
      </h3>
      <div class="feedback-list">
        <button
          v-for="item in feedbacks"
          :key="item.id"
          type="button"
          class="feedback-item"
          @click="openFeedbackModal(item)"
        >
          <div class="feedback-head">
            <span class="feedback-author">{{ item.author }}</span>
            <span class="feedback-date">{{ item.date }}</span>
          </div>
          <p class="feedback-text">{{ item.text }}</p>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selectedFeedback" class="modal-overlay" @click.self="closeFeedbackModal">
          <div class="modal-card">
            <div class="modal-header">
              <h3 class="modal-title">피드백 상세</h3>
              <button class="modal-close" type="button" @click="closeFeedbackModal">×</button>
            </div>
            <div class="modal-body">
              <div class="modal-meta">
                <span>{{ selectedFeedback.author }}</span>
                <span>{{ selectedFeedback.date }}</span>
              </div>
              <div class="modal-section">
                <span class="modal-label">업무명</span>
                <p class="modal-value">{{ selectedInquiryItem?.title || '-' }}</p>
              </div>
              <div class="modal-section">
                <span class="modal-label">업무 기간</span>
                <p class="modal-value">{{ selectedInquiryItem?.date || '-' }}</p>
              </div>
              <div class="modal-section">
                <span class="modal-label">성과 조회 상태</span>
                <p class="modal-value">{{ selectedInquiryItem?.status || '-' }} / {{ selectedInquiryItem?.progress ?? '-' }}%</p>
              </div>
              <div class="modal-section">
                <span class="modal-label">피드백 내용</span>
                <p class="modal-value">{{ selectedFeedback.text }}</p>
              </div>
              <div class="modal-section">
                <span class="modal-label">업무 상세</span>
                <p class="modal-value">{{ selectedFeedback.detail }}</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { TrendingUp, Target, Award, MessageSquare } from 'lucide-vue-next'
import { Line } from 'vue-chartjs'
import { usePerformanceStore } from '@/store/performance'
import { isAdminRole, isEvaluatorRole, sessionRoleCodesRef, sessionRoleRef } from '@/utils/auth'
import { getPerformanceDashboard, getPerformanceInquiryItems } from '@/api/performance'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

const perfStore = usePerformanceStore()
const isPerformanceManager = computed(() =>
  isEvaluatorRole(sessionRoleCodesRef.value) || isAdminRole(sessionRoleCodesRef.value, sessionRoleRef.value))
const dashboardError = ref('')
const dashboard = ref({
  pendingApprovalCount: 0,
  trendLabels: [],
  trendScores: [],
  feedbacks: [],
})
const inquiryItems = ref([])
const pendingApprovalCount = computed(() => dashboard.value.pendingApprovalCount || 0)
const summary = computed(() => dashboard.value.summary || {})
const personalKpiAchievementRate = computed(() => Number(summary.value.personalKpiAchievementRate || 0))
const teamKpiAchievementRate = computed(() => Number(summary.value.teamKpiAchievementRate || 0))
const monthlyCoreGoalProgressRate = computed(() => Number(summary.value.monthlyCoreGoalProgressRate || 0))
const scoreChangeRate = computed(() => Number(summary.value.scoreChangeRate || 0))
const scoreChangeRateText = computed(() => {
  const value = scoreChangeRate.value
  if (value > 0) return `+${value}%`
  if (value < 0) return `${value}%`
  return '변동 없음'
})

const chartData = computed(() => ({
  labels:
    Array.isArray(dashboard.value.trendLabels) && dashboard.value.trendLabels.length > 0
      ? dashboard.value.trendLabels
      : ['데이터 없음'],
  datasets: [
    {
      label: '성과',
      data:
        Array.isArray(dashboard.value.trendScores) && dashboard.value.trendScores.length > 0
          ? dashboard.value.trendScores
          : [0],
      borderColor: '#3b82f6',
      borderWidth: 3,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 7,
      tension: 0.4,
      fill: false,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 12 }, color: '#6b7280' },
    },
    y: {
      grid: { color: '#f3f4f6' },
      ticks: { font: { size: 12 }, color: '#6b7280' },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#fff',
      titleColor: '#111827',
      bodyColor: '#374151',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      cornerRadius: 12,
      padding: 12,
    },
  },
}

const feedbacks = computed(() => dashboard.value.feedbacks || [])
const selectedFeedback = ref(null)
const selectedInquiryItem = computed(() => {
  if (!selectedFeedback.value) return null
  return inquiryItems.value.find((item) => item.id === selectedFeedback.value.inquiryItemId) || null
})

function openFeedbackModal(item) {
  selectedFeedback.value = item
}

function closeFeedbackModal() {
  selectedFeedback.value = null
}

async function loadDashboard() {
  try {
    dashboardError.value = ''
    const [dashboardData, inquiryData] = await Promise.all([
      getPerformanceDashboard(),
      getPerformanceInquiryItems(),
    ])
    if (dashboardData) dashboard.value = dashboardData
    inquiryItems.value = Array.isArray(inquiryData) ? inquiryData : []
  } catch (error) {
    console.error('Failed to load performance dashboard.', error)
    dashboardError.value = '대시보드를 불러오지 못했습니다.'
  }
}

onMounted(loadDashboard)
</script>

<style scoped>
/* ── Layout: 화면 전체 채우기 ── */
.perf-dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  height: 100%;
  overflow-y: auto;
}

/* ── Metric Cards Row ── */
.perf-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.perf-metrics--manager {
  grid-template-columns: repeat(4, 1fr);
}

.metric-card {
  background: #fff;
  border-radius: var(--radius);
  border: 1px solid var(--gray200);
  box-shadow: var(--shadow);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.metric-deco {
  position: absolute;
  right: -28px;
  top: -28px;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  opacity: 0.15;
}
.metric-deco.blue { background: #3b82f6; }
.metric-deco.green { background: #22c55e; }
.metric-deco.purple { background: #a855f7; }
.metric-deco.orange { background: #f59e0b; }

.metric-body { position: relative; }

.metric-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--gray500);
  margin-bottom: 12px;
}

.metric-value-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.metric-num {
  font-family: var(--font-num);
  font-size: 2rem;
  font-weight: 800;
  color: var(--gray800);
  line-height: 1;
}

.metric-change {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 2px;
}
.metric-change.blue { color: #3b82f6; }
.metric-change.green { color: #22c55e; }
.metric-change.purple { color: #a855f7; }
.metric-change.orange { color: #d97706; }

.metric-bar {
  width: 100%;
  height: 6px;
  background: var(--gray100);
  border-radius: 3px;
  margin-top: 18px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}
.metric-fill.blue { background: #3b82f6; }
.metric-fill.green { background: #22c55e; }
.metric-fill.purple { background: #a855f7; }
.metric-fill.orange { background: #f59e0b; }

.metric-card--pending {
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.metric-card--pending:hover {
  transform: translateY(-2px);
  border-color: #fcd34d;
  box-shadow: 0 12px 24px rgba(245, 158, 11, 0.15);
}

@media (max-width: 1280px) {
  .perf-metrics,
  .perf-metrics--manager {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .perf-metrics,
  .perf-metrics--manager {
    grid-template-columns: 1fr;
  }
}

/* ── Chart Card: 남은 공간 채우기 ── */
.perf-chart-card {
  background: #fff;
  border-radius: var(--radius);
  border: 1px solid var(--gray200);
  box-shadow: var(--shadow);
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--gray800);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-shrink: 0;
}
.section-title svg { color: var(--gray400); }

.chart-wrap {
  width: 100%;
  height: 280px;
  min-height: 280px;
  flex: 0 0 auto;
}

/* ── Feedback Card ── */
.perf-feedback-card {
  background: #fff;
  border-radius: var(--radius);
  border: 1px solid var(--gray200);
  box-shadow: var(--shadow);
  padding: 24px;
  min-height: 260px;
  display: flex;
  flex-direction: column;
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  overflow-y: auto;
}

.feedback-item {
  text-align: left;
  cursor: pointer;
  padding: 16px;
  background: var(--gray50);
  border-radius: var(--radius-sm);
  border: 1px solid var(--gray100);
  transition: all var(--transition);
}
.feedback-item:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.feedback-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.feedback-author {
  font-size: 0.75rem;
  font-weight: 700;
  color: #3b82f6;
  background: #dbeafe;
  padding: 3px 10px;
  border-radius: 10px;
}

.feedback-date {
  font-size: 0.75rem;
  color: var(--gray400);
}

.feedback-text {
  font-size: 0.88rem;
  color: var(--gray700);
  line-height: 1.6;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  width: min(560px, 100%);
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: 14px;
  box-shadow: 0 18px 48px rgba(2, 6, 23, 0.22);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--gray100);
}

.modal-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--gray800);
}

.modal-close {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--gray50);
  color: var(--gray500);
  font-size: 20px;
  line-height: 1;
}

.modal-close:hover {
  background: var(--gray100);
  color: var(--gray700);
}

.modal-body {
  padding: 16px;
}

.modal-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--gray500);
  margin-bottom: 12px;
}

.modal-section + .modal-section {
  margin-top: 10px;
}

.modal-label {
  display: block;
  font-size: 0.74rem;
  color: var(--gray500);
  margin-bottom: 4px;
}

.modal-value {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid var(--gray100);
  background: var(--gray50);
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--gray700);
  line-height: 1.5;
}

.modal-enter-active { transition: opacity 0.2s ease; }
.modal-leave-active { transition: opacity 0.15s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
