import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { manuals as seedManuals, sortByDateDesc } from '@/mocks/kms'

const toDateText = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const toPlainText = (value = '') => value
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

const bumpVersion = (currentVersion = 'V1.0', versionType = 'minor') => {
  const matched = String(currentVersion).match(/V(\d+)\.(\d+)/i)
  if (!matched) return 'V1.0'
  const major = Number(matched[1])
  const minor = Number(matched[2])
  if (versionType === 'major') return `V${major + 1}.0`
  return `V${major}.${minor + 1}`
}

export const useKmsManualStore = defineStore('kmsManual', () => {
  const manualRows = ref(seedManuals.map((row) => ({
    ...row,
    isDeleted: Boolean(row.isDeleted),
    deletedAt: row.deletedAt || '',
    deletedBy: row.deletedBy || ''
  })))

  const activeManuals = computed(() => (
    sortByDateDesc(manualRows.value.filter((item) => !item.isDeleted))
  ))

  const trashManuals = computed(() => (
    sortByDateDesc(manualRows.value.filter((item) => item.isDeleted), 'deletedAt')
  ))

  const getManualById = (manualId, options = {}) => {
    const includeDeleted = Boolean(options.includeDeleted)
    return manualRows.value.find((item) => (
      String(item.id) === String(manualId) && (includeDeleted || !item.isDeleted)
    ))
  }

  const createManual = (payload) => {
    const nextId = Math.max(0, ...manualRows.value.map((item) => Number(item.id) || 0)) + 1
    const now = toDateText()
    const plainBody = toPlainText(payload.body || '')

    const nextManual = {
      id: nextId,
      title: payload.title,
      category: payload.category,
      author: payload.author,
      createdAt: now,
      updatedAt: now,
      version: 'V1.0',
      summary: payload.summary || plainBody.slice(0, 60),
      body: payload.body,
      isDeleted: false,
      deletedAt: '',
      deletedBy: ''
    }

    manualRows.value.unshift(nextManual)
    return nextManual
  }

  const updateManual = (manualId, payload) => {
    const target = getManualById(manualId, { includeDeleted: false })
    if (!target) return null

    target.title = payload.title ?? target.title
    target.body = payload.body ?? target.body
    target.category = payload.category ?? target.category
    target.updatedAt = toDateText()
    target.version = bumpVersion(target.version, payload.versionType || 'minor')

    if (payload.summary) {
      target.summary = payload.summary
    } else {
      const plainBody = toPlainText(target.body)
      target.summary = plainBody.slice(0, 60)
    }

    return target
  }

  const moveToTrash = (manualId, actorName) => {
    const target = getManualById(manualId, { includeDeleted: false })
    if (!target) return null
    if (target.author !== actorName) return null

    target.isDeleted = true
    target.deletedAt = toDateText()
    target.deletedBy = actorName
    return target
  }

  const restoreManual = (manualId, actorName) => {
    const target = getManualById(manualId, { includeDeleted: true })
    if (!target || !target.isDeleted) return null
    if (target.author !== actorName) return null

    target.isDeleted = false
    target.deletedAt = ''
    target.deletedBy = ''
    target.updatedAt = toDateText()
    return target
  }

  const deleteManualPermanently = (manualId, actorName) => {
    const index = manualRows.value.findIndex((item) => String(item.id) === String(manualId))
    if (index < 0) return false
    const target = manualRows.value[index]
    if (!target.isDeleted) return false
    if (target.author !== actorName) return false
    manualRows.value.splice(index, 1)
    return true
  }

  const myActiveManuals = (authorName) => activeManuals.value.filter((item) => item.author === authorName)
  const myTrashManuals = (authorName) => trashManuals.value.filter((item) => item.author === authorName)

  return {
    manualRows,
    activeManuals,
    trashManuals,
    getManualById,
    createManual,
    updateManual,
    moveToTrash,
    restoreManual,
    deleteManualPermanently,
    myActiveManuals,
    myTrashManuals
  }
})
