<template>
  <div v-if="archive" class="archive-detail">
    <section class="card head">
      <div>
        <h1>{{ archive.title }}</h1>
        <p>{{ archive.owner }} · {{ archive.createdAt }} · {{ archive.category }}</p>
        <p v-if="archive.isDeleted" class="trash-note">임시 보관함 문서입니다. 읽기 전용으로 확인 가능합니다.</p>
      </div>
      <div class="head-actions">
        <button type="button" class="ghost" @click="router.push(listPath)">목록</button>
        <button type="button" class="ghost" @click="goHistory">히스토리</button>
        <button v-if="!archive.isDeleted" type="button" class="ghost" @click="router.push(`/kms/compare/archive/${archive.id}`)">문서 비교</button>
        <button v-if="isOwner && !archive.isDeleted" type="button" class="danger" @click="onDelete">삭제</button>
        <button v-if="isOwner && archive.isDeleted" type="button" class="restore" @click="onRestore">복원</button>
        <button v-if="isOwner && archive.isDeleted" type="button" class="danger" @click="onDeletePermanently">영구삭제</button>
        <button
          v-if="canDownload"
          type="button"
          class="download"
          @click="downloadAllAttachments"
        >
          다운로드
        </button>
      </div>
    </section>

    <KmsAccessDenied
      v-if="!hasReadPermission"
      title="문서 열람 권한이 없습니다"
      description="접근 권한이 없는 문서는 상세 내용을 확인할 수 없습니다."
    />

    <section v-else class="card body">
      <h2>본문</h2>
      <KmsRichEditor :model-value="archiveBodyHtml" readonly />
    </section>

    <section v-if="hasReadPermission" class="card attach">
      <h2>첨부파일</h2>
      <ul>
        <li v-for="file in archive.attachments" :key="file.name">
          <button
            type="button"
            class="file-link"
            @click="handleAttachmentDownload(file)"
          >
            {{ file.name }}
          </button>
          <em>{{ file.size }}</em>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import KmsAccessDenied from '@/components/kms/KmsAccessDenied.vue'
import KmsRichEditor from '@/components/kms/KmsRichEditor.vue'
import { AUTH_KEYS } from '@/utils/auth'
import { canReadArchiveDoc, resolveCurrentUserOrgContext, useKmsArchiveStore } from '@/store/kmsArchive'

const route = useRoute()
const router = useRouter()
const currentUserId = computed(() => sessionStorage.getItem(AUTH_KEYS.userId) || '')
const currentUserName = computed(() => sessionStorage.getItem(AUTH_KEYS.userName) || '')
const userContext = computed(() => resolveCurrentUserOrgContext(currentUserId.value))
const archiveStore = useKmsArchiveStore()

const includeDeleted = computed(() => route.query.fromTrash === '1')
const listPath = computed(() => (includeDeleted.value ? '/kms/archive/trash' : '/kms/archive'))
const archive = computed(() => archiveStore.getDocById(route.params.archiveId, { includeDeleted: includeDeleted.value }))
const hasReadPermission = computed(() => archive.value && canReadArchiveDoc(archive.value, userContext.value))
const isOwner = computed(() => (
  String(archive.value?.ownerUserId || '') === currentUserId.value || archive.value?.owner === currentUserName.value
))
const canDownload = computed(() => {
  if (!archive.value || !hasReadPermission.value) return false
  return archive.value.allowDownload
})

const hasHtmlTag = (value = '') => /<\/?[a-z][\s\S]*>/i.test(value)
const escapeHtml = (value = '') => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
const archiveBodyHtml = computed(() => {
  const body = archive.value?.body || ''
  if (hasHtmlTag(body)) return body
  return `<p>${escapeHtml(body).replace(/\n/g, '<br />')}</p>`
})

const goHistory = () => {
  const suffix = archive.value?.isDeleted ? '?fromTrash=1' : ''
  router.push(`/kms/archive/history/${archive.value.id}${suffix}`)
}

const handleAttachmentDownload = (file) => {
  if (!canDownload.value) {
    alert('첨부파일 다운로드 권한이 없습니다.')
    return
  }
  const fileContent = [
    `[KMS 아카이브 첨부파일 샘플 다운로드]`,
    `문서명: ${archive.value?.title || '-'}`,
    `파일명: ${file.name}`,
    `크기: ${file.size}`
  ].join('\n')
  const blob = new Blob([fileContent], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = file.name
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

const downloadAllAttachments = async () => {
  if (!canDownload.value) {
    alert('첨부파일 다운로드 권한이 없습니다.')
    return
  }
  const files = archive.value?.attachments || []
  if (files.length === 0) {
    alert('다운로드할 첨부파일이 없습니다.')
    return
  }
  for (const file of files) {
    handleAttachmentDownload(file)
    // 브라우저의 연속 다운로드 차단 가능성을 줄이기 위한 짧은 간격
    await new Promise((resolve) => setTimeout(resolve, 80))
  }
}

const onDelete = () => {
  if (!archive.value) return
  if (!window.confirm('이 문서를 임시 보관함으로 이동하시겠습니까?')) return
  const moved = archiveStore.moveToTrash(archive.value.id, currentUserId.value, currentUserName.value)
  if (!moved) {
    alert('본인이 작성한 문서만 삭제할 수 있습니다.')
    return
  }
  alert('문서가 임시 보관함으로 이동되었습니다.')
  router.push('/kms/archive/my')
}

const onRestore = () => {
  if (!archive.value || !isOwner.value) return
  const restored = archiveStore.restoreDoc(archive.value.id, currentUserId.value, currentUserName.value)
  if (!restored) {
    alert('복원 권한이 없습니다.')
    return
  }
  alert('문서가 복원되었습니다.')
  router.push(`/kms/archive/${archive.value.id}`)
}

const onDeletePermanently = () => {
  if (!archive.value || !isOwner.value) return
  if (!window.confirm('이 문서를 영구삭제하시겠습니까?')) return
  const removed = archiveStore.deleteDocPermanently(archive.value.id, currentUserId.value, currentUserName.value)
  if (!removed) {
    alert('영구삭제 권한이 없습니다.')
    return
  }
  alert('문서가 영구삭제되었습니다.')
  router.push('/kms/archive/trash')
}
</script>

<style scoped>
.archive-detail { display: flex; flex-direction: column; gap: 16px; }
.head,.body,.attach { border: 1px solid var(--gray200); padding: 18px; }
.head { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
h1 { font-size: 1.15rem; color: var(--gray800); }
h2 { font-size: 0.94rem; color: var(--gray800); margin-bottom: 8px; }
p { margin-top: 6px; color: var(--gray500); font-size: 0.84rem; line-height: 1.7; }
.trash-note { color: #92400e; font-size: 0.78rem; margin-top: 4px; line-height: 1.4; }
.head-actions { display: flex; gap: 8px; }
.ghost { border: 1px solid var(--gray300); background: #fff; color: var(--gray600); border-radius: 9px; padding: 8px 12px; }
.restore { border: 1px solid #99f6e4; background: #f0fdfa; color: #0f766e; border-radius: 9px; padding: 8px 12px; }
.danger { border: 1px solid #fecaca; background: #fff; color: #b91c1c; border-radius: 9px; padding: 8px 12px; }
.download { border: 1px solid var(--primary); background: var(--primary); color: #fff; border-radius: 9px; padding: 8px 12px; font-weight: 700; }
ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
li { display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--gray100); border-radius: 9px; padding: 9px 10px; background: #fff; }
.file-link {
  border: none;
  background: transparent;
  color: var(--gray700);
  font-size: 0.84rem;
  text-align: left;
  padding: 0;
}
.file-link:hover { color: var(--primary-dark); text-decoration: underline; }
li em { font-style: normal; color: var(--gray400); font-size: 0.76rem; }
</style>
