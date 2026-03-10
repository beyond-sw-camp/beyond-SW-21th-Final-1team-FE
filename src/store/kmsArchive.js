import { computed, reactive } from 'vue'
import { archiveDocuments, sortByDateDesc } from '@/mocks/kms'
import { createHrOrgTreeMock } from '@/mocks/hr/organization'

const toDateText = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const state = reactive({
  docs: structuredClone(archiveDocuments).map((doc) => ({
    ...doc,
    ownerUserId: doc.ownerUserId || '',
    updatedAt: doc.updatedAt || doc.createdAt,
    version: doc.version || 'V1.0',
    isDeleted: Boolean(doc.isDeleted),
    deletedAt: doc.deletedAt || '',
    deletedBy: doc.deletedBy || ''
  }))
})

const orgRoot = createHrOrgTreeMock()

const collectTeamMeta = (node, path = [], acc = []) => {
  if (!node) return acc
  const nextPath = [...path, node]
  if (node.type === '팀') {
    acc.push({
      teamId: node.id,
      teamName: node.name,
      pathIds: nextPath.map((item) => item.id),
      pathNames: nextPath.map((item) => item.name)
    })
  }
  ;(node.children || []).forEach((child) => collectTeamMeta(child, nextPath, acc))
  return acc
}

const teamMetaList = collectTeamMeta(orgRoot)
const teamNameMetaMap = new Map(teamMetaList.map((row) => [row.teamName, row]))

const findMemberPathByEmployeeId = (root, employeeId) => {
  let foundPath = null
  const walk = (node, path = []) => {
    if (!node || foundPath) return
    const nextPath = [...path, node]
    const hasMember = (node.members || []).some((member) => member.employeeId === employeeId)
    if (hasMember) {
      foundPath = nextPath
      return
    }
    ;(node.children || []).forEach((child) => walk(child, nextPath))
  }
  walk(root, [])
  return foundPath
}

export const resolveCurrentUserOrgContext = (userId) => {
  const effectiveUserId = String(userId || '')
  const memberPath = findMemberPathByEmployeeId(orgRoot, effectiveUserId)

  if (memberPath && memberPath.length > 0) {
    const names = memberPath.map((node) => node.name)
    const teamNode = [...memberPath].reverse().find((node) => node.type === '팀')
    return {
      userId: effectiveUserId,
      teamId: teamNode?.id || null,
      teamName: teamNode?.name || '',
      scopeNames: new Set(names)
    }
  }

  return {
    userId: effectiveUserId,
    teamId: null,
    teamName: '',
    scopeNames: new Set()
  }
}

export const canReadArchiveDoc = (doc, userContext) => {
  const userGranted = (doc.allowedUserIds || []).includes(userContext.userId)
  const scopeGranted = (doc.allowedScopes || []).some((scope) => userContext.scopeNames.has(scope))
  return userGranted || scopeGranted
}

const getDocsSorted = () => sortByDateDesc(state.docs.filter((doc) => !doc.isDeleted))
const getTrashSorted = () => sortByDateDesc(state.docs.filter((doc) => doc.isDeleted), 'deletedAt')

const generateArchiveId = () => {
  const maxId = state.docs.reduce((acc, row) => Math.max(acc, Number(row.id) || 0), 0)
  return maxId + 1
}

export const useKmsArchiveStore = () => {
  const docs = computed(() => getDocsSorted())
  const trashDocs = computed(() => getTrashSorted())

  const getDocById = (docId, options = {}) => {
    const includeDeleted = Boolean(options.includeDeleted)
    return state.docs.find((doc) => (
      String(doc.id) === String(docId) && (includeDeleted || !doc.isDeleted)
    ))
  }

  const createDoc = (payload) => {
    const id = generateArchiveId()
    const createdAt = toDateText()

    const next = {
      id,
      title: payload.title,
      category: payload.category,
      body: payload.body,
      summary: payload.body.slice(0, 80),
      createdAt,
      updatedAt: createdAt,
      version: 'V1.0',
      owner: payload.owner,
      ownerUserId: payload.ownerUserId || '',
      org: payload.org,
      team: payload.team,
      attachments: payload.attachments || [],
      allowDownload: true,
      allowedScopes: (payload.allowedScopes && payload.allowedScopes.length > 0)
        ? payload.allowedScopes
        : [payload.org, payload.team].filter(Boolean),
      allowedUserIds: payload.allowedUserIds || [],
      isDeleted: false,
      deletedAt: '',
      deletedBy: ''
    }

    state.docs.push(next)
    return next
  }

  const updateDoc = (docId, payload, userContext) => {
    const target = getDocById(docId)
    if (!target) return null
    if (!userContext || !canReadArchiveDoc(target, userContext)) return null

    target.title = payload.title
    target.category = payload.category
    target.body = payload.body
    target.summary = payload.body.slice(0, 80)
    target.org = payload.org
    target.team = payload.team
    target.updatedAt = toDateText()
    target.allowedScopes = (payload.allowedScopes && payload.allowedScopes.length > 0)
      ? payload.allowedScopes
      : [payload.org, payload.team].filter(Boolean)
    target.allowedUserIds = payload.allowedUserIds || target.allowedUserIds
    target.attachments = payload.attachments || target.attachments
    return target
  }

  const moveToTrash = (docId, actorUserId, actorName) => {
    const target = getDocById(docId)
    if (!target) return null
    const isOwner = String(target.ownerUserId || '') === String(actorUserId || '') || target.owner === actorName
    if (!isOwner) return null

    target.isDeleted = true
    target.deletedAt = toDateText()
    target.deletedBy = actorName || actorUserId || '사용자'
    return target
  }

  const restoreDoc = (docId, actorUserId, actorName) => {
    const target = getDocById(docId, { includeDeleted: true })
    if (!target || !target.isDeleted) return null
    const isOwner = String(target.ownerUserId || '') === String(actorUserId || '') || target.owner === actorName
    if (!isOwner) return null

    target.isDeleted = false
    target.deletedAt = ''
    target.deletedBy = ''
    target.updatedAt = toDateText()
    return target
  }

  const deleteDocPermanently = (docId, actorUserId, actorName) => {
    const index = state.docs.findIndex((item) => String(item.id) === String(docId))
    if (index < 0) return false
    const target = state.docs[index]
    const isOwner = String(target.ownerUserId || '') === String(actorUserId || '') || target.owner === actorName
    if (!target.isDeleted || !isOwner) return false
    state.docs.splice(index, 1)
    return true
  }

  const myDocs = (userId, userName) => docs.value.filter((doc) => (
    String(doc.ownerUserId || '') === String(userId || '') || doc.owner === userName
  ))

  const myTrashDocs = (userId, userName) => trashDocs.value.filter((doc) => (
    String(doc.ownerUserId || '') === String(userId || '') || doc.owner === userName
  ))

  return {
    docs,
    trashDocs,
    teamMetaList,
    teamNameMetaMap,
    getDocById,
    createDoc,
    updateDoc,
    moveToTrash,
    restoreDoc,
    deleteDocPermanently,
    myDocs,
    myTrashDocs
  }
}
