import { createRouter, createWebHistory } from 'vue-router'
import { AUTH_KEYS, isAdminRole } from '@/utils/auth'
import { getFirstAllowedRouteName, getViewCodeByRouteName } from '@/constants/viewPermissions'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'main',
    component: () => import('@/views/MainView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/notices',
    name: 'notice-list',
    component: () => import('@/views/notices/NoticeListView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    redirect: '/admin/main',
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/main',
    name: 'admin-main',
    component: () => import('@/views/admin/AdminMain.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, section: 'admin' }
  },
  {
    path: '/admin/employees',
    name: 'admin-employees',
    component: () => import('@/views/admin/AdminEmployeesView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, section: 'admin' }
  },
  {
    path: '/admin/hr-change',
    name: 'admin-hr-change',
    component: () => import('@/views/admin/AdminHrChangeView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, section: 'admin' }
  },
  {
    path: '/admin/policies',
    name: 'admin-policies',
    component: () => import('@/views/admin/AdminPoliciesView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, section: 'admin' }
  },
  {
    path: '/admin/notices',
    name: 'admin-notices',
    component: () => import('@/views/admin/AdminNoticesView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, section: 'admin' }
  },
  {
    path: '/admin/attendance',
    name: 'admin-attendance',
    component: () => import('@/views/admin/AdminAttendanceView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, section: 'admin' }
  },
  {
    path: '/admin/salary',
    name: 'admin-salary',
    component: () => import('@/views/admin/AdminSalaryManage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, section: 'admin' }
  },
  {
    path: '/admin/performance',
    name: 'admin-performance',
    component: () => import('@/views/admin/AdminPerformanceView.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      section: 'admin',
      title: '성과 시스템 관리',
      description: '팀별 팀 성과/개인 성과 반영 비율 관리'
    }
  },
  {
    path: '/admin/evaluation',
    name: 'admin-evaluation',
    component: () => import('@/views/admin/AdminEvalView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, section: 'admin' }
  },
  {
    path: '/approval',
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'approval-main', component: () => import('@/views/approval/ApprovalMain.vue') },
      { path: 'draft', name: 'approval-draft', component: () => import('@/views/approval/ApprovalDraft.vue') },
      { path: 'status', name: 'approval-status', component: () => import('@/views/approval/ApprovalStatus.vue') },
      {
        path: 'box',
        name: 'approval-box-container',
        children: [
          { path: '', name: 'approval-box', component: () => import('@/views/approval/ApprovalBox.vue') },
          { path: ':type', name: 'approval-box-list', component: () => import('@/views/approval/ApprovalBoxList.vue') }
        ]
      },
      { path: 'review', name: 'approval-review', component: () => import('@/views/approval/ApprovalReview.vue') }
    ]
  },
  {
    path: '/hr',
    name: 'hr',
    redirect: '/hr/my',
    meta: { requiresAuth: true }
  },
  {
    path: '/hr/my',
    name: 'mypage',
    component: () => import('@/views/hr/MyPage.vue'),
    meta: { requiresAuth: true, section: 'hr' }
  },
  {
    path: '/hr/org',
    name: 'hr-org',
    component: () => import('@/views/hr/OrgTeamView.vue'),
    meta: { requiresAuth: true, section: 'hr' }
  },
  {
    path: '/hr/orgchart',
    name: 'hr-orgchart',
    component: () => import('@/views/hr/OrgChartView.vue'),
    meta: { requiresAuth: true, section: 'hr' }
  },
  {
    path: '/hr/team-member/:employeeId/attendance',
    name: 'hr-member-attendance',
    component: () => import('@/views/hr/MemberAttendanceView.vue'),
    meta: { requiresAuth: true, section: 'hr' }
  },
  {
    path: '/hr/team-member/:employeeId/goal',
    name: 'hr-member-goal',
    component: () => import('@/views/hr/MemberGoalView.vue'),
    meta: { requiresAuth: true, section: 'hr' }
  },
  // 인사 상세 하위 경로가 아직 없을 때 빈 화면 대신 마이페이지로 안전 리다이렉트
  {
    path: '/hr/:pathMatch(.*)*',
    redirect: '/hr/my',
    meta: { requiresAuth: true }
  },
  {
    path: '/performance',
    redirect: '/performance/dashboard',
    meta: { requiresAuth: true }
  },
  {
    path: '/performance/:page',
    name: 'performance',
    meta: { requiresAuth: true },
    component: () => import('@/views/performance/Performance.vue')
  },
  {
    path: '/attendance',
    name: 'attendance',
    redirect: '/attendance/my',
    component: () => import('@/views/attendance/AttendanceLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'my', name: 'attendance-main', component: () => import('@/views/attendance/AttendanceMain.vue') },
      { path: 'record', name: 'attendance-record', component: () => import('@/views/attendance/AttendanceRecord.vue') },
      { path: 'request', name: 'attendance-request', component: () => import('@/views/attendance/AttendanceMain.vue') }, // Placeholder
      { path: 'history', name: 'attendance-history', component: () => import('@/views/attendance/AttendanceHistory.vue') },
      { path: 'schedule', name: 'attendance-schedule', component: () => import('@/views/attendance/AttendanceSchedule.vue') },
      { path: 'vacation', name: 'attendance-vacation', component: () => import('@/views/attendance/AttendanceVacation.vue') },
      { path: 'team', name: 'attendance-team', component: () => import('@/views/attendance/AttendanceTeamManage.vue') },
      { path: 'manage', name: 'attendance-manage', component: () => import('@/views/attendance/AttendanceManage.vue') },
      { path: 'flexible', name: 'attendance-flexible', component: () => import('@/views/attendance/FlexibleWorkManage.vue') },
    ]
  },
  {
    path: '/salary',
    name: 'salary',
    redirect: '/salary/my',
    component: () => import('@/views/salary/SalaryLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'my', component: () => import('@/views/salary/SalaryMain.vue') },
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = sessionStorage.getItem(AUTH_KEYS.loggedIn) === 'true'
  let allowedViewCodes = []
  try {
    allowedViewCodes = JSON.parse(sessionStorage.getItem(AUTH_KEYS.allowedViewCodes) || '[]')
  } catch (_error) {
    allowedViewCodes = []
  }
  const allowedSet = new Set(Array.isArray(allowedViewCodes) ? allowedViewCodes : [])
  const targetViewCode = getViewCodeByRouteName(to.name)
  const firstAllowedRouteName = getFirstAllowedRouteName(allowedViewCodes)
  const fallbackPath = firstAllowedRouteName ? { name: firstAllowedRouteName } : '/'

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else if (to.meta.requiresAdmin && !isAdminRole()) {
    next(fallbackPath)
  } else if (to.meta.requiresAuth && targetViewCode && !allowedSet.has(targetViewCode)) {
    next(fallbackPath)
  } else if (to.path === '/login' && isLoggedIn) {
    next(fallbackPath)
  } else {
    next()
  }
})

export default router
