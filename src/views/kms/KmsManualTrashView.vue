<template>
  <div class="manual-trash">
    <section class="card head">
      <h1>업무 메뉴얼 임시 보관함</h1>
      <p>본인이 삭제한 메뉴얼을 복원할 수 있습니다.</p>
    </section>

    <section class="card list">
      <header>
        <h2>보관중 {{ rows.length }}건</h2>
      </header>
      <div v-if="rows.length === 0" class="empty">임시 보관함에 메뉴얼이 없습니다.</div>
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
import { useKmsManualStore } from '@/store/kmsManuals'

const router = useRouter()
const manualStore = useKmsManualStore()
const currentUserName = computed(() => sessionStorage.getItem(AUTH_KEYS.userName) || '')
const rows = computed(() => manualStore.myTrashManuals(currentUserName.value))

const restore = (item) => {
  const restored = manualStore.restoreManual(item.id, currentUserName.value)
  if (!restored) {
    alert('복원 권한이 없습니다.')
    return
  }
  alert('메뉴얼이 복원되었습니다.')
}

const remove = (item) => {
  if (!window.confirm(`\"${item.title}\" 메뉴얼을 영구삭제하시겠습니까?`)) return
  const removed = manualStore.deleteManualPermanently(item.id, currentUserName.value)
  if (!removed) {
    alert('영구삭제 권한이 없습니다.')
    return
  }
  alert('메뉴얼이 영구삭제되었습니다.')
}

const openDetail = (item) => {
  router.push(`/kms/manuals/detail/${item.id}?fromTrash=1`)
}
</script>

<style scoped>
.manual-trash { display: flex; flex-direction: column; gap: 16px; }
.head,
.list { border: 1px solid var(--gray200); padding: 18px; }
.head h1 { font-size: 1.14rem; color: var(--gray800); }
.head p { margin-top: 6px; color: var(--gray500); font-size: 0.84rem; }
.list h2 { font-size: 0.94rem; color: var(--gray800); }
.empty { margin-top: 10px; border: 1px dashed var(--gray300); border-radius: 10px; background: var(--gray50); padding: 24px 12px; text-align: center; color: var(--gray500); }
ul { margin-top: 10px; list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
li { border: 1px solid var(--gray100); border-radius: 10px; padding: 10px; display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.title-btn { border: none; background: transparent; color: var(--gray800); font-size: 0.88rem; font-weight: 700; text-align: left; padding: 0; }
.title-btn:hover { color: var(--primary-dark); text-decoration: underline; }
li p { margin-top: 4px; color: var(--gray500); font-size: 0.78rem; }
.actions { display: flex; gap: 6px; }
.restore { border: 1px solid #99f6e4; background: #f0fdfa; color: #0f766e; border-radius: 8px; padding: 5px 10px; font-size: 0.74rem; font-weight: 700; }
.danger { border: 1px solid #fecaca; background: #fff; color: #b91c1c; border-radius: 8px; padding: 5px 10px; font-size: 0.74rem; font-weight: 700; }
</style>
