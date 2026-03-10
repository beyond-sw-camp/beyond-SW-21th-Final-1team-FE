<template>
  <div class="card fade-up delay-3 annual-card">
    <div class="annual-content">
      <div class="annual-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <h3>연차 현황</h3>
        <button class="more-btn" @click="$router.push('/attendance/vacation')">더보기</button>
      </div>
      <div v-for="(row, i) in rows" :key="row.label" class="annual-row" :class="{ first: i === 0 }">
        <span class="annual-label">{{ row.label }}</span>
        <span class="annual-val font-num" :class="{ highlight: row.highlight }">{{ row.value }}</span>
      </div>
      <div class="annual-exp">연차 사용 기한: 2026.12.31</div>
    </div>
  </div>
</template>

<script setup>
const rows = [
  { label: '총 연차', value: '15.0', highlight: true },
  { label: '사용 연차', value: '3.5', highlight: false },
  { label: '잔여 연차', value: '11.5', highlight: true },
]
</script>

<style scoped>
.annual-content{padding:16px}
.annual-header{display:flex;align-items:center;gap:7px;margin-bottom:12px;color:var(--gray500)}
.annual-header h3{font-size:0.9rem;font-weight:700;flex:1;color:var(--gray800)}
.more-btn{
  font-size:0.72rem;padding:3px 9px;border-radius:var(--radius-xs);
  border:1px solid var(--gray200);background:#fff;color:var(--gray500);
  transition:all var(--transition);
}
.more-btn:hover{border-color:var(--primary);color:var(--primary)}
.annual-row{
  display:flex;align-items:center;justify-content:space-between;
  padding:10px 12px;border-radius:var(--radius-sm);margin-bottom:5px;
}
.annual-row.first{background:var(--accent)}
.annual-row:not(.first){background:var(--gray50)}
.annual-label{font-size:0.85rem;font-weight:500;color:var(--gray600)}
.annual-val{font-size:1.1rem;font-weight:700}
.annual-val.highlight{color:var(--primary)}
.annual-exp{font-size:0.72rem;color:var(--gray400);text-align:center;margin-top:8px}
</style>
