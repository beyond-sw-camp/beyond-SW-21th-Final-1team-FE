<template>
  <div class="stats-wrap">
    <div class="stats-header">
      <div>
        <h2 class="stats-title">부서 성과 통계</h2>
        <p class="stats-desc">팀원별 역량 분포와 주요 성과를 한눈에 파악할 수 있습니다.</p>
      </div>
      <div class="stats-header-right">
        <select v-model="selectedTeam" class="stats-select">
          <option value="">전체 팀</option>
          <option v-for="team in teamOptions" :key="team" :value="team">{{ team }}</option>
        </select>
        <select class="stats-select">
          <option v-for="option in periodOptions" :key="option">{{ option }}</option>
        </select>
      </div>
    </div>

    <div class="stats-body">
      <div class="c-list">
        <div v-for="member in filteredMembers" :key="member.id" class="c-card">
          <div class="c-profile">
            <div class="c-avatar-wrap">
              <img :src="member.image" :alt="member.name" class="c-avatar" />
              <div class="c-score-badge">{{ member.avgScore }}</div>
            </div>
            <div class="c-info">
              <h3 class="c-name">{{ member.name }}</h3>
              <p class="c-role">{{ member.role }} · {{ member.department }}</p>
            </div>
          </div>

          <div class="c-chart">
            <Radar :data="getChartData(member)" :options="radarOptionsC" />
          </div>

          <div class="c-system-score">
            <span class="c-system-label">시스템 평가 점수</span>
            <strong class="c-system-value">{{ member.systemScore }}점</strong>
          </div>

          <div class="c-scores">
            <div v-for="item in member.chartData" :key="item.subject" class="c-score-row">
              <span class="c-score-label">{{ item.subject }}</span>
              <div class="c-score-bar-bg">
              <div class="c-score-bar-fill" :style="{ width: (item.value / 5) * 100 + '%' }" />
              </div>
              <span class="c-score-num">{{ item.value }}</span>
            </div>
          </div>

          <div class="c-tasks">
            <div
              v-for="task in member.tasks"
              :key="task.id"
              class="c-task-chip"
              :class="task.status === 'completed' ? 'chip-done' : 'chip-prog'"
            >
              {{ task.title }}
            </div>
          </div>
        </div>
        <div v-if="filteredMembers.length === 0" class="c-empty">선택한 팀의 성과 데이터가 없습니다.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { Radar } from 'vue-chartjs'
import { getPerformanceTeamStats } from '@/api/performance'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip)

const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'><rect width='80' height='80' rx='40' fill='%23eef2f7'/><circle cx='40' cy='31' r='14' fill='%2394a3b8'/><path d='M16 68c4-12 14-18 24-18s20 6 24 18' fill='%2394a3b8'/></svg>"

const selectedTeam = ref('')
const statsData = ref({
  teamOptions: [],
  members: [],
})
const currentYear = new Date().getFullYear()
const periodOptions = [
  `${currentYear}년 2분기`,
  `${currentYear}년 1분기`,
  `${currentYear - 1}년 4분기`,
]
const teamOptions = computed(() => statsData.value.teamOptions || [])

const filteredMembers = computed(() => {
  return (statsData.value.members || []).map((member) => ({
    ...member,
    image: DEFAULT_AVATAR,
  }))
})

const getChartData = (member) => ({
  labels: member.chartData.map((d) => d.subject),
  datasets: [{
    label: member.name,
    data: member.chartData.map((d) => d.value),
    backgroundColor: 'rgba(8, 145, 178, 0.08)',
    borderColor: '#06B6D4',
    borderWidth: 2,
    pointBackgroundColor: '#06B6D4',
    pointRadius: 3,
  }],
})

const radarOptionsC = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      titleFont: { size: 12, family: 'Noto Sans KR' },
      bodyFont: { size: 11, family: 'Noto Sans KR' },
      padding: 10,
      cornerRadius: 8,
    },
  },
  scales: {
    r: {
      beginAtZero: true,
      max: 5,
      ticks: { display: false, stepSize: 1 },
      grid: { color: 'rgba(8,145,178,0.08)' },
      angleLines: { color: 'rgba(8,145,178,0.08)' },
      pointLabels: { font: { size: 10, family: 'Noto Sans KR' }, color: '#64748b' },
    },
  },
}

async function loadTeamStats() {
  try {
    const response = await getPerformanceTeamStats(selectedTeam.value ? { team: selectedTeam.value } : {})
    if (response) {
      statsData.value = response
      return
    }
  } catch (_error) {}
}

onMounted(loadTeamStats)
watch(selectedTeam, loadTeamStats)
</script>

<style scoped>
.stats-wrap { display: flex; flex-direction: column; height: 100%; min-height: 0; }
.stats-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-shrink: 0; }
.stats-header-right { display: flex; align-items: center; gap: 12px; }
.stats-title { font-size: 1.15rem; font-weight: 800; color: var(--gray800); }
.stats-desc { font-size: 0.8rem; color: var(--gray400); margin-top: 4px; }
.stats-select { padding: 8px 14px; font-size: 0.82rem; font-family: var(--font); color: var(--gray600); background: #fff; border: 1px solid var(--gray200); border-radius: var(--radius-xs); outline: none; }
.stats-body { flex: 1; overflow-y: auto; padding-bottom: 16px; }

.c-list { display: flex; flex-direction: column; gap: 16px; }
.c-card { display: grid; grid-template-columns: 200px 160px 140px 1fr auto; align-items: center; gap: 24px; padding: 24px 28px; background: rgba(255,255,255,0.72); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.6); border-radius: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.02), 0 4px 20px rgba(0,0,0,0.03); transition: all 0.25s; }
.c-card:hover { background: rgba(255,255,255,0.88); box-shadow: 0 4px 24px rgba(8,145,178,0.08); border-color: var(--accent2); }
.c-profile { display: flex; align-items: center; gap: 14px; }
.c-avatar-wrap { position: relative; flex-shrink: 0; }
.c-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.8); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.c-score-badge { position: absolute; bottom: -4px; right: -4px; width: 22px; height: 22px; border-radius: 50%; background: var(--primary); color: #fff; font-size: 0.58rem; font-weight: 800; font-family: var(--font-num); display: flex; align-items: center; justify-content: center; border: 2px solid #fff; }
.c-info { min-width: 0; }
.c-name { font-size: 0.92rem; font-weight: 700; color: var(--gray800); }
.c-role { font-size: 0.7rem; color: var(--gray400); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.c-chart { width: 160px; height: 130px; flex-shrink: 0; }
.c-system-score {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding: 14px 12px;
  border-radius: 10px;
  border: 1px solid var(--gray200);
  background: #f8fafc;
  text-align: center;
}
.c-system-label { font-size: 0.68rem; color: var(--gray500); }
.c-system-value { font-size: 1.05rem; color: var(--primary-dark); font-family: var(--font-num); line-height: 1; }
.c-scores { display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 0; }
.c-score-row { display: flex; align-items: center; gap: 10px; }
.c-score-label { font-size: 0.7rem; color: var(--gray500); width: 56px; flex-shrink: 0; text-align: right; }
.c-score-bar-bg { flex: 1; height: 6px; background: var(--gray100); border-radius: 3px; overflow: hidden; }
.c-score-bar-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--secondary), var(--primary)); transition: width 0.6s; }
.c-score-num { font-size: 0.72rem; font-weight: 700; font-family: var(--font-num); color: var(--primary); width: 28px; text-align: right; }
.c-tasks { display: flex; flex-direction: column; gap: 6px; width: 200px; flex-shrink: 0; }
.c-task-chip { padding: 5px 12px; border-radius: 8px; font-size: 0.7rem; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chip-done { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
.chip-prog { background: var(--accent); color: var(--primary-dark); border: 1px solid var(--accent2); }
.c-empty { padding: 24px; text-align: center; color: var(--gray500); background: #fff; border: 1px dashed var(--gray200); border-radius: 12px; }

@media (max-width: 1200px) {
  .c-card { grid-template-columns: 1fr 1fr; }
  .c-tasks { width: auto; }
}

@media (max-width: 768px) {
  .c-card { grid-template-columns: 1fr; }
  .c-chart { width: 100%; }
  .c-tasks { width: auto; }
}
</style>
