<template>
  <div class="my-manuals">
    <section class="card head">
      <div>
        <h1>내가 작성한 메뉴얼</h1>
        <p>작성자 기준으로 본인이 등록한 메뉴얼만 표시됩니다.</p>
      </div>
      <button type="button" class="primary" @click="router.push('/kms/manuals/upload')">새 메뉴얼 등록</button>
    </section>

    <section class="card list">
      <header>
        <h2>전체 {{ rows.length }}건</h2>
      </header>
      <div v-if="rows.length === 0" class="empty">작성한 메뉴얼이 없습니다.</div>
      <table v-else>
        <thead>
          <tr>
            <th>제목</th>
            <th>카테고리</th>
            <th>최종 수정일</th>
            <th>버전</th>
            <th>작업</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in rows" :key="item.id">
            <td>
              <button type="button" class="title" @click="router.push(`/kms/manuals/detail/${item.id}`)">{{ item.title }}</button>
            </td>
            <td>{{ categoryName(item.category) }}</td>
            <td>{{ item.updatedAt }}</td>
            <td>{{ item.version }}</td>
            <td>
              <div class="row-actions">
                <button type="button" class="ghost" @click="router.push(`/kms/manuals/edit/${item.id}`)">수정</button>
                <button type="button" class="danger" @click="moveToTrash(item)">삭제</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { AUTH_KEYS } from '@/utils/auth'
import { kmsCategories } from '@/mocks/kms'
import { useKmsManualStore } from '@/store/kmsManuals'

const router = useRouter()
const manualStore = useKmsManualStore()
const currentUserName = computed(() => sessionStorage.getItem(AUTH_KEYS.userName) || '')
const rows = computed(() => manualStore.myActiveManuals(currentUserName.value))

const categoryName = (key) => kmsCategories.find((item) => item.key === key)?.name || '-'

const moveToTrash = (item) => {
  if (!window.confirm(`"${item.title}" 메뉴얼을 임시 보관함으로 이동하시겠습니까?`)) return
  const moved = manualStore.moveToTrash(item.id, currentUserName.value)
  if (!moved) {
    alert('삭제 권한이 없습니다.')
    return
  }
  alert('메뉴얼이 임시 보관함으로 이동되었습니다.')
}
</script>

<style scoped>
.my-manuals { display: flex; flex-direction: column; gap: 16px; }
.head,
.list { border: 1px solid var(--gray200); padding: 18px; }
.head { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.head h1 { font-size: 1.14rem; color: var(--gray800); }
.head p { margin-top: 6px; color: var(--gray500); font-size: 0.84rem; }
.primary { border: 1px solid var(--primary); background: var(--primary); color: #fff; border-radius: 10px; padding: 9px 14px; font-weight: 700; }
.list h2 { font-size: 0.94rem; color: var(--gray800); }
.empty { margin-top: 10px; border: 1px dashed var(--gray300); border-radius: 10px; background: var(--gray50); padding: 24px 12px; text-align: center; color: var(--gray500); }
table { margin-top: 10px; width: 100%; border-collapse: collapse; }
th, td { border-bottom: 1px solid var(--gray100); text-align: left; padding: 10px 8px; font-size: 0.84rem; }
th { color: var(--gray500); font-weight: 600; }
.title { border: none; background: transparent; color: var(--gray800); text-align: left; padding: 0; font-size: 0.84rem; }
.title:hover { color: var(--primary-dark); text-decoration: underline; }
.row-actions { display: flex; gap: 6px; }
.ghost { border: 1px solid var(--gray300); background: #fff; color: var(--gray600); border-radius: 8px; padding: 4px 9px; font-size: 0.74rem; }
.danger { border: 1px solid #fecaca; background: #fff; color: #b91c1c; border-radius: 8px; padding: 4px 9px; font-size: 0.74rem; }
@media (max-width: 900px) {
  .head { flex-direction: column; align-items: flex-start; }
}
</style>
