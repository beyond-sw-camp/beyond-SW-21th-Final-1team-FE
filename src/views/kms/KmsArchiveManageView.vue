<template>
  <div class="archive-manage">
    <section class="card head">
      <h1>{{ isEditMode ? '아카이브 문서 수정' : '아카이브 문서 등록' }}</h1>
      <p>조직도에서 읽기 권한 대상(조직/팀/사용자)을 선택해 문서 접근 범위를 지정합니다.</p>
    </section>

    <section class="card form-card">
      <div class="form-grid">
        <label>
          제목
          <input v-model="form.title" type="text" placeholder="문서 제목 입력" />
        </label>
        <label>
          카테고리
          <select v-model="form.category">
            <option v-for="item in archiveCategoryOptions.slice(1)" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>
      </div>

      <div class="editor-panel">
        <div class="editor-head">
          <label>본문</label>
          <span class="editor-stat">{{ bodyTextLength }}자</span>
        </div>
        <KmsRichEditor v-model="form.body" placeholder="문서 본문 입력" />
      </div>

      <section class="permission-card">
        <h3>읽기 권한</h3>

        <div class="picker-col">
          <div class="label-row">
            <strong>조직/팀</strong>
            <div class="inline-actions">
              <button type="button" class="pick-btn" @click="openTeamPicker">조직도에서 선택</button>
              <button type="button" class="ghost-btn" @click="clearSelectedTeams">초기화</button>
            </div>
          </div>
          <div class="selected-box">
            <p v-if="selectedTeamChips.length === 0" class="empty-chip">선택된 팀이 없습니다.</p>
            <button
              v-for="chip in selectedTeamChips"
              :key="chip.id"
              type="button"
              class="chip team"
              @click="removeSelectedTeam(chip.id)"
            >
              {{ chip.label }} <span>×</span>
            </button>
          </div>
        </div>

        <div class="picker-col">
          <div class="label-row">
            <strong>사용자</strong>
            <div class="inline-actions">
              <button type="button" class="pick-btn" @click="openMemberPicker">조직도에서 선택</button>
              <button type="button" class="ghost-btn" @click="clearSelectedUsers">초기화</button>
            </div>
          </div>
          <div class="selected-box">
            <p v-if="selectedUserChips.length === 0" class="empty-chip">선택된 사용자가 없습니다.</p>
            <button
              v-for="chip in selectedUserChips"
              :key="chip.id"
              type="button"
              class="chip user"
              @click="removeSelectedUser(chip.id)"
            >
              {{ chip.label }} <span>×</span>
            </button>
          </div>
        </div>
      </section>

      <label>
        첨부파일
        <input type="file" multiple @change="handleFileChange" />
      </label>
      <ul v-if="form.attachments.length > 0" class="file-list">
        <li v-for="file in form.attachments" :key="file.name">
          <span>{{ file.name }}</span>
          <em>{{ file.size }}</em>
        </li>
      </ul>

      <div class="actions">
        <button type="button" class="ghost" @click="router.push('/kms/archive')">취소</button>
        <button type="button" class="save" @click="handleSave">{{ isEditMode ? '수정 완료' : '문서 등록' }}</button>
      </div>
    </section>

    <EmployeePickerModal
      v-model="showTeamPicker"
      select-mode="team"
      :multiple="true"
      :initial-selected-ids="selectedTeamIds"
      @select-team-list="handlePickedTeamList"
    />
    <EmployeePickerModal
      v-model="showMemberPicker"
      :multiple="true"
      :initial-selected-ids="selectedUserIds"
      @select-member-list="handlePickedMemberList"
    />
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EmployeePickerModal from '@/components/org/EmployeePickerModal.vue'
import KmsRichEditor from '@/components/kms/KmsRichEditor.vue'
import { archiveCategoryOptions } from '@/mocks/kms'
import { createHrOrgTreeMock, sortMembersByRule } from '@/mocks/hr/organization'
import { AUTH_KEYS } from '@/utils/auth'
import { useKmsNotificationStore } from '@/store/kmsNotification'
import { resolveCurrentUserOrgContext, useKmsArchiveStore } from '@/store/kmsArchive'

const route = useRoute()
const router = useRouter()
const isEditMode = computed(() => route.params.archiveId !== 'new')
const archiveStore = useKmsArchiveStore()
const notificationStore = useKmsNotificationStore()
const currentUserId = computed(() => sessionStorage.getItem(AUTH_KEYS.userId) || '')
const userContext = computed(() => resolveCurrentUserOrgContext(currentUserId.value))

const baseDoc = computed(() => archiveStore.getDocById(route.params.archiveId))
const defaultCategory = archiveCategoryOptions[1] || ''

const hasHtmlTag = (value = '') => /<\/?[a-z][\s\S]*>/i.test(value)
const escapeHtml = (value = '') => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
const toEditorHtml = (value = '') => {
  if (!value) return ''
  if (hasHtmlTag(value)) return value
  return `<p>${escapeHtml(value).replace(/\n/g, '<br />')}</p>`
}
const toPlainText = (value = '') => value
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

const form = reactive({
  title: baseDoc.value?.title || '',
  category: baseDoc.value?.category || defaultCategory,
  body: toEditorHtml(baseDoc.value?.body || ''),
  orgScope: baseDoc.value?.org || '',
  teamScope: baseDoc.value?.team || '',
  attachments: baseDoc.value?.attachments ? [...baseDoc.value.attachments] : []
})
const bodyTextLength = computed(() => toPlainText(form.body).length)

const teamMetaById = computed(() => new Map(archiveStore.teamMetaList.map((row) => [row.teamId, row])))
const teamMetaByName = computed(() => new Map(archiveStore.teamMetaList.map((row) => [row.teamName, row])))

const initialTeamIds = (() => {
  if (!baseDoc.value) return []
  const scopeSet = new Set(baseDoc.value.allowedScopes || [])
  return archiveStore.teamMetaList
    .filter((row) => scopeSet.has(row.teamName))
    .map((row) => row.teamId)
})()

const selectedTeamIds = ref(initialTeamIds)
const selectedUserIds = ref([...(baseDoc.value?.allowedUserIds || [])])
const showTeamPicker = ref(false)
const showMemberPicker = ref(false)

const toTeamChipLabel = (teamId) => {
  const row = teamMetaById.value.get(teamId)
  if (!row) return teamId
  return row.pathNames.join(' > ')
}

const orgRoot = createHrOrgTreeMock()
const flattenMembers = (node, currentTeamName = '', acc = []) => {
  if (!node) return acc
  const teamName = node.type === '팀' ? node.name : currentTeamName
  sortMembersByRule(node.members || []).forEach((member) => {
    acc.push({ employeeId: member.employeeId, name: member.name, teamName })
  })
  ;(node.children || []).forEach((child) => flattenMembers(child, teamName, acc))
  return acc
}

const memberOptions = flattenMembers(orgRoot)
const memberLabelMap = computed(() => Object.fromEntries(
  memberOptions.map((member) => [member.employeeId, `${member.name} (${member.teamName || '-'})`])
))

const selectedTeamChips = computed(() => {
  return selectedTeamIds.value.map((id) => ({ id, label: toTeamChipLabel(id) }))
})

const selectedUserChips = computed(() => {
  return selectedUserIds.value.map((id) => ({ id, label: memberLabelMap.value[id] || id }))
})

const syncPrimaryScope = () => {
  if (selectedTeamIds.value.length === 0) return
  const first = teamMetaById.value.get(selectedTeamIds.value[0])
  if (!first) return
  form.teamScope = first.teamName
  form.orgScope = first.pathNames[1] || first.pathNames[0] || ''
}

const openTeamPicker = () => { showTeamPicker.value = true }
const openMemberPicker = () => { showMemberPicker.value = true }

const handlePickedTeamList = (teams) => {
  selectedTeamIds.value = teams.map((team) => team.id)
  syncPrimaryScope()
}

const handlePickedMemberList = (members) => {
  selectedUserIds.value = members.map((member) => member.employeeId)
}

const clearSelectedTeams = () => {
  selectedTeamIds.value = []
  if (!isEditMode.value) {
    form.orgScope = ''
    form.teamScope = ''
  }
}

const clearSelectedUsers = () => {
  selectedUserIds.value = []
}

const removeSelectedTeam = (teamId) => {
  selectedTeamIds.value = selectedTeamIds.value.filter((id) => id !== teamId)
  syncPrimaryScope()
}

const removeSelectedUser = (employeeId) => {
  selectedUserIds.value = selectedUserIds.value.filter((id) => id !== employeeId)
}

const buildAllowedScopes = () => {
  const names = new Set()
  selectedTeamIds.value.forEach((teamId) => {
    const row = teamMetaById.value.get(teamId)
    ;(row?.pathNames || []).forEach((name) => names.add(name))
  })
  return [...names]
}

const handleFileChange = (event) => {
  const fileList = [...(event.target.files || [])]
  form.attachments = fileList.map((file) => ({
    name: file.name,
    size: `${Math.max(1, Math.round(file.size / 1024))}KB`
  }))
}

const handleSave = () => {
  const plainBody = toPlainText(form.body)
  if (!form.title.trim() || !plainBody) {
    alert('제목과 본문을 입력해 주세요.')
    return
  }

  if (selectedTeamIds.value.length === 0 && selectedUserIds.value.length === 0) {
    alert('읽기 권한(조직/팀 또는 사용자)을 1개 이상 선택해 주세요.')
    return
  }

  if (!form.teamScope || !form.orgScope) {
    syncPrimaryScope()
  }

  const ownerName = sessionStorage.getItem(AUTH_KEYS.userName) || '사용자'
  const allowedScopes = buildAllowedScopes()
  const allowedUserIds = [...selectedUserIds.value]

  const payload = {
    title: form.title.trim(),
    category: form.category,
    body: form.body.trim(),
    org: form.orgScope,
    team: form.teamScope,
    owner: ownerName,
    ownerUserId: currentUserId.value,
    attachments: form.attachments,
    allowedScopes,
    allowedUserIds
  }

  const actionText = isEditMode.value ? '수정' : '등록'
  const savedDoc = isEditMode.value
    ? archiveStore.updateDoc(route.params.archiveId, payload, userContext.value)
    : archiveStore.createDoc(payload)

  if (!savedDoc) {
    alert('대상 문서를 찾을 수 없거나 수정 권한이 없습니다.')
    return
  }

  const actionLabel = isEditMode.value ? '수정' : '등록'
  notificationStore.pushArchiveNotice({
    action: actionLabel,
    doc: savedDoc,
    actorName: ownerName
  })

  alert(`아카이브 문서 ${actionText}이 완료되었습니다.\n속해있는 조직/팀원에게 알림 발송이 완료되었습니다. (데모)`)
  router.push(`/kms/archive/${savedDoc.id}`)
}

if (selectedTeamIds.value.length === 0 && baseDoc.value?.team) {
  const teamMeta = teamMetaByName.value.get(baseDoc.value.team)
  if (teamMeta) selectedTeamIds.value = [teamMeta.teamId]
}
</script>

<style scoped>
.archive-manage { display: flex; flex-direction: column; gap: 16px; }
.head,.form-card { border: 1px solid var(--gray200); padding: 18px; }
h1 { font-size: 1.15rem; color: var(--gray800); }
p { margin-top: 6px; color: var(--gray500); font-size: 0.84rem; }
.form-card { display: grid; gap: 10px; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
label { display: grid; gap: 6px; color: var(--gray600); font-size: 0.81rem; }
input, select { border: 1px solid var(--gray300); border-radius: 10px; padding: 10px 12px; font-size: 0.86rem; }
input[type="file"] { padding: 7px 10px; min-height: 38px; line-height: 1.2; }
.editor-panel { display: grid; gap: 8px; }
.editor-head { display: flex; justify-content: space-between; align-items: center; }
.editor-head label { color: var(--gray600); font-size: 0.81rem; }
.editor-stat {
  border: 1px solid var(--gray200);
  border-radius: 999px;
  background: var(--gray50);
  color: var(--gray600);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
}

.permission-card { margin-top: 4px; border: 1px solid #dbe7ef; border-radius: 12px; padding: 12px; display: grid; gap: 10px; }
.permission-card h3 { margin: 0; font-size: 0.9rem; color: var(--gray800); }
.picker-col { display: grid; gap: 6px; }
.label-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.inline-actions { display: flex; gap: 6px; }
.pick-btn { border: 1px solid #bfdbfe; background: #fff; color: #1d4ed8; border-radius: 8px; padding: 5px 10px; font-size: 0.74rem; font-weight: 700; }
.pick-btn:hover { border-color: #60a5fa; background: #eff6ff; }
.ghost-btn { border: 1px solid var(--gray300); background: #fff; color: var(--gray600); border-radius: 8px; padding: 5px 10px; font-size: 0.74rem; font-weight: 700; }
.selected-box { min-height: 74px; border: 1px dashed #cbd5e1; border-radius: 10px; background: #fff; padding: 10px; display: flex; gap: 6px; flex-wrap: wrap; align-content: flex-start; }
.empty-chip { margin: 0; font-size: 0.79rem; color: var(--gray400); }
.chip { border: 1px solid transparent; border-radius: 999px; padding: 4px 10px; font-size: 0.76rem; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; }
.chip span { font-weight: 800; }
.chip.team { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.chip.user { background: #f0fdfa; color: #0f766e; border-color: #99f6e4; }

.file-list { list-style: none; padding: 0; margin: -4px 0 0; display: flex; flex-direction: column; gap: 6px; }
.file-list li { border: 1px solid var(--gray100); border-radius: 9px; padding: 8px 10px; display: flex; justify-content: space-between; }
.file-list span { color: var(--gray700); font-size: 0.81rem; }
.file-list em { color: var(--gray400); font-style: normal; font-size: 0.76rem; }
.actions { margin-top: 8px; display: flex; justify-content: flex-end; gap: 8px; }
.ghost { border: 1px solid var(--gray300); background: #fff; color: var(--gray600); border-radius: 9px; padding: 8px 12px; }
.save { border: 1px solid var(--primary); background: var(--primary); color: #fff; border-radius: 9px; padding: 8px 12px; font-weight: 700; }

@media (max-width: 900px) {
  .form-grid { grid-template-columns: 1fr; }
  .label-row { flex-direction: column; align-items: flex-start; }
}
</style>
