<template>
  <div class="doc-compare">
    <section class="card head">
      <div>
        <h1>문서 비교 (이전 vs 현재)</h1>
        <p>{{ docTitle }}</p>
      </div>
      <button type="button" class="ghost" @click="goBack">원문으로</button>
    </section>

    <section class="card compare-body">
      <div class="column">
        <h2>이전 버전</h2>
        <div class="text-box">
          <p
            v-for="(line, idx) in beforeLines"
            :key="`before-${idx}`"
            :class="{ changed: changedLineIndexes.has(idx) }"
          >{{ line }}</p>
        </div>
      </div>
      <div class="column">
        <h2>현재 버전</h2>
        <div class="text-box">
          <p
            v-for="(line, idx) in afterLines"
            :key="`after-${idx}`"
            :class="{ changed: changedLineIndexes.has(idx) }"
          >{{ line }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getManualVersionHistory } from '@/mocks/kms'
import { getArchiveVersionHistory } from '@/mocks/kms'
import { useKmsManualStore } from '@/store/kmsManuals'
import { useKmsArchiveStore } from '@/store/kmsArchive'

const route = useRoute()
const router = useRouter()
const manualStore = useKmsManualStore()
const archiveStore = useKmsArchiveStore()

const type = computed(() => String(route.params.type || 'manual'))
const docId = computed(() => route.params.docId)

const manualDoc = computed(() => manualStore.getManualById(docId.value))
const archiveDoc = computed(() => archiveStore.getDocById(docId.value))

const currentBody = computed(() => {
  if (type.value === 'archive') return archiveDoc.value?.body || ''
  return manualDoc.value?.body || ''
})

const previousBody = computed(() => {
  if (type.value === 'archive') {
    const rows = getArchiveVersionHistory(docId.value)
    return rows[1]?.body || rows[0]?.body || ''
  }
  const rows = getManualVersionHistory(docId.value)
  return rows[1]?.body || rows[0]?.body || ''
})

const toText = (value = '') => value
  .replace(/<[^>]+>/g, '\n')
  .replace(/&nbsp;/g, ' ')
  .replace(/\n{2,}/g, '\n')
  .trim()

const beforeLines = computed(() => {
  const text = toText(previousBody.value)
  return text ? text.split('\n') : ['(이전 버전 내용 없음)']
})
const afterLines = computed(() => {
  const text = toText(currentBody.value)
  return text ? text.split('\n') : ['(현재 버전 내용 없음)']
})

const changedLineIndexes = computed(() => {
  const max = Math.max(beforeLines.value.length, afterLines.value.length)
  const set = new Set()
  for (let i = 0; i < max; i += 1) {
    if ((beforeLines.value[i] || '') !== (afterLines.value[i] || '')) set.add(i)
  }
  return set
})

const docTitle = computed(() => {
  if (type.value === 'archive') return archiveDoc.value?.title || '아카이브 문서'
  return manualDoc.value?.title || '업무 메뉴얼'
})

const goBack = () => {
  if (type.value === 'archive') {
    router.push(`/kms/archive/${docId.value}`)
    return
  }
  router.push(`/kms/manuals/detail/${docId.value}`)
}
</script>

<style scoped>
.doc-compare { display: flex; flex-direction: column; gap: 16px; }
.head { border: 1px solid var(--gray200); padding: 18px; display: flex; justify-content: space-between; gap: 10px; }
.head h1 { font-size: 1.14rem; color: var(--gray800); }
.head p { margin-top: 6px; color: var(--gray500); font-size: 0.84rem; }
.ghost { border: 1px solid var(--gray300); background: #fff; color: var(--gray600); border-radius: 9px; padding: 8px 12px; }
.compare-body { border: 1px solid var(--gray200); padding: 14px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.column h2 { font-size: 0.9rem; color: var(--gray800); margin-bottom: 8px; }
.text-box { border: 1px solid var(--gray100); border-radius: 10px; background: #fff; min-height: 360px; padding: 10px; }
.text-box p { margin: 0 0 6px; color: var(--gray700); font-size: 0.82rem; line-height: 1.6; padding: 3px 4px; border-radius: 6px; }
.text-box p.changed { background: #fffbeb; border: 1px solid #fde68a; }
@media (max-width: 960px) {
  .compare-body { grid-template-columns: 1fr; }
}
</style>
