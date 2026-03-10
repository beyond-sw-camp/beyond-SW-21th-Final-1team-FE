<template>
  <section class="admin-page">
    <article class="card">
      <div class="card-head">
        <h3>공지 목록</h3>
        <button class="btn-primary" type="button" @click="openCreateModal">새 공지 등록</button>
      </div>

      <div class="filter-row">
        <div class="view-tabs">
          <button
            type="button"
            class="tab-btn"
            :class="{ active: viewMode === 'ALL' }"
            @click="viewMode = 'ALL'"
          >
            전체 공지
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: viewMode === 'MINE' }"
            @click="viewMode = 'MINE'"
          >
            내가 작성한 공지
          </button>
        </div>
        <select v-model="selectedType" class="filter-select">
          <option v-for="type in NOTICE_TYPE_OPTIONS" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
      </div>

      <div class="list-head">
        <div>카테고리</div>
        <div>제목</div>
        <div>작성자</div>
        <div>생성일자</div>
      </div>

      <div v-if="filteredNoticeList.length === 0" class="empty">등록된 공지사항이 없습니다.</div>

      <div v-for="notice in pagedNoticeList" :key="notice.id" class="list-row">
        <div>
          <span class="type-chip">{{ notice.typeLabel }}</span>
        </div>
        <div class="title-cell">
          <button type="button" class="title-btn" @click="openDetailModal(notice)">
            {{ notice.title }}
          </button>
        </div>
        <div>{{ notice.author }}</div>
        <div class="font-num">{{ notice.createdAt }}</div>
      </div>

      <div v-if="filteredNoticeList.length > 0" class="pagination">
        <button type="button" class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
          이전
        </button>
        <span class="page-info font-num">{{ currentPage }} / {{ totalPages }}</span>
        <button
          type="button"
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          다음
        </button>
      </div>
    </article>

    <div v-if="showCreateModal" class="overlay" @click.self="closeCreateModal">
      <div class="modal">
        <h2>새 공지 등록</h2>

        <label class="field">
          <span>제목</span>
          <input
            v-model="form.title"
            type="text"
            maxlength="120"
            placeholder="공지 제목을 입력하세요"
          />
        </label>

        <label class="field">
          <span>카테고리</span>
          <select v-model="form.type">
            <option v-for="type in formTypeOptions" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </label>

        <label class="field">
          <span>내용</span>
          <textarea
            v-model="form.content"
            rows="8"
            maxlength="4000"
            placeholder="공지 내용을 입력하세요"
          />
        </label>

        <div class="modal-actions">
          <button type="button" class="btn-ghost" @click="closeCreateModal">취소</button>
          <button type="button" class="btn-primary" :disabled="!canSubmit" @click="submitCreate">
            등록
          </button>
        </div>
      </div>
    </div>

    <NoticeDetailModal
      :open="showDetailModal"
      :notice="selectedNotice"
      compact
      @close="closeDetailModal"
    />

    <div v-if="toastMessage" class="toast">{{ toastMessage }}</div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import NoticeDetailModal from '@/components/notices/NoticeDetailModal.vue'
import { AUTH_KEYS } from '@/utils/auth'
import { NOTICE_TYPE_OPTIONS, createNotice, searchNotices } from '@/mocks/notices'

const PAGE_SIZE = 10
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const toastMessage = ref('')
const selectedType = ref('ALL')
const viewMode = ref('ALL')
const currentPage = ref(1)
const selectedNotice = ref(null)
let toastTimer = null

const sessionUserName = computed(() => sessionStorage.getItem(AUTH_KEYS.userName) || '관리자')

const form = reactive({
  title: '',
  type: NOTICE_TYPE_OPTIONS[1]?.value || 'SYSTEM_NOTICE',
  content: ''
})

const formTypeOptions = NOTICE_TYPE_OPTIONS.filter((item) => item.value !== 'ALL')
const filteredNoticeList = computed(() => {
  const rows = searchNotices({ type: selectedType.value })
  if (viewMode.value !== 'MINE') return rows
  return rows.filter((item) => item.author === sessionUserName.value)
})
const totalPages = computed(() => Math.max(1, Math.ceil(filteredNoticeList.value.length / PAGE_SIZE)))
const pagedNoticeList = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredNoticeList.value.slice(start, start + PAGE_SIZE)
})

const canSubmit = computed(
  () => form.title.trim().length > 0 && form.content.trim().length > 0 && !!form.type
)

const resetForm = () => {
  form.title = ''
  form.type = formTypeOptions[0]?.value || 'SYSTEM_NOTICE'
  form.content = ''
}

const openCreateModal = () => {
  resetForm()
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const openDetailModal = (notice) => {
  selectedNotice.value = notice
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedNotice.value = null
}

const showToast = (message) => {
  toastMessage.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 2500)
}

onBeforeUnmount(() => {
  if (toastTimer) clearTimeout(toastTimer)
})

watch([selectedType, viewMode], () => {
  currentPage.value = 1
})

watch(totalPages, (nextPage) => {
  if (currentPage.value > nextPage) currentPage.value = nextPage
})

const submitCreate = () => {
  if (!canSubmit.value) return

  createNotice({
    title: form.title,
    type: form.type,
    content: form.content,
    author: sessionUserName.value
  })

  closeCreateModal()
  showToast('공지사항이 등록되었습니다.')
}
</script>

<style scoped>
.admin-page { width: 100%; max-width: none; min-width: 0; }
.card { margin-top: 12px; background: #fff; border: 1px solid var(--gray200); border-radius: var(--radius); box-shadow: var(--shadow); padding: 16px; }
.card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.card-head h3 { margin: 0; color: var(--gray800); }
.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.view-tabs {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.tab-btn {
  height: 34px;
  border: 1px solid var(--gray200);
  border-radius: 10px;
  background: #fff;
  color: var(--gray600);
  font-size: .83rem;
  font-weight: 700;
  padding: 0 12px;
}
.tab-btn.active {
  background: #E0F2FE;
  border-color: #B9E6FE;
  color: #075985;
}
.filter-select {
  height: 34px;
  min-width: 160px;
  border: 1px solid var(--gray200);
  border-radius: 10px;
  background: #fff;
  color: var(--gray700);
  font-size: .84rem;
  padding: 0 10px;
}
.btn-primary {
  height: 34px;
  border: none;
  border-radius: 10px;
  background: var(--primary);
  color: #fff;
  padding: 0 12px;
  font-weight: 700;
}
.btn-primary:disabled { opacity: .45; cursor: default; }
.list-head,
.list-row {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr) 120px 120px;
  align-items: center;
  gap: 10px;
  padding: 12px 8px;
}
.list-head {
  border-top: 1px solid var(--gray100);
  border-bottom: 1px solid var(--gray200);
  color: var(--gray500);
  font-size: .8rem;
  font-weight: 700;
}
.list-row { border-bottom: 1px solid var(--gray100); color: var(--gray700); font-size: .88rem; }
.title-cell { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.title-btn {
  border: none;
  background: transparent;
  color: var(--gray700);
  font-size: .88rem;
  font-weight: 700;
  padding: 0;
  cursor: pointer;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.title-btn:hover { color: var(--primary-dark); text-decoration: underline; }
.type-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: #E0F2FE;
  color: #075985;
  font-size: .75rem;
  font-weight: 700;
}
.empty {
  padding: 44px 10px;
  text-align: center;
  color: var(--gray400);
  font-size: .9rem;
}
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 8px 4px;
}
.page-btn {
  height: 30px;
  border: 1px solid var(--gray200);
  border-radius: 8px;
  background: #fff;
  color: var(--gray600);
  font-size: .8rem;
  font-weight: 700;
  padding: 0 12px;
}
.page-btn:disabled { opacity: .45; cursor: default; }
.page-info { color: var(--gray500); font-size: .82rem; }
.overlay {
  position: fixed;
  inset: 0;
  z-index: 1300;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, .4);
}
.modal {
  width: min(760px, calc(100vw - 36px));
  max-height: calc(100vh - 36px);
  overflow: auto;
  border-radius: 16px;
  border: 1px solid var(--gray200);
  background: #fff;
  box-shadow: 0 24px 40px rgba(15, 23, 42, .22);
  padding: 18px;
}
.modal h2 { margin: 0 0 14px; color: var(--gray800); font-size: 1.2rem; }
.field { display: grid; gap: 8px; margin-bottom: 12px; }
.field span { color: var(--gray600); font-size: .85rem; font-weight: 700; }
.field input,
.field select,
.field textarea {
  width: 100%;
  border: 1px solid var(--gray200);
  border-radius: 10px;
  background: #fff;
  color: var(--gray700);
  font-size: .9rem;
  padding: 10px 12px;
}
.field textarea { resize: vertical; min-height: 180px; }
.modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}
.btn-ghost {
  height: 34px;
  border: 1px solid var(--gray200);
  border-radius: 10px;
  background: #fff;
  color: var(--gray600);
  padding: 0 12px;
  font-weight: 700;
}
.toast {
  position: fixed;
  right: 24px;
  top: 86px;
  z-index: 1400;
  min-width: 220px;
  border-radius: 10px;
  border: 1px solid #BFE8CA;
  background: #ECFDF3;
  color: #166534;
  padding: 10px 14px;
  font-size: .84rem;
  font-weight: 700;
  box-shadow: 0 10px 22px rgba(15, 23, 42, .12);
}
</style>
