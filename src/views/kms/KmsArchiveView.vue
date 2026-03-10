<template>
  <div class="archive-main">
    <section class="card top-bar">
      <div>
        <h1>아카이브 메인</h1>
        <p>본인 조직 경로 기준으로 접근 가능한 문서만 표시됩니다.</p>
      </div>
      <div class="top-actions">
        <button class="btn ghost" type="button" @click="router.push('/kms/archive/my')">내 회의록</button>
        <button class="btn ghost" type="button" @click="router.push('/kms/archive/trash')">임시 보관함</button>
        <button class="btn register-btn" type="button" @click="router.push('/kms/archive/manage/new')">문서 등록</button>
      </div>
    </section>

    <section class="layout">
      <aside class="card local-sidebar">
        <h2>조직 트리</h2>
        <button type="button" class="scope-btn root" :class="{ active: activeNodeId === 'all' }" @click="activeNodeId = 'all'">
          전체
          <span>{{ readableDocs.length }}</span>
        </button>

        <div class="tree-wrap">
          <button
            v-for="row in treeRows"
            :key="row.node.id"
            type="button"
            class="scope-btn tree"
            :class="{ active: activeNodeId === row.node.id }"
            :style="{ paddingLeft: `${10 + row.depth * 14}px` }"
            @click="selectTreeNode(row)"
          >
            <span class="tree-left">
              <span class="toggle">
                {{ row.hasChildren ? (isExpanded(row.node.id) ? '▾' : '▸') : '•' }}
              </span>
              <strong>{{ row.node.name }}</strong>
            </span>
            <span>{{ countByNode(row.node.id) }}</span>
          </button>
        </div>
      </aside>

      <div class="content-col">
        <section class="card search-box">
          <input v-model.trim="keyword" type="text" placeholder="제목, 본문, 작성자, 카테고리 검색" />
          <select v-model="selectedCategory">
            <option v-for="option in archiveCategoryOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </section>

        <section class="card results">
          <header class="results-head">
            <h3>검색 결과</h3>
            <p>{{ filteredDocs.length }}건</p>
          </header>

          <KmsEmptyState v-if="filteredDocs.length === 0" title="해당 문서를 찾을 수 없습니다" />

          <div v-else class="card-grid">
            <article v-for="doc in filteredDocs" :key="doc.id" class="doc-card">
              <button type="button" class="title" @click="router.push(`/kms/archive/${doc.id}`)">{{ doc.title }}</button>
              <p class="meta">{{ doc.owner }} · {{ doc.category }} · {{ doc.createdAt }}</p>
              <p class="excerpt">{{ doc.summary }}</p>
              <div class="card-foot">
                <span>{{ doc.org }} / {{ doc.team }}</span>
                <button type="button" class="edit-btn" @click="router.push(`/kms/archive/manage/${doc.id}`)">수정</button>
              </div>
            </article>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import KmsEmptyState from '@/components/kms/KmsEmptyState.vue'
import { AUTH_KEYS } from '@/utils/auth'
import { archiveCategoryOptions } from '@/mocks/kms'
import { canReadArchiveDoc, resolveCurrentUserOrgContext, useKmsArchiveStore } from '@/store/kmsArchive'

const router = useRouter()
const archiveStore = useKmsArchiveStore()

const keyword = ref('')
const selectedCategory = ref('전체')
const activeNodeId = ref('all')
const expanded = ref({})

const currentUserId = computed(() => sessionStorage.getItem(AUTH_KEYS.userId) || '')
const userContext = computed(() => resolveCurrentUserOrgContext(currentUserId.value))

const readableDocs = computed(() => archiveStore.docs.value.filter((doc) => canReadArchiveDoc(doc, userContext.value)))

const allowedTeamMeta = computed(() => {
  const teamNames = new Set(readableDocs.value.map((doc) => doc.team))
  return archiveStore.teamMetaList.filter((meta) => teamNames.has(meta.teamName))
})

const treeModel = computed(() => {
  const root = { id: 'tree-root', name: '내 조직', children: [] }
  const map = new Map([[root.id, root]])

  allowedTeamMeta.value.forEach((meta) => {
    meta.pathIds.forEach((pathId, index) => {
      const pathName = meta.pathNames[index]
      if (!map.has(pathId)) {
        map.set(pathId, { id: pathId, name: pathName, children: [] })
      }
      const parentId = index === 0 ? root.id : meta.pathIds[index - 1]
      const parent = map.get(parentId)
      const child = map.get(pathId)
      if (!parent.children.some((item) => item.id === child.id)) parent.children.push(child)
    })
  })

  return root
})

if (!expanded.value[treeModel.value.id]) expanded.value[treeModel.value.id] = true

const treeRows = computed(() => {
  const rows = []
  const walk = (node, depth = 0) => {
    ;(node.children || []).forEach((child) => {
      const hasChildren = (child.children || []).length > 0
      rows.push({ node: child, depth, hasChildren })
      if (hasChildren && expanded.value[child.id]) walk(child, depth + 1)
    })
  }
  walk(treeModel.value, 0)
  return rows
})

const isExpanded = (nodeId) => Boolean(expanded.value[nodeId])

const selectTreeNode = (row) => {
  activeNodeId.value = row.node.id
  if (row.hasChildren) expanded.value[row.node.id] = !expanded.value[row.node.id]
}

const countByNode = (nodeId) => {
  if (nodeId === 'all') return readableDocs.value.length
  return readableDocs.value.filter((doc) => {
    const meta = archiveStore.teamNameMetaMap.get(doc.team)
    if (!meta) return false
    return meta.pathIds.includes(nodeId)
  }).length
}

const filteredDocs = computed(() => {
  const q = keyword.value.toLowerCase()
  return readableDocs.value.filter((doc) => {
    const categoryMatch = selectedCategory.value === '전체' || doc.category === selectedCategory.value
    if (!categoryMatch) return false

    const scopeMatch = activeNodeId.value === 'all' || (() => {
      const meta = archiveStore.teamNameMetaMap.get(doc.team)
      return meta ? meta.pathIds.includes(activeNodeId.value) : false
    })()
    if (!scopeMatch) return false

    if (!q) return true
    const text = `${doc.title} ${doc.summary} ${doc.body} ${doc.owner} ${doc.category}`.toLowerCase()
    return text.includes(q)
  })
})
</script>

<style scoped>
.archive-main { display: flex; flex-direction: column; gap: 16px; }
.top-bar { border: 1px solid var(--gray200); padding: 18px; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
h1 { font-size: 1.14rem; color: var(--gray800); }
p { margin-top: 6px; color: var(--gray500); font-size: 0.84rem; }
.top-actions { display: flex; gap: 8px; }
.btn { border: 1px solid var(--gray300); background: #fff; color: var(--gray600); border-radius: 10px; padding: 10px 14px; font-weight: 700; }
.register-btn { border: 1px solid var(--primary); background: var(--primary); color: #fff; }
.layout { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 14px; min-height: 620px; }
.local-sidebar { border: 1px solid var(--gray200); padding: 14px; }
h2 { font-size: 0.86rem; color: var(--gray700); margin-bottom: 10px; }
.tree-wrap { margin-top: 8px; border-top: 1px solid var(--gray100); padding-top: 8px; }
.scope-btn {
  width: 100%;
  border: 1px solid transparent;
  background: #fff;
  border-radius: 9px;
  padding: 8px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--gray600);
  font-size: 0.82rem;
  margin-bottom: 5px;
}
.scope-btn.root { background: #f8fafc; font-weight: 700; }
.scope-btn:hover { background: var(--gray50); }
.scope-btn.active { border-color: #99f6e4; background: #f0fdfa; color: #0f766e; font-weight: 700; }
.scope-btn.tree strong { font-weight: 600; }
.tree-left { display: flex; align-items: center; gap: 6px; min-width: 0; }
.toggle { width: 12px; color: var(--gray400); }
.content-col { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.search-box { border: 1px solid var(--gray200); padding: 12px; display: grid; grid-template-columns: 1fr 180px; gap: 10px; }
input, select { border: 1px solid var(--gray300); border-radius: 10px; padding: 10px 12px; }
.results { border: 1px solid var(--gray200); padding: 14px; min-height: 0; }
.results-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
h3 { font-size: 0.92rem; color: var(--gray800); }
.results-head p { margin: 0; font-size: 0.8rem; }
.card-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.doc-card { border: 1px solid var(--gray100); border-radius: 10px; padding: 12px; background: #fff; display: flex; flex-direction: column; gap: 6px; }
.title { border: none; background: transparent; text-align: left; color: var(--gray800); font-weight: 700; font-size: 0.9rem; padding: 0; }
.title:hover { color: var(--primary-dark); }
.meta { margin: 0; font-size: 0.76rem; color: var(--gray500); }
.excerpt { margin: 0; color: var(--gray600); font-size: 0.82rem; line-height: 1.6; min-height: 38px; }
.card-foot { margin-top: auto; display: flex; justify-content: space-between; align-items: center; }
.card-foot span { color: var(--gray400); font-size: 0.74rem; }
.edit-btn { border: 1px solid var(--gray300); background: #fff; color: var(--gray600); border-radius: 8px; padding: 5px 10px; font-size: 0.74rem; font-weight: 700; }
@media (max-width: 1100px) {
  .layout { grid-template-columns: 1fr; }
  .card-grid { grid-template-columns: 1fr; }
  .search-box { grid-template-columns: 1fr; }
  .top-actions { width: 100%; display: grid; grid-template-columns: 1fr; }
}
</style>
