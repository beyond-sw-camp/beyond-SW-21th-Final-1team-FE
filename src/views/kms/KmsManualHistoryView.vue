<template>
  <div v-if="manual" class="manual-history">
    <section class="card head">
      <div>
        <h1>업무 메뉴얼 히스토리</h1>
        <p>{{ manual.title }} · {{ categoryName }} · 현재 {{ manual.version }}</p>
      </div>
      <div class="head-actions">
        <button type="button" class="ghost" @click="goDetail">상세로</button>
      </div>
    </section>

    <section v-if="!hasReadPermission" class="card blocked">
      <h2>열람 권한이 없습니다</h2>
      <p>해당 메뉴얼의 읽기 권한이 없어 히스토리 열람이 불가합니다.</p>
    </section>

    <section v-else class="content-grid">
      <article class="card timeline">
        <h2>버전 이력</h2>
        <ul v-if="historyRows.length > 0">
          <li v-for="item in historyRows" :key="item.version">
            <button
              type="button"
              class="version-btn"
              :class="{ active: selectedVersion === item.version }"
              @click="selectedVersion = item.version"
            >
              <strong>{{ item.version }}</strong>
              <span>{{ item.type === 'major' ? '메이저' : '마이너' }}</span>
              <p>{{ item.updatedAt }} · {{ item.editor }}</p>
            </button>
          </li>
        </ul>
        <p v-else class="empty">히스토리 데이터가 없습니다.</p>
      </article>

      <article class="card version-detail">
        <header>
          <h2>{{ activeHistory?.version || manual.version }} 내용</h2>
          <p>{{ activeHistoryMeta }}</p>
        </header>
        <KmsRichEditor :model-value="activeHistoryBodyHtml" readonly />
        <p v-if="activeHistory?.notes" class="notes">변경사항: {{ activeHistory.notes }}</p>
      </article>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import KmsRichEditor from '@/components/kms/KmsRichEditor.vue'
import { AUTH_KEYS } from '@/utils/auth'
import { canReadManual, getManualVersionHistory, kmsCategories } from '@/mocks/kms'
import { useKmsManualStore } from '@/store/kmsManuals'

const route = useRoute()
const router = useRouter()
const manualStore = useKmsManualStore()

const includeDeleted = computed(() => route.query.fromTrash === '1')
const manual = computed(() => manualStore.getManualById(route.params.manualId, { includeDeleted: includeDeleted.value }))
const currentRole = computed(() => sessionStorage.getItem(AUTH_KEYS.role) || '')
const hasReadPermission = computed(() => canReadManual(manual.value, currentRole.value))
const categoryName = computed(() => kmsCategories.find((item) => item.key === manual.value?.category)?.name || '-')
const historyRows = computed(() => getManualVersionHistory(route.params.manualId))
const selectedVersion = ref(historyRows.value[0]?.version || '')

watch(historyRows, (rows) => {
  if (!rows.length) {
    selectedVersion.value = ''
    return
  }
  if (!rows.some((row) => row.version === selectedVersion.value)) {
    selectedVersion.value = rows[0].version
  }
}, { immediate: true })

const activeHistory = computed(() => (
  historyRows.value.find((row) => row.version === selectedVersion.value) || historyRows.value[0] || null
))

const hasHtmlTag = (value = '') => /<\/?[a-z][\s\S]*>/i.test(value)
const escapeHtml = (value = '') => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')

const activeHistoryBodyHtml = computed(() => {
  const body = activeHistory.value?.body || manual.value?.body || ''
  if (!body) return '<p><br /></p>'
  if (hasHtmlTag(body)) return body
  return `<p>${escapeHtml(body).replace(/\n/g, '<br />')}</p>`
})

const activeHistoryMeta = computed(() => {
  if (!activeHistory.value) return '최신 본문'
  return `${activeHistory.value.updatedAt} · ${activeHistory.value.editor} · ${activeHistory.value.type === 'major' ? '메이저' : '마이너'}`
})

const goDetail = () => {
  const suffix = includeDeleted.value ? '?fromTrash=1' : ''
  router.push(`/kms/manuals/detail/${manual.value.id}${suffix}`)
}
</script>

<style scoped>
.manual-history { display: flex; flex-direction: column; gap: 16px; }
.head { border: 1px solid var(--gray200); padding: 18px; display: flex; justify-content: space-between; gap: 10px; }
.head h1 { font-size: 1.16rem; color: var(--gray800); }
.head p { margin-top: 6px; color: var(--gray500); font-size: 0.84rem; }
.ghost { border: 1px solid var(--gray300); background: #fff; color: var(--gray600); border-radius: 9px; padding: 8px 12px; }
.blocked { border: 1px solid #fecaca; background: #fff7f7; padding: 18px; }
.blocked h2 { font-size: 0.98rem; color: #b91c1c; }
.blocked p { margin-top: 6px; color: #9f1239; font-size: 0.84rem; }
.content-grid { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 12px; }
.timeline,
.version-detail { border: 1px solid var(--gray200); padding: 14px; }
.timeline h2,
.version-detail h2 { font-size: 0.94rem; color: var(--gray800); }
.timeline ul { margin-top: 10px; list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.version-btn {
  width: 100%;
  text-align: left;
  border: 1px solid var(--gray200);
  border-radius: 10px;
  background: #fff;
  padding: 10px;
  display: grid;
  gap: 3px;
}
.version-btn strong { color: var(--gray800); font-size: 0.85rem; }
.version-btn span { color: var(--primary); font-size: 0.73rem; font-weight: 700; }
.version-btn p { margin: 0; color: var(--gray500); font-size: 0.76rem; }
.version-btn.active { border-color: #99f6e4; background: #f0fdfa; }
.version-detail header p { margin-top: 4px; color: var(--gray500); font-size: 0.8rem; }
.notes { margin-top: 10px; color: var(--gray600); font-size: 0.82rem; }
.empty { margin-top: 10px; color: var(--gray500); font-size: 0.82rem; }
@media (max-width: 960px) {
  .content-grid { grid-template-columns: 1fr; }
}
</style>
