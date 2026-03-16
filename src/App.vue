<template>
  <div id="app" :class="{ 'mobile-simple': isMobileSimpleRoute }">
    <template v-if="showLayout">
      <Headerbar :active-nav="activeNav" @nav-click="handleNavClick" />
      <div class="app-body">
        <Sidebar />
        <main class="main-content" :class="{ 'main-content--performance': isPerformanceRoute }">
          <router-view />
        </main>
      </div>
    </template>
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePerformanceStore } from '@/store/performance'
import Headerbar from '@/components/layout/Headerbar.vue'
import Sidebar from '@/components/layout/Sidebar.vue'

const router = useRouter()
const route = useRoute()
const perfStore = usePerformanceStore()
const activeNav = ref('메인')
const isPerformanceRoute = computed(() => route.path.startsWith('/performance'))
const isMobileSimpleRoute = computed(() => {
  const path = route.path
  if (path === '/' || path === '/main') return true
  if (path.startsWith('/notices')) return true
  if (path.startsWith('/attendance')) return true
  if (path.startsWith('/approval')) return true
  if (path.startsWith('/hr/my')) return true
  return false
})

// 로그인 페이지에서는 레이아웃 숨기기
const showLayout = computed(() => route.path !== '/login')

const handleNavClick = (nav) => {
  console.log('Navigating to:', nav)
  activeNav.value = nav
  if (nav === '메인') router.push('/')
  else if (nav === '인사') router.push('/hr')
  else if (nav === '전자결재') router.push('/approval')
  else if (nav === '성과') {
    perfStore.setPage('dashboard')
    router.push('/performance')
  }
  else if (nav === '근태') router.push('/attendance/my')
  else if (nav === '급여') router.push('/salary/my')
}

// 라우트 변경 감지하여 헤더 메뉴 활성화 상태 동기화
watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/approval')) {
    activeNav.value = '전자결재'
  } else if (newPath.startsWith('/attendance')) {
    activeNav.value = '근태'
  } else if (newPath.startsWith('/hr')) {
    activeNav.value = '인사'
  } else if (newPath.startsWith('/performance')) {
    activeNav.value = '성과'
  } else if (newPath.startsWith('/salary')) {
    activeNav.value = '급여'
  } else if (newPath.startsWith('/notices')) {
    activeNav.value = '메인'
  } else if (newPath === '/' || newPath === '/main') {
    activeNav.value = '메인'
  }
}, { immediate: true })
</script>
