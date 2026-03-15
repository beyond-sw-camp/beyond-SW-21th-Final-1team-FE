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

      <div v-if="noticeList.length === 0" class="empty">등록된 공지사항이 없습니다.</div>

      <div v-for="notice in noticeList" :key="notice.id" class="list-row">
        <div>
          <span class="type-chip">{{ notice.typeLabel }}</span>
        </div>
        <div class="title-cell">
          <button
            type="button"
            class="pin-toggle-btn"
            :class="{ active: notice.isPinned }"
            :disabled="pinUpdatingId === notice.id"
            :title="notice.isPinned ? '고정 해제' : '상단 고정'"
            @click.stop="togglePin(notice)"
          >
            <span class="pin-icon" aria-hidden="true"></span>
          </button>
          <button type="button" class="title-btn" @click="openDetailModal(notice)">
            <span v-if="notice.isPinned" class="pin-badge" aria-label="고정">
              <span class="pin-icon" aria-hidden="true"></span>
            </span>
            {{ notice.title }}
          </button>
        </div>
        <div>{{ notice.author }}</div>
        <div class="font-num">{{ notice.createdAt }}</div>
      </div>

      <div v-if="totalElements > 0" class="pagination">
        <button type="button" class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
          이전
        </button>
        <span class="page-info font-num">{{ currentPage }} / {{ totalPages }}</span>
        <button
          type="button"
          class="page-btn"
          :disabled="currentPage >= totalPages"
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
          <button type="button" class="btn-primary" :disabled="isSubmitting || !canSubmit" @click="submitCreate">
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
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import NoticeDetailModal from '@/components/notices/NoticeDetailModal.vue'
import { createAdminNotice, getAdminMyNotices, getNotices, updateAdminNoticePin } from '@/api/hr'
import { NOTICE_TYPE_OPTIONS, normalizeNotice } from '@/utils/notice'

const showCreateModal = ref(false)
const showDetailModal = ref(false)
const toastMessage = ref('')
const selectedType = ref('ALL')
const viewMode = ref('ALL')
const currentPage = ref(1)
const selectedNotice = ref(null)
const noticeList = ref([])
const totalPages = ref(1)
const totalElements = ref(0)
const loading = ref(false)
const isSubmitting = ref(false)
const pinUpdatingId = ref(null)
let toastTimer = null

const form = reactive({
  title: '',
  type: NOTICE_TYPE_OPTIONS[1]?.value || 'SYSTEM',
  content: ''
})

const formTypeOptions = NOTICE_TYPE_OPTIONS.filter((item) => item.value !== 'ALL')

const canSubmit = computed(
  () => form.title.trim().length > 0 && form.content.trim().length > 0 && !!form.type
)

const resetForm = () => {
  form.title = ''
  form.type = formTypeOptions[0]?.value || 'SYSTEM'
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

const fetchNoticePage = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      ...(selectedType.value !== 'ALL' ? { noticeType: selectedType.value } : {}),
    }
    const pageData =
      viewMode.value === 'MINE' ? await getAdminMyNotices(params) : await getNotices(params)
    const content = Array.isArray(pageData?.content) ? pageData.content : []
    noticeList.value = content.map((row) => normalizeNotice(row))
    totalPages.value = Math.max(1, Number(pageData?.totalPages || 1))
    totalElements.value = Number(pageData?.totalElements || 0)
  } catch (error) {
    noticeList.value = []
    totalPages.value = 1
    totalElements.value = 0
    alert(error?.response?.data?.error?.message || '공지사항 조회에 실패했습니다.')
  } finally {
    loading.value = false
  }
}

watch(currentPage, async () => {
  await fetchNoticePage()
})

watch(totalPages, (nextPage) => {
  if (currentPage.value > nextPage) currentPage.value = nextPage
})

watch([selectedType, viewMode], async () => {
  if (currentPage.value !== 1) {
    currentPage.value = 1
    return
  }
  await fetchNoticePage()
})

const submitCreate = async () => {
  if (isSubmitting.value || !canSubmit.value) return
  isSubmitting.value = true
  try {
    await createAdminNotice({
      title: form.title.trim(),
      content: form.content.trim(),
      noticeType: form.type,
    })
    closeCreateModal()
    currentPage.value = 1
    await fetchNoticePage()
    showToast('공지사항이 등록되었습니다.')
  } catch (error) {
    alert(error?.response?.data?.error?.message || '공지사항 등록에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

const togglePin = async (notice) => {
  if (pinUpdatingId.value) return
  pinUpdatingId.value = notice.id
  try {
    await updateAdminNoticePin(notice.id, !notice.isPinned)
    await fetchNoticePage()
    showToast(notice.isPinned ? '고정을 해제했습니다.' : '상단에 고정했습니다.')
  } catch (error) {
    alert(error?.response?.data?.error?.message || '공지사항 고정 변경에 실패했습니다.')
  } finally {
    pinUpdatingId.value = null
  }
}

onMounted(async () => {
  await fetchNoticePage()
})
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
.title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pin-toggle-btn{
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 1px solid var(--gray200);
  background: #fff;
  color: var(--gray400);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.pin-toggle-btn:hover{
  border-color: #fdba74;
  color: #c2410c;
  background: #fff7ed;
}
.pin-toggle-btn.active{
  border-color: #fdba74;
  color: #9a3412;
  background: #fff7ed;
}
.pin-toggle-btn:disabled{
  opacity: .5;
  cursor: default;
}
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
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.title-btn:hover { color: var(--primary-dark); text-decoration: underline; }
.pin-badge{
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  background: #fff7ed;
  color: #9a3412;
  border: 1px solid #fdba74;
}
.pin-icon{
  width: 9px;
  height: 9px;
  background: currentColor;
  clip-path: polygon(50% 0, 86% 14%, 86% 44%, 58% 44%, 58% 100%, 42% 100%, 42% 44%, 14% 44%, 14% 14%);
}
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
