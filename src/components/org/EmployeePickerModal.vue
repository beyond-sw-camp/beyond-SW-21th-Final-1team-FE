<template>
  <BaseModal v-model="isOpen" width="1120px">
    <div class="picker-shell">
      <div class="picker-head">
        <h3>사원 찾기</h3>
        <button class="close-btn" type="button" @click="isOpen = false">닫기</button>
      </div>

      <div class="search-row">
        <input v-model.trim="keyword" type="text" placeholder="본부, 부서, 팀, 사원 이름 검색" />
      </div>

      <div class="picker-body">
        <article class="panel tree-panel">
          <h4>조직도</h4>
          <div class="tree-scroll">
            <button
              v-for="row in visibleRows"
              :key="row.key"
              type="button"
              class="tree-row"
              :class="{ active: selectedOrgId === row.node.id }"
              :style="{ paddingLeft: `${12 + row.depth * 16}px` }"
              @click="handleTreeClick(row)"
            >
              <span class="toggle">{{ row.expandable ? (isExpanded(row.node.id) ? '▾' : '▸') : '•' }}</span>
              <strong>{{ row.node.name }}</strong>
              <span class="type">
                {{ row.node.typeLabel || row.node.type || '-' }}
                <em v-if="row.node.memberCount > 0">{{ row.node.memberCount }}명</em>
              </span>
            </button>
            <p v-if="visibleRows.length === 0" class="empty">검색 결과가 없습니다.</p>
          </div>
        </article>

        <article class="panel member-panel">
          <h4>사원 목록</h4>
          <div class="member-scroll">
            <button
              v-for="member in members"
              :key="member.employeeId"
              type="button"
              class="member-row"
              :class="{ picked: pickedEmployeeId === member.employeeId }"
              @click="pickMember(member)"
            >
              <strong>{{ member.employeeName }}</strong>
              <span>{{ member.orgName || '-' }} / {{ member.jobName || '-' }} / {{ member.rankName || '-' }}</span>
            </button>
            <p v-if="!isMembersLoading && members.length === 0" class="empty">선택 가능한 사원이 없습니다.</p>
            <p v-if="isMembersLoading" class="empty">사원 목록 로딩 중...</p>
          </div>

          <div class="member-pagination" v-if="memberTotalPages > 1">
            <button type="button" class="page-btn" :disabled="memberPage === 1" @click="memberPage -= 1">이전</button>
            <span>{{ memberPage }} / {{ memberTotalPages }}</span>
            <button type="button" class="page-btn" :disabled="memberPage === memberTotalPages" @click="memberPage += 1">다음</button>
          </div>
        </article>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { getAdminHrChangeOrgTree, searchAdminHrChangeEmployees } from '@/api/hr'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'select-member'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const keyword = ref('')
const orgRoot = ref(null)
const expandedNodes = ref({})
const selectedOrgId = ref(null)
const members = ref([])
const pickedEmployeeId = ref(null)
const memberPage = ref(1)
const memberTotalPages = ref(1)
const isMembersLoading = ref(false)

const ORG_TYPE_LABEL = {
  COMPANY: '회사',
  HEADQUARTERS: '본부',
  DEPARTMENT: '부서',
  CENTER: '센터',
  TEAM: '팀',
  PART: '파트',
}

const normalize = (value) => String(value || '').trim().toLowerCase()
const isExpanded = (nodeId) => Boolean(expandedNodes.value[nodeId])

const normalizeTreeNode = (node) => {
  if (!node) return null
  const children = Array.isArray(node.children)
    ? node.children.map(normalizeTreeNode).filter(Boolean)
    : []

  return {
    id: node.orgId ?? node.id,
    parentId: node.parentOrgId ?? node.parentId ?? null,
    name: node.orgName ?? node.name,
    type: node.orgType ?? node.type,
    typeLabel: ORG_TYPE_LABEL[node.orgType ?? node.type] || node.orgType || node.type || '-',
    level: Number(node.orgLevel || node.level || 0),
    sortOrder: Number(node.sortOrder || node.order || 0),
    memberCount: Number(node.memberCount || 0),
    children,
  }
}

const buildTreeFromFlat = (rows) => {
  const normalized = (Array.isArray(rows) ? rows : [])
    .map((item) => normalizeTreeNode(item))
    .filter((item) => item?.id != null)
  if (!normalized.length) return null

  const nodeMap = new Map(normalized.map((node) => [node.id, { ...node, children: [] }]))

  for (const node of nodeMap.values()) {
    if (node.parentId == null || node.parentId === node.id) continue
    const parent = nodeMap.get(node.parentId)
    if (parent) {
      parent.children.push(node)
    }
  }

  const roots = [...nodeMap.values()].filter(
    (node) => node.parentId == null || node.parentId === node.id || !nodeMap.has(node.parentId),
  )

  const sortNodes = (nodes) => {
    nodes.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
      if (a.level !== b.level) return a.level - b.level
      return String(a.name || '').localeCompare(String(b.name || ''), 'ko')
    })
    nodes.forEach((node) => sortNodes(node.children))
  }
  sortNodes(roots)

  if (roots.length === 1) return roots[0]
  return {
    id: 'org-root',
    parentId: null,
    name: '전체 조직',
    type: 'COMPANY',
    typeLabel: '회사',
    level: 0,
    sortOrder: 0,
    memberCount: roots.reduce((sum, node) => sum + Number(node.memberCount || 0), 0),
    children: roots,
  }
}

const findNodeById = (node, nodeId) => {
  if (!node) return null
  if (node.id === nodeId) return node
  for (const child of node.children || []) {
    const found = findNodeById(child, nodeId)
    if (found) return found
  }
  return null
}

const filterTreeNode = (node, q) => {
  if (!node) return null
  const selfMatch = !q || normalize(`${node.name} ${node.typeLabel || ''}`).includes(q)
  const children = (node.children || []).map((child) => filterTreeNode(child, q)).filter(Boolean)
  if (!selfMatch && children.length === 0) return null
  return { ...node, children }
}

const filteredRoot = computed(() => {
  const q = normalize(keyword.value)
  return filterTreeNode(orgRoot.value, q)
})

const resolveDefaultSelectableOrgId = (root) => {
  if (!root) return null
  if (root.id !== 'org-root') return root.id
  if (Array.isArray(root.children) && root.children.length > 0) {
    return root.children[0].id
  }
  return null
}

const visibleRows = computed(() => {
  if (!filteredRoot.value) return []
  const rows = []
  const walk = (node, depth = 0) => {
    const expandable = Array.isArray(node.children) && node.children.length > 0
    rows.push({ key: `org-${node.id}`, node, depth, expandable })
    if (!isExpanded(node.id)) return
    ;(node.children || []).forEach((child) => walk(child, depth + 1))
  }
  walk(filteredRoot.value, 0)
  return rows
})

const loadOrgTree = async () => {
  try {
    const raw = await getAdminHrChangeOrgTree()
    const rootCandidate = Array.isArray(raw) ? buildTreeFromFlat(raw) : normalizeTreeNode(raw)
    orgRoot.value = rootCandidate || null
    if (rootCandidate?.id != null) {
      expandedNodes.value = { [rootCandidate.id]: true }
      selectedOrgId.value = resolveDefaultSelectableOrgId(rootCandidate)
    } else {
      expandedNodes.value = {}
      selectedOrgId.value = null
    }
  } catch (error) {
    console.error('조직도 로딩 실패:', error)
    orgRoot.value = null
    expandedNodes.value = {}
    selectedOrgId.value = null
    alert(error?.response?.data?.error?.message || '조직도 조회에 실패했습니다.')
  }
}

const loadMembers = async (page = 1) => {
  if (!selectedOrgId.value) {
    members.value = []
    memberTotalPages.value = 1
    return
  }

  isMembersLoading.value = true
  try {
    const data = await searchAdminHrChangeEmployees({
      page,
      size: 10,
      orgId: selectedOrgId.value === 'org-root' ? undefined : selectedOrgId.value,
      keyword: keyword.value || undefined,
    })
    members.value = Array.isArray(data?.content) ? data.content : []
    memberPage.value = Number(data?.currentPage || page || 1)
    memberTotalPages.value = Math.max(1, Number(data?.totalPages || 1))
  } finally {
    isMembersLoading.value = false
  }
}

const handleTreeClick = (row) => {
  selectedOrgId.value = row.node.id
  pickedEmployeeId.value = null
  if (row.expandable) {
    expandedNodes.value[row.node.id] = !expandedNodes.value[row.node.id]
  }
  memberPage.value = 1
  loadMembers(1)
}

const pickMember = (member) => {
  pickedEmployeeId.value = member.employeeId
  emit('select-member', member)
  isOpen.value = false
}

watch(
  () => props.modelValue,
  async (opened) => {
    if (!opened) return
    keyword.value = ''
    memberPage.value = 1
    pickedEmployeeId.value = null
    await loadOrgTree()
    await loadMembers(1)
  },
)

watch(memberPage, (next, prev) => {
  if (next === prev) return
  loadMembers(next)
})

watch(keyword, () => {
  memberPage.value = 1
  loadMembers(1)
})

watch(filteredRoot, (tree) => {
  if (!tree) return
  if (selectedOrgId.value == null) return
  if (!findNodeById(tree, selectedOrgId.value)) {
    selectedOrgId.value = resolveDefaultSelectableOrgId(tree)
    memberPage.value = 1
    loadMembers(1)
  }
})
</script>

<style scoped>
.picker-shell { display: flex; flex-direction: column; gap: 10px; height: calc(100vh - 190px); max-height: 730px; min-height: 520px; }
.picker-head { display: flex; align-items: center; justify-content: space-between; }
.picker-head h3 { margin: 0; color: var(--gray800); font-size: 1.1rem; }
.close-btn { height: 32px; border: 1px solid var(--gray200); border-radius: 9px; background: #fff; color: var(--gray600); padding: 0 12px; font-size: .8rem; font-weight: 700; }
.search-row input { width: 100%; height: 36px; border: 1px solid var(--gray200); border-radius: 10px; padding: 0 10px; }
.picker-body { flex: 1; min-height: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.panel { border: 1px solid var(--gray100); border-radius: 12px; background: #fff; display: flex; flex-direction: column; min-height: 0; }
.panel h4 { margin: 0; padding: 12px; border-bottom: 1px solid var(--gray100); color: var(--gray700); font-size: .9rem; }
.tree-scroll,.member-scroll { flex: 1; min-height: 0; overflow: auto; padding: 8px; }
.tree-row { width: 100%; border: none; background: #fff; border-radius: 8px; height: 34px; text-align: left; display: flex; align-items: center; gap: 8px; color: var(--gray700); }
.tree-row.active { background: #E0F2FE; }
.toggle { width: 10px; color: var(--gray500); }
.type { margin-left: auto; color: var(--gray400); font-size: .75rem; }
.type em { margin-left: 6px; font-style: normal; color: var(--gray500); }
.member-row { width: 100%; border: 1px solid var(--gray100); background: #fff; border-radius: 8px; padding: 8px 10px; text-align: left; display: flex; flex-direction: column; gap: 3px; margin-bottom: 8px; }
.member-row strong { color: var(--gray800); font-size: .86rem; }
.member-row span { color: var(--gray500); font-size: .76rem; }
.member-row:hover { border-color: #7dd3fc; background: #f0f9ff; }
.member-row.picked { border-color: #0891b2; background: #ecfeff; }
.empty { margin: 0; color: var(--gray400); font-size: .8rem; padding: 8px; }
.member-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 8px 12px 12px; }
.page-btn { height: 30px; border: 1px solid var(--gray200); border-radius: 8px; background: #fff; color: var(--gray600); font-size: .78rem; padding: 0 10px; }
.page-btn:disabled { opacity: .5; cursor: not-allowed; }
@media (max-width: 1100px) { .picker-body { grid-template-columns: 1fr; } }
</style>
