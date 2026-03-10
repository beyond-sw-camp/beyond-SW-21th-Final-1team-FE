<template>
  <div v-if="archive" class="archive-history">
    <section class="card head">
      <div>
        <h1>회의록 변경 이력</h1>
        <p>{{ archive.title }} · {{ archive.owner }} · 현재 {{ archive.version || 'V1.0' }}</p>
      </div>
      <button type="button" class="ghost" @click="goDetail">상세로</button>
    </section>

    <KmsAccessDenied
      v-if="!hasReadPermission"
      title="열람 권한이 없습니다"
      description="해당 회의록에 대한 읽기 권한이 없어 히스토리를 볼 수 없습니다."
    />

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
              <small>{{ item.notes }}</small>
            </button>
          </li>
        </ul>
        <KmsEmptyState v-else title="히스토리 데이터가 없습니다." />
      </article>

      <article class="card version-detail">
        <header>
          <h2>{{ activeHistory?.version || archive.version || 'V1.0' }} 내용</h2>
          <p>{{ activeMeta }}</p>
        </header>
        <KmsRichEditor :model-value="activeBodyHtml" readonly />
        <p v-if="activeHistory?.notes" class="notes">변경사항: {{ activeHistory.notes }}</p>
      </article>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import KmsRichEditor from '@/components/kms/KmsRichEditor.vue'
import KmsEmptyState from '@/components/kms/KmsEmptyState.vue'
import KmsAccessDenied from '@/components/kms/KmsAccessDenied.vue'
import { AUTH_KEYS } from '@/utils/auth'
import { getArchiveVersionHistory } from '@/mocks/kms'
import { canReadArchiveDoc, resolveCurrentUserOrgContext, useKmsArchiveStore } from '@/store/kmsArchive'

const route = useRoute()
const router = useRouter()
const archiveStore = useKmsArchiveStore()

const currentUserId = computed(() => sessionStorage.getItem(AUTH_KEYS.userId) || '')
const userContext = computed(() => resolveCurrentUserOrgContext(currentUserId.value))

const includeDeleted = computed(() => route.query.fromTrash === '1')
const archive = computed(() => archiveStore.getDocById(route.params.archiveId, { includeDeleted: includeDeleted.value }))
const hasReadPermission = computed(() => archive.value && canReadArchiveDoc(archive.value, userContext.value))
const historyRows = computed(() => getArchiveVersionHistory(route.params.archiveId))
const selectedVersion = ref(historyRows.value[0]?.version || '')

watch(historyRows, (rows) => {
  if (!rows.length) {
    selectedVersion.value = ''
    return
  }
  if (!rows.some((item) => item.version === selectedVersion.value)) {
    selectedVersion.value = rows[0].version
  }
}, { immediate: true })

const activeHistory = computed(() => (
  historyRows.value.find((item) => item.version === selectedVersion.value) || historyRows.value[0] || null
))

const escapeHtml = (value = '') => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')

const activeBodyHtml = computed(() => {
  const body = activeHistory.value?.body || archive.value?.body || ''
  if (!body) return '<p><br /></p>'
  if (/<\/?[a-z][\s\S]*>/i.test(body)) return body
  return `<p>${escapeHtml(body).replace(/\n/g, '<br />')}</p>`
})

const activeMeta = computed(() => {
  if (!activeHistory.value) return '최신 본문'
  return `${activeHistory.value.updatedAt} · ${activeHistory.value.editor}`
})

const goDetail = () => {
  const suffix = includeDeleted.value ? '?fromTrash=1' : ''
  router.push(`/kms/archive/${archive.value.id}${suffix}`)
}
</script>

<style scoped>
.archive-history { display: flex; flex-direction: column; gap: 16px; }
.head { border: 1px solid var(--gray200); padding: 18px; display: flex; justify-content: space-between; gap: 10px; }
.head h1 { font-size: 1.16rem; color: var(--gray800); }
.head p { margin-top: 6px; color: var(--gray500); font-size: 0.84rem; }
.ghost { border: 1px solid var(--gray300); background: #fff; color: var(--gray600); border-radius: 9px; padding: 8px 12px; }
.content-grid { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 12px; }
.timeline, .version-detail { border: 1px solid var(--gray200); padding: 14px; }
.timeline h2, .version-detail h2 { font-size: 0.94rem; color: var(--gray800); }
.timeline ul { margin-top: 10px; list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.version-btn { width: 100%; text-align: left; border: 1px solid var(--gray200); border-radius: 10px; background: #fff; padding: 10px; display: grid; gap: 3px; }
.version-btn strong { color: var(--gray800); font-size: 0.85rem; }
.version-btn span { color: var(--primary); font-size: 0.73rem; font-weight: 700; }
.version-btn p { margin: 0; color: var(--gray500); font-size: 0.76rem; }
.version-btn small { color: var(--gray500); font-size: 0.75rem; }
.version-btn.active { border-color: #99f6e4; background: #f0fdfa; }
.version-detail header p { margin-top: 4px; color: var(--gray500); font-size: 0.8rem; }
.notes { margin-top: 10px; color: var(--gray600); font-size: 0.82rem; }
@media (max-width: 960px) {
  .content-grid { grid-template-columns: 1fr; }
}
</style>
