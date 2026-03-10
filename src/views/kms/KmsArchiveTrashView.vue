<template>
  <div class="archive-trash">
    <section class="card head">
      <h1>회의록 아카이브 임시 보관함</h1>
      <p>본인이 삭제한 회의록/지식문서를 복원하거나 영구삭제할 수 있습니다.</p>
    </section>

    <section class="card list">
      <header>
        <h2>보관중 {{ rows.length }}건</h2>
      </header>
      <KmsEmptyState
        v-if="rows.length === 0"
        title="임시 보관함이 비어 있습니다."
        description="삭제한 회의록 문서가 이곳에 표시됩니다."
      />

      <ul v-else>
        <li v-for="item in rows" :key="item.id">
          <div>
            <button type="button" class="title-btn" @click="openDetail(item)">{{ item.title }}</button>
            <p>{{ item.deletedAt }} 삭제 · {{ item.deletedBy || '-' }} · {{ item.version }}</p>
          </div>
          <div class="actions">
            <button type="button" class="restore" @click="restore(item)">복원</button>
            <button type="button" class="danger" @click="remove(item)">영구삭제</button>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { AUTH_KEYS } from '@/utils/auth'
import KmsEmptyState from '@/components/kms/KmsEmptyState.vue'
import { useKmsArchiveStore } from '@/store/kmsArchive'

const router = useRouter()
const archiveStore = useKmsArchiveStore()
const currentUserId = computed(() => sessionStorage.getItem(AUTH_KEYS.userId) || '')
const currentUserName = computed(() => sessionStorage.getItem(AUTH_KEYS.userName) || '')
const rows = computed(() => archiveStore.myTrashDocs(currentUserId.value, currentUserName.value))

const restore = (item) => {
  const restored = archiveStore.restoreDoc(item.id, currentUserId.value, currentUserName.value)
  if (!restored) {
    alert('복원 권한이 없습니다.')
    return
  }
  alert('회의록 문서가 복원되었습니다.')
}

const remove = (item) => {
  if (!window.confirm(`"${item.title}" 문서를 영구삭제하시겠습니까?`)) return
  const removed = archiveStore.deleteDocPermanently(item.id, currentUserId.value, currentUserName.value)
  if (!removed) {
    alert('영구삭제 권한이 없습니다.')
    return
  }
  alert('문서가 영구삭제되었습니다.')
}

const openDetail = (item) => {
  router.push(`/kms/archive/${item.id}?fromTrash=1`)
}
</script>

<style scoped>
.archive-trash { display: flex; flex-direction: column; gap: 16px; }
.head,.list { border: 1px solid var(--gray200); padding: 18px; }
.head h1 { font-size: 1.14rem; color: var(--gray800); }
.head p { margin-top: 6px; color: var(--gray500); font-size: 0.84rem; }
.list h2 { font-size: 0.94rem; color: var(--gray800); }
ul { margin-top: 10px; list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
li { border: 1px solid var(--gray100); border-radius: 10px; padding: 10px; display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.title-btn { border: none; background: transparent; color: var(--gray800); font-size: 0.88rem; font-weight: 700; text-align: left; padding: 0; }
.title-btn:hover { color: var(--primary-dark); text-decoration: underline; }
li p { margin-top: 4px; color: var(--gray500); font-size: 0.78rem; }
.actions { display: flex; gap: 6px; }
.restore { border: 1px solid #99f6e4; background: #f0fdfa; color: #0f766e; border-radius: 8px; padding: 5px 10px; font-size: 0.74rem; font-weight: 700; }
.danger { border: 1px solid #fecaca; background: #fff; color: #b91c1c; border-radius: 8px; padding: 5px 10px; font-size: 0.74rem; font-weight: 700; }
</style>
