<template>
  <header class="header">
    <div class="header-logo" @click="$emit('nav-click', '메인')">
      <div class="logo-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      </div>
      <span class="logo-text">RHight</span>
    </div>

    <nav class="header-nav">
      <div
        v-for="item in navItems"
        :key="item"
        class="nav-item"
        :class="{ active: activeNav === item }"
        @click="$emit('nav-click', item)"
      >
        {{ item }}
      </div>
    </nav>

    <div class="header-right">
      <button
        v-if="isAdmin"
        type="button"
        class="admin-mode-btn"
        :class="{ active: isAdminRoute }"
        @click="goAdminMode"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        관리자 모드
      </button>

      <button
        class="header-icon-btn"
        type="button"
        title="공지사항"
        aria-label="공지사항"
        @click="goNotices"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 11V9a2 2 0 0 1 2-2h2l9-3v16l-9-3H5a2 2 0 0 1-2-2v-2" />
          <path d="M7 17v4" />
          <path d="M19 8a3 3 0 0 1 0 8" />
        </svg>
      </button>

      <button class="header-icon-btn" type="button" title="사원 찾기" aria-label="사원 찾기" @click="showOrgSearchModal = true">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="9" y="3" width="6" height="6" rx="1" />
          <path d="M12 9v3" />
          <path d="M6 12h12" />
          <path d="M6 12v3" />
          <path d="M18 12v3" />
          <rect x="3" y="15" width="6" height="6" rx="1" />
          <rect x="15" y="15" width="6" height="6" rx="1" />
        </svg>
      </button>

      <div class="search-box">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="headerSearchKeyword" type="text" placeholder="검색어를 입력하세요" />
      </div>

      <div class="header-logout" @click="handleLogout">
        로그아웃
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
          <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </div>
    </div>
  </header>

  <OrgSearchModal v-model="showOrgSearchModal" :initial-keyword="headerSearchKeyword" />
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import OrgSearchModal from '@/components/org/OrgSearchModal.vue'
import { clearLoginSession, isAdminRole } from '@/utils/auth'

defineProps({
  activeNav: { type: String, default: '메인' }
})
defineEmits(['nav-click'])

const router = useRouter()
const route = useRoute()
const navItems = ['메인', '인사', '근태', '급여', '성과', '전자결재', 'KMS']
const showOrgSearchModal = ref(false)
const headerSearchKeyword = ref('')
const isAdmin = computed(() => isAdminRole())
const isAdminRoute = computed(() => route.path.startsWith('/admin'))

const goAdminMode = () => {
  router.push('/admin/main')
}

const goNotices = () => {
  router.push('/notices')
}

const handleLogout = () => {
  clearLoginSession()
  router.push('/login')
}
</script>

<style scoped>
.header{
  position:sticky;top:0;z-index:200;height:var(--header-h);
  background:#fff;border-bottom:1px solid var(--gray200);
  display:flex;align-items:center;padding:0 24px;gap:16px;
}
.header-logo{display:flex;align-items:center;gap:8px;cursor:pointer;margin-right:16px}
.logo-icon{
  width:28px;height:28px;background:var(--primary);border-radius:8px;
  display:flex;align-items:center;justify-content:center;
}
.logo-text{font-family:var(--font-num);font-size:1.15rem;font-weight:800;color:var(--gray800)}
.header-nav{display:flex;gap:2px}
.nav-item{
  padding:7px 14px;font-size:0.92rem;font-weight:500;color:var(--gray500);
  cursor:pointer;border-bottom:2px solid transparent;transition:all var(--transition);
}
.nav-item:hover{color:var(--gray700)}
.nav-item.active{color:var(--primary);font-weight:700;border-bottom-color:var(--primary)}
.header-right{margin-left:auto;display:flex;align-items:center;gap:8px}
.search-box{
  display:flex;align-items:center;gap:7px;
  background:var(--gray50);border:1px solid var(--gray200);border-radius:var(--radius-sm);
  padding:7px 14px;width:220px;color:var(--gray400);transition:all var(--transition);
}
.search-box:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px var(--accent)}
.search-box input{
  border:none;background:transparent;font-size:0.82rem;color:var(--gray700);width:100%;
}
.search-box input::placeholder{color:var(--gray400)}
.header-icon-btn{
  width:36px;height:36px;border-radius:var(--radius-sm);
  display:flex;align-items:center;justify-content:center;
  color:var(--gray500);cursor:pointer;position:relative;
  border:none;background:transparent;
  transition:all var(--transition);
}
.header-icon-btn:hover{background:var(--gray50);color:var(--gray700)}
.header-logout{
  display:flex;align-items:center;gap:5px;
  font-size:0.82rem;font-weight:500;color:var(--gray500);
  cursor:pointer;padding:6px 10px;border-radius:var(--radius-sm);
  transition:all var(--transition);
}
.header-logout:hover{background:var(--gray50);color:var(--gray700)}

.admin-mode-btn{
  height: 32px;
  border-radius: 10px;
  border: 1px solid #BFDBFE;
  background: #EFF6FF;
  color: #1D4ED8;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: .79rem;
  font-weight: 700;
  cursor: pointer;
}

.admin-mode-btn:hover{
  background: #DBEAFE;
}

.admin-mode-btn.active{
  border-color: #60A5FA;
  background: #DBEAFE;
}
</style>
