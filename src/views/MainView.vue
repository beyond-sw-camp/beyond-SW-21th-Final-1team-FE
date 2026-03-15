<template>
  <div class="dashboard">
    <!-- Mobile quick menu -->
    <div class="mobile-dashboard">
      <header class="mobile-header">
        <div class="mobile-header-row">
          <div>
            <div class="mobile-title">RHight 모바일</div>
            <div class="mobile-subtitle">자주 쓰는 기능을 빠르게 실행합니다.</div>
          </div>
          <button class="mobile-logout" type="button" @click="handleLogout">로그아웃</button>
        </div>
      </header>

      <div class="mobile-list">
        <button
          v-for="action in mobileActions"
          :key="action.key"
          type="button"
          class="mobile-item"
          @click="router.push(action.to)"
        >
          <div class="mobile-icon" aria-hidden="true" v-html="action.icon"></div>
          <div class="mobile-text">
            <div class="mobile-item-title">{{ action.title }}</div>
            <div class="mobile-item-desc">{{ action.desc }}</div>
          </div>
        </button>
      </div>
    </div>

    <!-- ═══ TOP ROW ═══ -->
    <div class="top-row">
      <!-- 왼쪽: 프로필 + 연차 현황 (세로 쌓기) -->
      <div class="col-left">
        <CardProfile />
        <CardAnnual />
      </div>
      <!-- 가운데: 전자결재 -->
      <div class="col-mid">
        <CardApprovals />
      </div>
      <!-- 오른쪽: 공지사항 -->
      <div class="col-right">
        <CardNotices />
      </div>
    </div>

    <!-- ═══ BOTTOM ROW: 3칸 (근무시간 | 팀기념일 | TODO) ═══ -->
    <div class="bottom-row">
      <div class="col-bottom">
        <CardWorktime />
      </div>
      <div class="col-bottom">
        <CardTeamAnniversary />
      </div>
      <div class="col-bottom">
        <CardTodo />
      </div>
    </div>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { clearLoginSession } from '@/utils/auth'
import CardProfile from '@/components/dashboard/CardProfile.vue'
import CardApprovals from '@/components/dashboard/CardApprovals.vue'
import CardNotices from '@/components/dashboard/CardNotices.vue'
import CardAnnual from '@/components/dashboard/CardAnnual.vue'
import CardWorktime from '@/components/dashboard/CardWorktime.vue'
import CardTeamAnniversary from '@/components/dashboard/CardTeamAnniversary.vue'
import CardTodo from '@/components/dashboard/CardTodo.vue'

const router = useRouter()

const mobileActions = [
  {
    key: 'notices',
    title: '공지사항 확인',
    desc: '회사 공지와 알림을 확인합니다.',
    to: '/notices',
    icon:
      '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  },
  {
    key: 'attendance',
    title: '근태 확인/등록',
    desc: '근태 현황 조회 및 출퇴근을 기록합니다.',
    to: '/attendance/my',
    icon:
      '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></svg>',
  },
  {
    key: 'approval',
    title: '전자결재',
    desc: '결재 진행 상황과 문서를 확인합니다.',
    to: '/approval',
    icon:
      '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3h5v5"/><path d="M10 14L21 3"/><path d="M21 14v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6"/></svg>',
  },
  {
    key: 'mypage',
    title: '내 정보',
    desc: '프로필과 기본 정보를 확인합니다.',
    to: '/hr/my',
    icon:
      '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20a6 6 0 0 1 12 0"/></svg>',
  },
]

const handleLogout = () => {
  clearLoginSession()
  router.push('/login')
}
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-dashboard {
  display: none;
  background: #f5f8fc;
  border-radius: 18px;
  padding: 18px;
  border: 1px solid #eef2f7;
}

.mobile-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.mobile-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.mobile-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #0f172a;
}

.mobile-subtitle {
  font-size: 0.86rem;
  color: #64748b;
}

.mobile-logout {
  height: 32px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
}

.mobile-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.mobile-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid #dbe4f3;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.mobile-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 12px rgba(15, 23, 42, 0.08);
  border-color: #c9d8f0;
}

.mobile-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #eef3f8;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-item-title {
  font-size: 1rem;
  font-weight: 800;
  color: #111827;
}

.mobile-item-desc {
  font-size: 0.82rem;
  color: #6b7280;
}

/* Top row: 3 columns */
.top-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 16px;
  align-items: stretch;
}

/* 왼쪽 열: 프로필 + 연차 세로 쌓기 */
.col-left {
  flex: 0 0 240px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 가운데: 전자결재 */
.col-mid {
  flex: 1.2 1 0;
  min-width: 0;
}

/* 오른쪽: 공지사항 */
.col-right {
  flex: 1.3 1 0;
  min-width: 0;
}

/* Bottom row: 3 columns */
.bottom-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 16px;
  align-items: stretch;
}

.col-bottom {
  flex: 1 1 0;
  min-width: 0;
}
.col-bottom :deep(.card) {
  min-height: 310px;
  display: flex;
  flex-direction: column;
}
.col-bottom :deep(.card-body) {
  flex: 1;
}

@media (max-width: 768px) {
  .mobile-dashboard {
    display: block;
    min-height: calc(100vh - 32px);
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .mobile-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .mobile-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 18px 16px;
  }

  .mobile-item-title {
    font-size: 1.05rem;
  }

  .mobile-item-desc {
    font-size: 0.86rem;
  }

  .top-row,
  .bottom-row {
    display: none;
  }
}
</style>
