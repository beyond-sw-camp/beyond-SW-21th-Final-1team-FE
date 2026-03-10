<template>
  <div class="kms-home">
    <section class="hero card">
      <div>
        <p class="eyebrow">KMS</p>
        <h1>지식관리 시스템</h1>
        <p class="desc">검색 시스템, 업무 메뉴얼, 팀/조직 회의록 아카이브를 한 곳에서 관리합니다.</p>
      </div>
      <div class="hero-actions">
        <button class="btn primary" @click="router.push('/kms/manuals')">업무 메뉴얼 보기</button>
        <button class="btn" @click="router.push('/kms/archive')">아카이브 보기</button>
      </div>
    </section>

    <section class="grid">
      <article class="card panel">
        <header>
          <h2>최근 업무 메뉴얼 10개</h2>
        </header>
        <ul>
          <li v-for="item in latestManuals" :key="item.id">
            <button type="button" @click="router.push(`/kms/manuals/detail/${item.id}`)">
              <strong>{{ item.title }}</strong>
              <span>{{ item.author }} · {{ item.createdAt }}</span>
            </button>
          </li>
        </ul>
      </article>

      <article class="card panel">
        <header>
          <h2>내 팀 회의록 10개</h2>
        </header>
        <ul>
          <li v-for="item in latestArchives" :key="item.id">
            <button type="button" @click="router.push(`/kms/archive/${item.id}`)">
              <strong>{{ item.title }}</strong>
              <span>{{ item.team }} · {{ item.createdAt }}</span>
            </button>
          </li>
        </ul>
      </article>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useKmsArchiveStore } from '@/store/kmsArchive'
import { useKmsManualStore } from '@/store/kmsManuals'

const router = useRouter()
const archiveStore = useKmsArchiveStore()
const manualStore = useKmsManualStore()
const latestManuals = computed(() => manualStore.activeManuals.slice(0, 10))
const latestArchives = computed(() => archiveStore.docs.value.slice(0, 10))
</script>

<style scoped>
.kms-home { display: flex; flex-direction: column; gap: 16px; }
.hero { padding: 24px; display: flex; justify-content: space-between; gap: 16px; border: 1px solid var(--gray200); }
.eyebrow { color: var(--primary); font-size: 0.78rem; font-weight: 700; letter-spacing: 0.06em; }
h1 { font-size: 1.45rem; margin-top: 6px; color: var(--gray800); }
.desc { margin-top: 8px; color: var(--gray500); }
.hero-actions { display: flex; gap: 10px; align-items: center; }
.btn { border: 1px solid var(--gray300); background: #fff; color: var(--gray700); padding: 10px 14px; border-radius: 10px; font-weight: 600; }
.btn.primary { border-color: var(--primary); background: var(--primary); color: #fff; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.panel { padding: 16px; border: 1px solid var(--gray200); }
h2 { font-size: 0.95rem; color: var(--gray800); }
ul {
  margin-top: 10px;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
li { list-style: none; }
li button { width: 100%; text-align: left; border: 1px solid var(--gray100); background: var(--gray50); padding: 10px; border-radius: 10px; }
li button strong { display: block; color: var(--gray800); font-size: 0.88rem; margin-bottom: 2px; }
li button span { color: var(--gray500); font-size: 0.76rem; }
li button:hover { border-color: var(--secondary); background: #f0fdff; }
@media (max-width: 1024px) {
  .hero { flex-direction: column; }
  .grid { grid-template-columns: 1fr; }
}
</style>
