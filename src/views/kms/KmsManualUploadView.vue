<template>
  <div class="manual-upload">
    <section class="card header">
      <div>
        <p class="eyebrow">KMS MANUAL</p>
        <h1>업무 메뉴얼 업로드</h1>
        <p class="header-desc">기존 스타일을 유지하면서 문서 작성 경험을 강화한 편집 화면입니다.</p>
      </div>
      <div class="header-status">
        <span>{{ mode === 'write' ? '직접 작성' : 'PDF 업로드' }}</span>
      </div>
    </section>

    <section class="card content">
      <div class="mode-switch">
        <button :class="{ active: mode === 'write' }" @click="mode = 'write'">직접 작성</button>
        <button :class="{ active: mode === 'pdf' }" @click="mode = 'pdf'">PDF 업로드</button>
      </div>

      <div class="meta-grid">
        <div class="form-item">
          <label>제목</label>
          <input v-model="title" type="text" placeholder="예: Vue 프론트엔드 배포 가이드" />
        </div>
        <div class="form-item">
          <label>카테고리</label>
          <select v-model="category">
            <option value="">선택</option>
            <option v-for="item in kmsCategories" :key="item.key" :value="item.key">{{ item.name }}</option>
          </select>
        </div>
      </div>

      <div v-if="mode === 'write'" class="editor-panel">
        <div class="editor-head">
          <div>
            <label>본문 편집</label>
            <p>굵게, 색상, 리스트, 코드블록 등 문서 포맷을 지원합니다.</p>
          </div>
          <span class="editor-stat">{{ contentTextLength }}자</span>
        </div>
        <KmsRichEditor v-model="content" placeholder="업무 메뉴얼 내용을 입력하세요." />
      </div>
      <div v-else class="form-item file-item">
        <label>PDF</label>
        <input type="file" accept=".pdf" />
      </div>
    </section>

    <section class="card permissions">
      <h2>접근 권한 설정</h2>
      <p class="help">조직도 기준으로 팀/사용자를 선택해 열람·수정·삭제 권한을 구성합니다.</p>

      <div class="permission-card">
        <div class="permission-head">
          <strong>열람 권한</strong>
          <div class="scope-switch">
            <label><input v-model="readScope" type="radio" value="team" /> 팀 단위</label>
            <label><input v-model="readScope" type="radio" value="team-user" /> 팀 + 특정 사용자</label>
            <label><input v-model="readScope" type="radio" value="user" /> 특정 사용자</label>
          </div>
        </div>
        <div class="permission-body">
          <div v-if="readScope !== 'user'" class="picker-col">
            <div class="label-row">
              <label>팀 선택 (조직도)</label>
              <div class="inline-actions">
                <button type="button" class="pick-btn" @click="openTeamPicker('read')">조직도 선택</button>
                <button type="button" class="ghost-btn" @click="clearTargets('team', 'read')">초기화</button>
              </div>
            </div>
            <div class="selected-box">
              <p v-if="readTeamChips.length === 0" class="empty-chip">선택된 팀이 없습니다.</p>
              <button
                v-for="chip in readTeamChips"
                :key="chip.id"
                type="button"
                class="chip team"
                @click="removeTarget('team', 'read', chip.id)"
              >
                {{ chip.label }} <span>×</span>
              </button>
            </div>
          </div>
          <div v-if="readScope !== 'team'" class="picker-col">
            <div class="label-row">
              <label>사용자 선택 (조직도)</label>
              <div class="inline-actions">
                <button type="button" class="pick-btn" @click="openMemberPicker('read')">조직도 선택</button>
                <button type="button" class="ghost-btn" @click="clearTargets('user', 'read')">초기화</button>
              </div>
            </div>
            <div class="selected-box">
              <p v-if="readUserChips.length === 0" class="empty-chip">선택된 사용자가 없습니다.</p>
              <button
                v-for="chip in readUserChips"
                :key="chip.id"
                type="button"
                class="chip user"
                @click="removeTarget('user', 'read', chip.id)"
              >
                {{ chip.label }} <span>×</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="permission-card">
        <div class="permission-head">
          <strong>수정 권한</strong>
          <div class="scope-switch">
            <label><input v-model="editScope" type="radio" value="team" /> 팀 단위</label>
            <label><input v-model="editScope" type="radio" value="team-user" /> 팀 + 특정 사용자</label>
            <label><input v-model="editScope" type="radio" value="user" /> 특정 사용자</label>
          </div>
        </div>
        <div class="permission-body">
          <div v-if="editScope !== 'user'" class="picker-col">
            <div class="label-row">
              <label>팀 선택 (조직도)</label>
              <div class="inline-actions">
                <button type="button" class="pick-btn" @click="openTeamPicker('edit')">조직도 선택</button>
                <button type="button" class="ghost-btn" @click="clearTargets('team', 'edit')">초기화</button>
              </div>
            </div>
            <div class="selected-box">
              <p v-if="editTeamChips.length === 0" class="empty-chip">선택된 팀이 없습니다.</p>
              <button
                v-for="chip in editTeamChips"
                :key="chip.id"
                type="button"
                class="chip team"
                @click="removeTarget('team', 'edit', chip.id)"
              >
                {{ chip.label }} <span>×</span>
              </button>
            </div>
          </div>
          <div v-if="editScope !== 'team'" class="picker-col">
            <div class="label-row">
              <label>사용자 선택 (조직도)</label>
              <div class="inline-actions">
                <button type="button" class="pick-btn" @click="openMemberPicker('edit')">조직도 선택</button>
                <button type="button" class="ghost-btn" @click="clearTargets('user', 'edit')">초기화</button>
              </div>
            </div>
            <div class="selected-box">
              <p v-if="editUserChips.length === 0" class="empty-chip">선택된 사용자가 없습니다.</p>
              <button
                v-for="chip in editUserChips"
                :key="chip.id"
                type="button"
                class="chip user"
                @click="removeTarget('user', 'edit', chip.id)"
              >
                {{ chip.label }} <span>×</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="permission-card">
        <div class="permission-head">
          <strong>삭제 권한</strong>
          <div class="scope-switch">
            <label><input v-model="deleteScope" type="radio" value="team" /> 팀 단위</label>
            <label><input v-model="deleteScope" type="radio" value="team-user" /> 팀 + 특정 사용자</label>
            <label><input v-model="deleteScope" type="radio" value="user" /> 특정 사용자</label>
          </div>
        </div>
        <div class="permission-body">
          <div v-if="deleteScope !== 'user'" class="picker-col">
            <div class="label-row">
              <label>팀 선택 (조직도)</label>
              <div class="inline-actions">
                <button type="button" class="pick-btn" @click="openTeamPicker('delete')">조직도 선택</button>
                <button type="button" class="ghost-btn" @click="clearTargets('team', 'delete')">초기화</button>
              </div>
            </div>
            <div class="selected-box">
              <p v-if="deleteTeamChips.length === 0" class="empty-chip">선택된 팀이 없습니다.</p>
              <button
                v-for="chip in deleteTeamChips"
                :key="chip.id"
                type="button"
                class="chip team"
                @click="removeTarget('team', 'delete', chip.id)"
              >
                {{ chip.label }} <span>×</span>
              </button>
            </div>
          </div>
          <div v-if="deleteScope !== 'team'" class="picker-col">
            <div class="label-row">
              <label>사용자 선택 (조직도)</label>
              <div class="inline-actions">
                <button type="button" class="pick-btn" @click="openMemberPicker('delete')">조직도 선택</button>
                <button type="button" class="ghost-btn" @click="clearTargets('user', 'delete')">초기화</button>
              </div>
            </div>
            <div class="selected-box">
              <p v-if="deleteUserChips.length === 0" class="empty-chip">선택된 사용자가 없습니다.</p>
              <button
                v-for="chip in deleteUserChips"
                :key="chip.id"
                type="button"
                class="chip user"
                @click="removeTarget('user', 'delete', chip.id)"
              >
                {{ chip.label }} <span>×</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="permissions-footer">
        <button class="save-btn" @click="handleUpload">업로드</button>
      </div>
    </section>

    <EmployeePickerModal
      v-model="showTeamPicker"
      select-mode="team"
      :multiple="true"
      :initial-selected-ids="currentTeamPickerIds"
      @select-team-list="handlePickedTeamList"
    />
    <EmployeePickerModal
      v-model="showMemberPicker"
      :multiple="true"
      :initial-selected-ids="currentMemberPickerIds"
      @select-member-list="handlePickedMemberList"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import EmployeePickerModal from '@/components/org/EmployeePickerModal.vue'
import KmsRichEditor from '@/components/kms/KmsRichEditor.vue'
import { kmsCategories } from '@/mocks/kms'
import { createHrOrgTreeMock, sortMembersByRule } from '@/mocks/hr/organization'
import { AUTH_KEYS } from '@/utils/auth'
import { useKmsManualStore } from '@/store/kmsManuals'

const router = useRouter()
const manualStore = useKmsManualStore()
const mode = ref('write')
const title = ref('')
const category = ref('')
const content = ref('')
const readScope = ref('team')
const editScope = ref('team-user')
const deleteScope = ref('team-user')
const readTeams = ref([])
const readUsers = ref([])
const editTeams = ref([])
const editUsers = ref([])
const deleteTeams = ref([])
const deleteUsers = ref([])
const showTeamPicker = ref(false)
const showMemberPicker = ref(false)
const pickerPermissionTarget = ref('read')

const orgRoot = createHrOrgTreeMock()

const flattenTeams = (node, trail = [], acc = []) => {
  if (!node) return acc
  const nextTrail = [...trail, node.name]
  if (node.type === '팀') {
    acc.push({ id: node.id, name: node.name, label: nextTrail.join(' > ') })
  }
  ;(node.children || []).forEach((child) => flattenTeams(child, nextTrail, acc))
  return acc
}

const flattenMembers = (node, currentTeamName = '', acc = []) => {
  if (!node) return acc
  const teamName = node.type === '팀' ? node.name : currentTeamName
  sortMembersByRule(node.members || []).forEach((member) => {
    acc.push({ employeeId: member.employeeId, name: member.name, teamName, nodeId: node.id })
  })
  ;(node.children || []).forEach((child) => flattenMembers(child, teamName, acc))
  return acc
}

const teamOptions = flattenTeams(orgRoot)
const memberOptions = flattenMembers(orgRoot)
const teamLabelMap = computed(() => Object.fromEntries(teamOptions.map((team) => [team.id, team.label])))
const memberLabelMap = computed(() => Object.fromEntries(memberOptions.map((member) => [member.employeeId, `${member.name} (${member.teamName || '-'})`])))

const teamRefMap = {
  read: readTeams,
  edit: editTeams,
  delete: deleteTeams
}

const userRefMap = {
  read: readUsers,
  edit: editUsers,
  delete: deleteUsers
}

const toTeamChips = (ids) => ids.map((id) => ({ id, label: teamLabelMap.value[id] || id }))
const toUserChips = (ids) => ids.map((id) => ({ id, label: memberLabelMap.value[id] || id }))

const readTeamChips = computed(() => toTeamChips(readTeams.value))
const readUserChips = computed(() => toUserChips(readUsers.value))
const editTeamChips = computed(() => toTeamChips(editTeams.value))
const editUserChips = computed(() => toUserChips(editUsers.value))
const deleteTeamChips = computed(() => toTeamChips(deleteTeams.value))
const deleteUserChips = computed(() => toUserChips(deleteUsers.value))
const contentTextLength = computed(() => content.value.replace(/<[^>]+>/g, '').trim().length)

const openTeamPicker = (permission) => {
  pickerPermissionTarget.value = permission
  showTeamPicker.value = true
}

const openMemberPicker = (permission) => {
  pickerPermissionTarget.value = permission
  showMemberPicker.value = true
}

const currentTeamPickerIds = computed(() => [...teamRefMap[pickerPermissionTarget.value].value])
const currentMemberPickerIds = computed(() => [...userRefMap[pickerPermissionTarget.value].value])

const handlePickedTeamList = (teams) => {
  teamRefMap[pickerPermissionTarget.value].value = teams.map((team) => team.id)
}

const handlePickedMemberList = (members) => {
  userRefMap[pickerPermissionTarget.value].value = members.map((member) => member.employeeId)
}

const clearTargets = (targetType, permission) => {
  if (targetType === 'team') {
    teamRefMap[permission].value = []
    return
  }
  userRefMap[permission].value = []
}

const removeTarget = (targetType, permission, id) => {
  if (targetType === 'team') {
    teamRefMap[permission].value = teamRefMap[permission].value.filter((item) => item !== id)
    return
  }
  userRefMap[permission].value = userRefMap[permission].value.filter((item) => item !== id)
}

watch(readScope, (next) => {
  if (next === 'team') readUsers.value = []
  if (next === 'user') readTeams.value = []
})

watch(editScope, (next) => {
  if (next === 'team') editUsers.value = []
  if (next === 'user') editTeams.value = []
})

watch(deleteScope, (next) => {
  if (next === 'team') deleteUsers.value = []
  if (next === 'user') deleteTeams.value = []
})

const handleUpload = () => {
  const plainTextLength = contentTextLength.value
  if (!title.value.trim()) {
    alert('제목을 입력해 주세요.')
    return
  }
  if (!category.value) {
    alert('카테고리를 선택해 주세요.')
    return
  }
  if (mode.value === 'write' && !plainTextLength) {
    alert('본문 내용을 입력해 주세요.')
    return
  }

  const authorName = sessionStorage.getItem(AUTH_KEYS.userName) || '사용자'
  const bodyValue = mode.value === 'write'
    ? content.value
    : '<p>PDF 업로드 기반 문서입니다. 본문 자동 생성 대기 중입니다.</p>'

  const created = manualStore.createManual({
    title: title.value.trim(),
    category: category.value,
    body: bodyValue,
    author: authorName
  })

  alert('업무 메뉴얼이 등록되었습니다.')
  router.push(`/kms/manuals/detail/${created.id}`)
}
</script>

<style scoped>
.manual-upload { display: flex; flex-direction: column; gap: 16px; }
.header {
  padding: 20px;
  border: 1px solid var(--gray200);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.eyebrow { color: var(--primary); font-size: 0.76rem; font-weight: 700; letter-spacing: 0.08em; }
.header h1 { margin-top: 4px; font-size: 1.16rem; color: var(--gray800); }
.header-desc { margin-top: 6px; color: var(--gray500); font-size: 0.82rem; }
.header-status span {
  display: inline-flex;
  background: #e6fffb;
  color: #0f766e;
  border: 1px solid #99f6e4;
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 0.76rem;
  font-weight: 700;
}
.content { border: 1px solid var(--gray200); padding: 18px; }
.mode-switch { display: inline-flex; border: 1px solid var(--gray200); border-radius: 10px; overflow: hidden; margin-bottom: 14px; }
.mode-switch button { border: none; background: #fff; padding: 8px 14px; font-size: 0.82rem; color: var(--gray600); font-weight: 600; }
.mode-switch button.active { background: var(--primary); color: #fff; }
.meta-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.form-item { display: grid; gap: 6px; }
.form-item label { font-size: 0.8rem; color: var(--gray500); }
.form-item input,
.form-item select { border: 1px solid var(--gray300); border-radius: 10px; padding: 10px 12px; font-size: 0.86rem; background: #fff; }
.editor-panel { margin-top: 12px; display: grid; gap: 8px; }
.editor-head { display: flex; justify-content: space-between; gap: 8px; align-items: flex-end; }
.editor-head label { font-size: 0.8rem; color: var(--gray500); }
.editor-head p { margin-top: 3px; font-size: 0.77rem; color: var(--gray400); }
.editor-stat {
  border: 1px solid var(--gray200);
  border-radius: 999px;
  color: var(--gray600);
  background: var(--gray50);
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 700;
}
.file-item { margin-top: 8px; }
.permissions { border: 1px solid var(--gray200); padding: 18px; }
.permissions h2 { font-size: 0.95rem; color: var(--gray800); }
.help { margin-top: 6px; color: var(--gray500); font-size: 0.82rem; }
.permission-card { margin-top: 12px; border: 1px solid #dbe7ef; border-radius: 14px; background: linear-gradient(180deg, #ffffff 0%, #f8fcff 100%); padding: 14px; }
.permission-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.permission-head strong { color: var(--gray800); font-size: 0.87rem; }
.scope-switch { display: flex; gap: 12px; flex-wrap: wrap; }
.scope-switch label { display: flex; align-items: center; gap: 5px; font-size: 0.8rem; color: var(--gray600); }
.permission-body { margin-top: 10px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.picker-col { display: flex; flex-direction: column; gap: 6px; }
.label-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.label-row label { font-size: 0.8rem; color: var(--gray500); }
.inline-actions { display: flex; gap: 6px; }
.pick-btn {
  border: 1px solid #bfdbfe;
  background: #fff;
  color: #1d4ed8;
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 0.74rem;
  font-weight: 700;
}
.pick-btn:hover { border-color: #60a5fa; background: #eff6ff; }
.ghost-btn {
  border: 1px solid var(--gray300);
  background: #fff;
  color: var(--gray600);
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 0.74rem;
  font-weight: 700;
}
.selected-box {
  min-height: 74px;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  background: #fff;
  padding: 10px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-content: flex-start;
}
.empty-chip {
  margin: 0;
  font-size: 0.79rem;
  color: var(--gray400);
}
.chip {
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.76rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.chip span { font-weight: 800; }
.chip.team { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.chip.user { background: #f0fdfa; color: #0f766e; border-color: #99f6e4; }
.permissions-footer { margin-top: 16px; display: flex; justify-content: flex-end; }
.save-btn { background: var(--primary); color: #fff; border-radius: 10px; padding: 10px 18px; font-weight: 700; }
@media (max-width: 900px) {
  .header { flex-direction: column; }
  .meta-grid { grid-template-columns: 1fr; }
  .permission-head { flex-direction: column; align-items: flex-start; }
  .permission-body { grid-template-columns: 1fr; }
  .permissions-footer { justify-content: stretch; }
  .save-btn { width: 100%; }
}
</style>
