<template>
  <div class="mypage">
    <!-- 브레드크럼 -->
    <div class="breadcrumb">인사 / 마이페이지</div>

    <!-- 프로필 헤더 -->
    <div class="profile-header">
      <div class="profile-left">
        <div class="profile-avatar">
          <img v-if="user.profileImage" :src="user.profileImage" alt="프로필 이미지" class="avatar-image" />
          <span v-else class="avatar-text">{{ user.name.slice(-2) }}</span>
          <span class="status-dot online"></span>
        </div>
        <div class="profile-info">
          <div class="profile-name-row">
            <span class="profile-name">{{ user.name }}</span>
            <span class="status-badge">정상 근무</span>
          </div>
          <div class="profile-dept">{{ user.team }} · {{ user.jobTitle }} · {{ user.position }}</div>
          <div class="profile-contacts">
            <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22 6 12 13 2 6"/></svg> {{ user.email }}</span>
            <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg> {{ user.phone }}</span>
            <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="5" width="12" height="14" rx="2"/><rect x="11.5" y="8" width="7" height="2.5" rx="0.6"/><path d="M5.2 6.5h1.9a1.9 1.9 0 011.9 1.9v7.2a1.9 1.9 0 01-1.9 1.9H5.2A1.7 1.7 0 013.5 15.8V8.2A1.7 1.7 0 015.2 6.5z"/><circle cx="12.4" cy="13.1" r="0.45" fill="currentColor" stroke="none"/><circle cx="15.1" cy="13.1" r="0.45" fill="currentColor" stroke="none"/><circle cx="17.8" cy="13.1" r="0.45" fill="currentColor" stroke="none"/><circle cx="12.4" cy="15.7" r="0.45" fill="currentColor" stroke="none"/><circle cx="15.1" cy="15.7" r="0.45" fill="currentColor" stroke="none"/><circle cx="17.8" cy="15.7" r="0.45" fill="currentColor" stroke="none"/></svg> {{ user.extension }}</span>
            <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> {{ user.workLocation }}</span>
          </div>
        </div>
      </div>
      <div class="profile-right">
        <div class="last-login">최근 로그인: {{ user.lastLogin }}</div>
      </div>
    </div>

    <!-- 탭 메뉴 -->
    <div class="tab-menu">
      <div
          v-for="tab in tabs" :key="tab.key"
          class="tab-item"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
      >{{ tab.label }}</div>
    </div>

    <!-- 탭 컨텐츠 -->
    <TabInfo v-if="activeTab === 'info'" :user="user" @update:user="user = $event"/>
    <TabSalary v-else-if="activeTab === 'salary'" />
    <TabHistory v-else-if="activeTab === 'history'" :employee-id="user.empNo" />
    <TabCertificate v-else-if="activeTab === 'certificate'" :user="user" />
    <!-- 추후 탭 추가 -->
    <div v-else class="tab-placeholder">{{ activeTabLabel }} 탭은 준비 중입니다.</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TabInfo from './tabs/TabInfo.vue'
import TabSalary from './tabs/TabSalary.vue'
import TabHistory from './tabs/TabHistory.vue'
import TabCertificate from './tabs/TabCertificate.vue'
import { createHrMyPageUserMock } from '@/mocks/hr/myPageUser'
import { AUTH_KEYS } from '@/utils/auth'

const activeTab = ref('info')
const tabs = [
  { key: 'info', label: '정보' },
  { key: 'salary', label: '급여' },
  { key: 'history', label: '인사 히스토리' },
  { key: 'certificate', label: '증명서' },
]

const activeTabLabel = computed(() => tabs.find(t => t.key === activeTab.value)?.label)

const user = ref(createHrMyPageUserMock())
const sessionLastLogin = sessionStorage.getItem(AUTH_KEYS.lastLoginAt)
if (sessionLastLogin) {
  user.value.lastLogin = sessionLastLogin
}
</script>

<style scoped>
.mypage{width:100%;max-width:none;min-width:0}
.breadcrumb{font-size:.78rem;color:var(--gray400);margin-bottom:4px}

/* 프로필 헤더 */
.profile-header{display:flex;justify-content:space-between;align-items:flex-start;padding:24px;background:var(--glass);backdrop-filter:blur(12px);border:1px solid var(--glass-border);border-radius:var(--radius);box-shadow:var(--shadow);margin:12px 0 0}
.profile-left{display:flex;gap:16px;align-items:center}
.profile-avatar{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#99F6E4,#0891B2);display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0}
.avatar-text{font-size:1.1rem;font-weight:700;color:#fff}
.avatar-image{width:100%;height:100%;border-radius:50%;object-fit:cover;border:1px solid var(--gray200);background:#fff}
.status-dot{position:absolute;bottom:2px;right:2px;width:14px;height:14px;border-radius:50%;border:2.5px solid #fff}
.status-dot.online{background:#22C55E}
.profile-name-row{display:flex;align-items:center;gap:8px}
.profile-name{font-size:1.2rem;font-weight:700;color:var(--gray800)}
.status-badge{font-size:.7rem;font-weight:600;padding:3px 10px;border-radius:20px;background:#ECFDF5;color:#059669}
.profile-dept{font-size:.85rem;color:var(--gray500);margin:2px 0 8px}
.profile-contacts{display:flex;gap:16px;flex-wrap:wrap}
.profile-contacts span{display:flex;align-items:center;gap:4px;font-size:.78rem;color:var(--gray500)}
.profile-contacts svg{color:var(--gray400)}
.profile-right{display:flex;flex-direction:column;align-items:flex-end;gap:8px}
.last-login{font-size:.75rem;color:var(--gray400)}

/* 탭 메뉴 */
.tab-menu{display:flex;gap:0;border-bottom:2px solid var(--gray200);margin:24px 0 0}
.tab-item{padding:10px 20px;font-size:.88rem;font-weight:500;color:var(--gray500);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .15s}
.tab-item:hover{color:var(--gray700)}
.tab-item.active{color:var(--primary);font-weight:700;border-bottom-color:var(--primary)}

.tab-placeholder{padding:60px 0;text-align:center;color:var(--gray400);font-size:.92rem}
</style>
