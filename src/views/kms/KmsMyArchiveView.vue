<template>
  <div class="my-archive">
    <section class="card head">
      <div>
        <h1>내가 작성한 회의록</h1>
        <p>로그인한 사용자가 작성한 아카이브 문서만 표시됩니다.</p>
      </div>
      <button type="button" class="primary" @click="router.push('/kms/archive/manage/new')">문서 등록</button>
    </section>

    <section class="card list">
      <header>
        <h2>내 문서 {{ rows.length }}건</h2>
      </header>

      <div v-if="rows.length === 0" class="empty">작성한 회의록이 없습니다.</div>

      <div v-else class="card-grid">
        <article v-for="doc in rows" :key="doc.id" class="doc-card">
          <button type="button" class="title" @click="router.push(`/kms/archive/${doc.id}`)">{{ doc.title }}</button>
          <p class="meta">{{ doc.owner }} · {{ doc.category }} · {{ doc.createdAt }}</p>
          <p class="excerpt">{{ doc.summary }}</p>
              <div class="card-foot">
                <span>{{ doc.org }} / {{ doc.team }}</span>
                <div class="actions">
                  <button type="button" class="edit-btn" @click="router.push(`/kms/archive/manage/${doc.id}`)">수정</button>
                  <button type="button" class="delete-btn" @click="moveToTrash(doc)">삭제</button>
                </div>
              </div>
            </article>
          </div>
        </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { AUTH_KEYS } from '@/utils/auth'
import { useKmsArchiveStore } from '@/store/kmsArchive'

const router = useRouter()
const archiveStore = useKmsArchiveStore()

const currentUserId = computed(() => sessionStorage.getItem(AUTH_KEYS.userId) || '')
const currentUserName = computed(() => sessionStorage.getItem(AUTH_KEYS.userName) || '')

const rows = computed(() => (
  archiveStore.myDocs(currentUserId.value, currentUserName.value)
))

const moveToTrash = (doc) => {
  if (!window.confirm(`\"${doc.title}\" 문서를 임시 보관함으로 이동하시겠습니까?`)) return
  const moved = archiveStore.moveToTrash(doc.id, currentUserId.value, currentUserName.value)
  if (!moved) {
    alert('삭제 권한이 없습니다.')
    return
  }
  alert('문서가 임시 보관함으로 이동되었습니다.')
}
</script>

<style scoped>
.my-archive { display: flex; flex-direction: column; gap: 16px; }
.head { border: 1px solid var(--gray200); padding: 18px; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.head h1 { font-size: 1.14rem; color: var(--gray800); }
.head p { margin-top: 6px; color: var(--gray500); font-size: 0.84rem; }
.primary { border: 1px solid var(--primary); background: var(--primary); color: #fff; border-radius: 10px; padding: 10px 14px; font-weight: 700; }
.list { border: 1px solid var(--gray200); padding: 14px; }
.list h2 { font-size: 0.92rem; color: var(--gray800); }
.card-grid { margin-top: 10px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.doc-card { border: 1px solid var(--gray100); border-radius: 10px; padding: 12px; background: #fff; display: flex; flex-direction: column; gap: 6px; }
.title { border: none; background: transparent; text-align: left; color: var(--gray800); font-weight: 700; font-size: 0.9rem; padding: 0; }
.title:hover { color: var(--primary-dark); }
.meta { margin: 0; font-size: 0.76rem; color: var(--gray500); }
.excerpt { margin: 0; color: var(--gray600); font-size: 0.82rem; line-height: 1.6; min-height: 38px; }
.card-foot { margin-top: auto; display: flex; justify-content: space-between; align-items: center; }
.card-foot span { color: var(--gray400); font-size: 0.74rem; }
.actions { display: flex; gap: 6px; }
.edit-btn { border: 1px solid var(--gray300); background: #fff; color: var(--gray600); border-radius: 8px; padding: 5px 10px; font-size: 0.74rem; font-weight: 700; }
.delete-btn { border: 1px solid #fecaca; background: #fff; color: #b91c1c; border-radius: 8px; padding: 5px 10px; font-size: 0.74rem; font-weight: 700; }
.empty { margin-top: 10px; border: 1px dashed var(--gray300); border-radius: 10px; background: var(--gray50); color: var(--gray500); font-size: 0.84rem; text-align: center; padding: 34px 12px; }
@media (max-width: 1100px) {
  .head { flex-direction: column; align-items: flex-start; }
  .card-grid { grid-template-columns: 1fr; }
}
</style>
