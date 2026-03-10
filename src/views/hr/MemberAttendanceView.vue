<template>
  <div class="manager-page">
    <div class="breadcrumb">인사 / 팀원 근태</div>
    <section class="page-card">
      <div class="title-row">
        <h1>팀원 근태 조회</h1>
        <span class="view-badge">팀장 뷰</span>
      </div>
      <p class="desc">
        팀원 사번: <strong>{{ employeeId }}</strong>
      </p>
      <p class="desc">근태 상세 화면은 추후 근태 도메인과 연동됩니다.</p>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const employeeId = computed(() => route.params.employeeId || '-')
</script>

<style scoped>
.manager-page { width: 100%; max-width: none; min-width: 0; }
.breadcrumb { font-size: .78rem; color: var(--gray400); margin-bottom: 4px; }
.page-card {
  margin-top: 12px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px;
}
.title-row { display: flex; align-items: center; gap: 10px; }
.title-row h1 { margin: 0; color: var(--gray800); font-size: 1.4rem; }
.view-badge {
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: .74rem;
  font-weight: 700;
  color: #0F766E;
  background: #CCFBF1;
  display: inline-flex;
  align-items: center;
}
.desc { margin: 10px 0 0; color: var(--gray600); font-size: .9rem; }
</style>
