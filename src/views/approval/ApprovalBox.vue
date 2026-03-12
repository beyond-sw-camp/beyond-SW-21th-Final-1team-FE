<template>
  <div class="box-container">
    <div class="page-header">
      <h2>전자 결재 문서함</h2>
      <p class="subtitle">모든 결재 문서를 종류별로 확인하고 관리할 수 있습니다.</p>
    </div>

    <div class="dashboard-grid">
      <!-- Total -->
      <DashboardCard 
        title="전체 문서함" 
        :items="totalItems" 
        count-label="건"
        link-type="all"
        @click-item="openDetail"
      />
      
      <!-- Received -->
      <DashboardCard 
        title="수신 문서함" 
        :items="receivedItems" 
        count-label="건"
        link-type="received"
        @click-item="openDetail"
      />

      <!-- Hold/Rejected -->
      <DashboardCard 
        title="보류/반려 문서함" 
        :items="issueItems" 
        count-label="건"
        link-type="issue"
        @click-item="openDetail"
      />

      <!-- Completed -->
      <DashboardCard 
        title="완료 문서함" 
        :items="completedItems" 
        count-label="건"
        link-type="completed"
        @click-item="openDetail"
      />

      <!-- Temporary -->
      <DashboardCard 
        title="임시 보관함" 
        :items="tempItems" 
        count-label="건"
        link-type="temp"
        @click-item="openDetail"
        is-temp
      />

      <DashboardCard
        title="참조 문서함"
        :items="referenceItems"
        count-label="건"
        link-type="reference"
        variant="reference"
        @click-item="openDetail"
      />
    </div>

    <ApprovalDetailModal
      :is-open="isDetailOpen"
      :item="selectedItem"
      @close="isDetailOpen = false"
      @action="handleModalAction"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import DashboardCard from './components/DashboardCard.vue'
import ApprovalDetailModal from './components/ApprovalDetailModal.vue'
import { deleteApproval, getApprovalBoxes, getApprovalDetail, markApprovalAsRead } from '@/api/approval'
import { mapApprovalDetailToItem, mapBoxItem } from '@/utils/approvalMapper'

const router = useRouter()
const boxItems = ref({
  all: [],
  received: [],
  issue: [],
  completed: [],
  temp: [],
  reference: [],
})
const isDetailOpen = ref(false)
const selectedItem = ref({})

const totalItems = computed(() => boxItems.value.all)
const receivedItems = computed(() => boxItems.value.received)
const issueItems = computed(() => boxItems.value.issue)
const completedItems = computed(() => boxItems.value.completed)
const tempItems = computed(() => boxItems.value.temp)
const referenceItems = computed(() => boxItems.value.reference)

async function loadBoxes() {
  const boxTypeMap = {
    all: 'ALL',
    received: 'INBOX',
    issue: 'REJECTED',
    completed: 'COMPLETED',
    temp: 'TEMP',
    reference: 'REFERENCE',
  }
  const entries = await Promise.all(
    Object.entries(boxTypeMap).map(async ([key, boxType]) => {
      try {
        const response = await getApprovalBoxes({ boxType, size: 10 })
        return [key, (response?.content || []).map(mapBoxItem)]
      } catch (_error) {
        return [key, []]
      }
    }),
  )
  boxItems.value = Object.fromEntries(entries)
}

const openDetail = async (item) => {
  try {
    if (!item.isRead) {
      try {
        await markApprovalAsRead(item.approvalId)
        item.isRead = true
      } catch (_error) {
      }
    }
    const detail = await getApprovalDetail(item.approvalId)
    selectedItem.value = mapApprovalDetailToItem(detail)
    isDetailOpen.value = true
  } catch (error) {
    alert(error?.response?.data?.error?.message || '결재 상세 조회에 실패했습니다.')
  }
}

const handleModalAction = (action) => {
  if (action.type === 'redraft' || action.type === 'draft') {
    router.push({ name: 'approval-draft', query: { from: action.id, source: 'box' } })
  } else if (action.type === 'delete' || action.type === 'cancel') {
    deleteApproval(action.id)
      .then(loadBoxes)
      .catch((error) => {
        alert(error?.response?.data?.error?.message || '기안 취소에 실패했습니다.')
      })
  } else if (action.type === 'review') {
    router.push({ name: 'approval-review' })
  }
  isDetailOpen.value = false
}

onMounted(loadBoxes)
</script>

<style scoped>
.box-container {
  padding: 24px;
  min-height: auto;
  background: var(--gray50);
  border-radius: 14px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
}

.page-header {
  margin-bottom: 16px;
  padding: 18px 20px;
  border: 1px solid var(--gray200);
  border-radius: 14px;
  background: #fff;
}

.page-header h2 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #212529;
  margin-bottom: 6px;
}

.subtitle {
  color: #868e96;
  font-size: 0.92rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

@media (max-width: 1400px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
