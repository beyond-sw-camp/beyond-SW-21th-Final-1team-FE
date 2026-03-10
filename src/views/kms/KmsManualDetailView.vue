<template>
  <div v-if="manual" class="manual-detail">
    <section class="card head">
      <div>
        <h1>{{ manual.title }}</h1>
        <p>{{ categoryName }} · {{ manual.author }} · {{ manual.updatedAt }} · {{ manual.version }}</p>
        <p v-if="manual.isDeleted" class="trash-note">임시 보관함 문서입니다. 읽기 전용으로 확인 가능합니다.</p>
      </div>
      <div class="actions">
        <div class="search-box">
          <input v-model="searchTerm" type="text" placeholder="본문 키워드 검색" />
        </div>
        <button class="btn" @click="goHistory">히스토리</button>
        <button class="btn" @click="router.push(`/kms/compare/manual/${manual.id}`)">문서 비교</button>
        <button v-if="!manual.isDeleted" class="btn" @click="router.push(`/kms/manuals/edit/${manual.id}`)">수정</button>
        <button v-if="isMine && !manual.isDeleted" class="btn danger" @click="onDelete">삭제</button>
        <button v-if="isMine && manual.isDeleted" class="btn restore" @click="onRestore">복원</button>
        <button v-if="isMine && manual.isDeleted" class="btn danger" @click="onDeletePermanently">영구삭제</button>
      </div>
    </section>

    <section class="card body" :class="{ hit: hasHit }">
      <KmsRichEditor :model-value="manualBodyHtml" readonly />
      <p class="summary">{{ manual.summary }}</p>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import KmsRichEditor from '@/components/kms/KmsRichEditor.vue'
import { AUTH_KEYS } from '@/utils/auth'
import { kmsCategories } from '@/mocks/kms'
import { useKmsManualStore } from '@/store/kmsManuals'

const route = useRoute()
const router = useRouter()
const searchTerm = ref('')
const manualStore = useKmsManualStore()
const currentUserName = computed(() => sessionStorage.getItem(AUTH_KEYS.userName) || '')

const includeDeleted = computed(() => route.query.fromTrash === '1')
const manual = computed(() => manualStore.getManualById(route.params.manualId, { includeDeleted: includeDeleted.value }))
const categoryName = computed(() => kmsCategories.find((item) => item.key === manual.value?.category)?.name || '-')
const isMine = computed(() => manual.value?.author === currentUserName.value)

const hasHtmlTag = (value = '') => /<\/?[a-z][\s\S]*>/i.test(value)
const escapeHtml = (value = '') => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')

const manualBodyHtml = computed(() => {
  const body = manual.value?.body || ''
  if (hasHtmlTag(body)) return body
  const escaped = escapeHtml(body).replace(/\n/g, '<br />')
  return `<p>${escaped}</p>`
})

const manualBodyText = computed(() => {
  const body = manual.value?.body || ''
  return body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
})

const hasHit = computed(() => {
  const keyword = searchTerm.value.trim()
  return Boolean(keyword && manualBodyText.value.includes(keyword))
})

const goHistory = () => {
  const suffix = manual.value?.isDeleted ? '?fromTrash=1' : ''
  router.push(`/kms/manuals/history/${manual.value.id}${suffix}`)
}

const onDelete = () => {
  if (!manual.value || !isMine.value) {
    alert('본인이 작성한 메뉴얼만 삭제할 수 있습니다.')
    return
  }
  if (!window.confirm('해당 메뉴얼을 임시 보관함으로 이동하시겠습니까?')) return
  const moved = manualStore.moveToTrash(manual.value.id, currentUserName.value)
  if (!moved) {
    alert('삭제 권한이 없거나 대상 문서를 찾을 수 없습니다.')
    return
  }
  alert('메뉴얼이 임시 보관함으로 이동되었습니다.')
  router.push('/kms/manuals/my')
}

const onRestore = () => {
  if (!manual.value || !isMine.value) return
  const restored = manualStore.restoreManual(manual.value.id, currentUserName.value)
  if (!restored) {
    alert('복원 권한이 없습니다.')
    return
  }
  alert('메뉴얼이 복원되었습니다.')
  router.push(`/kms/manuals/detail/${manual.value.id}`)
}

const onDeletePermanently = () => {
  if (!manual.value || !isMine.value) return
  if (!window.confirm('이 문서를 영구삭제하시겠습니까?')) return
  const removed = manualStore.deleteManualPermanently(manual.value.id, currentUserName.value)
  if (!removed) {
    alert('영구삭제 권한이 없습니다.')
    return
  }
  alert('메뉴얼이 영구삭제되었습니다.')
  router.push('/kms/manuals/trash')
}
</script>

<style scoped>
.manual-detail { display: flex; flex-direction: column; gap: 16px; }
.head {
  border: 1px solid var(--gray200);
  padding: 18px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}
.head h1 { color: var(--gray800); font-size: 1.2rem; }
.head p { margin-top: 6px; color: var(--gray500); font-size: 0.84rem; }
.trash-note { color: #92400e; font-size: 0.78rem; margin-top: 4px; }
.actions { display: flex; gap: 8px; align-items: center; }
.search-box input { border: 1px solid var(--gray300); border-radius: 10px; padding: 8px 10px; min-width: 220px; }
.btn { border: 1px solid var(--gray300); border-radius: 10px; padding: 8px 12px; background: #fff; }
.btn.restore { border-color: #99f6e4; background: #f0fdfa; color: #0f766e; }
.btn.danger { border-color: #fecaca; color: #b91c1c; background: #fff; }
.body { border: 1px solid var(--gray200); padding: 18px; }
.body.hit { border-color: #fcd34d; background: #fffbeb; }
.summary { margin-top: 12px; font-size: 0.82rem; color: var(--gray500); }
@media (max-width: 900px) {
  .head { flex-direction: column; }
  .search-box input { min-width: 0; width: 100%; }
}
</style>
