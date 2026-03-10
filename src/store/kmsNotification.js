import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const nowText = () => {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const mi = String(now.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

export const useKmsNotificationStore = defineStore('kmsNotification', () => {
  const logs = ref([])

  const pushArchiveNotice = ({ action, doc, actorName }) => {
    const message = `[KMS 알림] ${actorName}님이 ${doc.team}(${doc.org}) 문서를 ${action}했습니다: ${doc.title}`
    logs.value.unshift({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: 'archive',
      action,
      message,
      createdAt: nowText(),
      docId: doc.id,
      team: doc.team,
      org: doc.org
    })
    return message
  }

  const recentLogs = computed(() => logs.value.slice(0, 20))

  return {
    logs,
    recentLogs,
    pushArchiveNotice
  }
})
