<template>
  <section class="admin-page">
    <header class="admin-head">
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
    </header>

    <article class="placeholder-card">
      <p>{{ title }} 화면은 현재 목업 단계입니다.</p>
      <p>백엔드/권한 정책 확정 후 상세 기능을 연결하면 됩니다.</p>
    </article>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const title = computed(() => String(route.meta.title || '관리자 메뉴'))
const description = computed(() => String(route.meta.description || '관리자 기능 화면'))
</script>

<style scoped>
.admin-page { width: 100%; max-width: none; min-width: 0; }

.admin-head {
  margin-top: 12px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 18px;
}

.admin-head h1 { margin: 0; font-size: 1.3rem; color: var(--gray800); }
.admin-head p { margin: 6px 0 0; color: var(--gray500); font-size: .88rem; }

.placeholder-card {
  margin-top: 12px;
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 18px;
  color: var(--gray600);
}

.placeholder-card p { margin: 0 0 8px; }
</style>
