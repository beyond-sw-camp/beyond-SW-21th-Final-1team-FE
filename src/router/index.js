import { createRouter, createWebHistory } from 'vue-router'
import { AUTH_KEYS, USER_ROLES } from '@/utils/auth'

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
    path: '/admin/kms-permissions-history',
    name: 'admin-kms-permissions-history',
    component: () => import('@/views/kms/KmsPermissionHistoryView.vue'),
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
    path: '/kms',
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'kms-main', component: () => import('@/views/kms/KmsMainView.vue') },
      { path: 'search', name: 'kms-search', component: () => import('@/views/kms/KmsSearchView.vue') },
      { path: 'permissions/history', name: 'kms-permission-history', component: () => import('@/views/kms/KmsPermissionHistoryView.vue'), meta: { requiresAdmin: true } },
      { path: 'manuals', name: 'kms-manuals', component: () => import('@/views/kms/KmsManualDashboardView.vue') },
      { path: 'manuals/my', name: 'kms-manuals-my', component: () => import('@/views/kms/KmsMyManualsView.vue') },
      { path: 'manuals/trash', name: 'kms-manuals-trash', component: () => import('@/views/kms/KmsManualTrashView.vue') },
      { path: 'manuals/category/:categoryKey', name: 'kms-manual-category', component: () => import('@/views/kms/KmsManualCategoryView.vue') },
      { path: 'manuals/detail/:manualId', name: 'kms-manual-detail', component: () => import('@/views/kms/KmsManualDetailView.vue') },
      { path: 'manuals/history/:manualId', name: 'kms-manual-history', component: () => import('@/views/kms/KmsManualHistoryView.vue') },
      { path: 'manuals/upload', name: 'kms-manual-upload', component: () => import('@/views/kms/KmsManualUploadView.vue') },
      { path: 'manuals/edit/:manualId', name: 'kms-manual-edit', component: () => import('@/views/kms/KmsManualEditView.vue') },
      { path: 'archive', name: 'kms-archive', component: () => import('@/views/kms/KmsArchiveView.vue') },
      { path: 'archive/my', name: 'kms-archive-my', component: () => import('@/views/kms/KmsMyArchiveView.vue') },
      { path: 'archive/trash', name: 'kms-archive-trash', component: () => import('@/views/kms/KmsArchiveTrashView.vue') },
      { path: 'archive/history/:archiveId', name: 'kms-archive-history', component: () => import('@/views/kms/KmsArchiveHistoryView.vue') },
      { path: 'archive/manage/:archiveId', name: 'kms-archive-manage', component: () => import('@/views/kms/KmsArchiveManageView.vue') },
      { path: 'archive/:archiveId', name: 'kms-archive-detail', component: () => import('@/views/kms/KmsArchiveDetailView.vue') },
      { path: 'compare/:type/:docId', name: 'kms-doc-compare', component: () => import('@/views/kms/KmsDocumentCompareView.vue') },
    ]
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
  const userRole = sessionStorage.getItem(AUTH_KEYS.role) || USER_ROLES.user

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else if (to.meta.requiresAdmin && userRole !== USER_ROLES.admin) {
    next('/')
  } else if (to.path === '/login' && isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router
