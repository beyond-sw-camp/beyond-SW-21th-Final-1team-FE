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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { mockApprovalBox } from '@/utils/approvalData';
import DashboardCard from './components/DashboardCard.vue';
import ApprovalDetailModal from './components/ApprovalDetailModal.vue';
import {
  getCurrentApprovalUser,
  isUserRelatedApprovalDocument,
  matchesCurrentApprovalUser,
  isCurrentUserDrafterDocument
} from './utils/approvalVisibility';

const router = useRouter();
const allDocuments = ref([...mockApprovalBox]);
const currentUser = getCurrentApprovalUser();

const visibleDocuments = computed(() => allDocuments.value.filter((doc) => isUserRelatedApprovalDocument(doc, currentUser)));
const drafterDocuments = computed(() => allDocuments.value.filter((doc) => isCurrentUserDrafterDocument(doc, currentUser)));
const totalItems = computed(() => visibleDocuments.value.slice(0, 10));
const issueItems = computed(() => visibleDocuments.value.filter(d => d.status === '반려' || d.status === '보류').slice(0, 10));
const completedItems = computed(() => visibleDocuments.value.filter(d => d.status === '완료').slice(0, 10));
const tempItems = computed(() => drafterDocuments.value.filter(d => d.status === '임시저장').slice(0, 10));

const isReferenceDocumentForCurrentUser = (doc) => {
  if (doc?.status !== '완료') return false;
  if (!Array.isArray(doc?.referrers) || doc.referrers.length === 0) return false;
  return doc.referrers.some((referrer) => matchesCurrentApprovalUser(referrer, currentUser));
};

const isReceivedDocumentForCurrentUser = (doc) => {
  if (isCurrentUserDrafterDocument(doc, currentUser)) return false;
  if (matchesCurrentApprovalUser(doc?.currentApprover, currentUser)) return true;

  if (Array.isArray(doc?.approvalLine) && doc.approvalLine.some((line) => {
    if (!line) return false;
    return matchesCurrentApprovalUser(`${line.name || ''} ${line.position || ''}`, currentUser)
      || matchesCurrentApprovalUser(line.name, currentUser);
  })) {
    return true;
  }

  if (Array.isArray(doc?.referrers) && doc.referrers.some((referrer) => matchesCurrentApprovalUser(referrer, currentUser))) {
    return true;
  }

  return false;
};

const referenceItems = computed(() => visibleDocuments.value.filter(isReferenceDocumentForCurrentUser).slice(0, 10));
const receivedItems = computed(() => visibleDocuments.value.filter(isReceivedDocumentForCurrentUser).slice(0, 10));

const isDetailOpen = ref(false);
const selectedItem = ref({});

const openDetail = (item) => {
  selectedItem.value = item;
  isDetailOpen.value = true;
  
  // Mark as read locally for the demo
  if (!item.isRead) {
    const doc = allDocuments.value.find(d => d.id === item.id);
    if (doc) doc.isRead = true;
  }
};

const handleModalAction = (action) => {
  console.log('Action performed:', action);
  if (action.type === 'redraft') {
    // Navigate to draft with pre-filled state
    router.push({ name: 'approval-draft', query: { from: action.id, source: 'box' } });
  } else if (action.type === 'draft') {
    router.push({ name: 'approval-draft', query: { from: action.id, source: 'box' } });
  } else if (action.type === 'delete' || action.type === 'cancel') {
    // Remove from mock list locally
    allDocuments.value = allDocuments.value.filter(d => d.id !== action.id);
  } else if (action.type === 'review') {
    router.push({ name: 'approval-review' });
  }
  isDetailOpen.value = false;
};
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
