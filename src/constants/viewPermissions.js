import { ADMIN_ROLE_CODES } from '@/utils/auth'

export const VIEW_PERMISSION_MAP = {
  'admin-main': ADMIN_ROLE_CODES,
  'admin-employees': ADMIN_ROLE_CODES,
  'admin-hr-change': ADMIN_ROLE_CODES,
  'admin-policies': ADMIN_ROLE_CODES,
  'admin-kms-permissions-history': ADMIN_ROLE_CODES,
  'admin-notices': ADMIN_ROLE_CODES,
  'admin-attendance': ADMIN_ROLE_CODES,
  'admin-salary': ADMIN_ROLE_CODES,
  'kms-permission-history': ADMIN_ROLE_CODES,
}

export const VIEW_CATALOG = [
  { viewCode: 'LOGIN', routeName: 'login', viewName: '로그인', viewDesc: '로그인 화면' },
  { viewCode: 'MAIN', routeName: 'main', viewName: '메인 대시보드', viewDesc: '메인 화면' },
  { viewCode: 'NOTICE_LIST', routeName: 'notice-list', viewName: '공지사항', viewDesc: '공지사항 목록' },
  { viewCode: 'ADMIN_MAIN', routeName: 'admin-main', viewName: '관리자 메인', viewDesc: '관리자 대시보드' },
  { viewCode: 'ADMIN_EMPLOYEES', routeName: 'admin-employees', viewName: '사원 관리', viewDesc: '관리자 사원 관리 화면' },
  { viewCode: 'ADMIN_HR_CHANGE', routeName: 'admin-hr-change', viewName: '인사변동 관리', viewDesc: '관리자 인사변동 화면' },
  { viewCode: 'ADMIN_POLICIES', routeName: 'admin-policies', viewName: '규정 관리', viewDesc: '관리자 규정 화면' },
  { viewCode: 'ADMIN_KMS_PERMISSION_HISTORY', routeName: 'admin-kms-permissions-history', viewName: 'KMS 권한 이력(관리자)', viewDesc: '관리자 KMS 권한 이력 화면' },
  { viewCode: 'ADMIN_NOTICES', routeName: 'admin-notices', viewName: '공지 관리', viewDesc: '관리자 공지사항 관리 화면' },
  { viewCode: 'ADMIN_ATTENDANCE', routeName: 'admin-attendance', viewName: '근태 관리(관리자)', viewDesc: '관리자 근태 화면' },
  { viewCode: 'ADMIN_SALARY', routeName: 'admin-salary', viewName: '급여 관리(관리자)', viewDesc: '관리자 급여 화면' },
  { viewCode: 'APPROVAL_MAIN', routeName: 'approval-main', viewName: '전자결재 메인', viewDesc: '전자결재 메인 화면' },
  { viewCode: 'APPROVAL_DRAFT', routeName: 'approval-draft', viewName: '결재 작성', viewDesc: '전자결재 작성 화면' },
  { viewCode: 'APPROVAL_STATUS', routeName: 'approval-status', viewName: '결재 상태', viewDesc: '전자결재 상태 화면' },
  { viewCode: 'APPROVAL_BOX', routeName: 'approval-box', viewName: '결재함', viewDesc: '전자결재 결재함 화면' },
  { viewCode: 'APPROVAL_BOX_LIST', routeName: 'approval-box-list', viewName: '결재함 목록', viewDesc: '전자결재 결재함 상세 목록 화면' },
  { viewCode: null, routeName: 'approval-review', viewName: '결재 검토', viewDesc: '전자결재 검토 화면' },
  { viewCode: 'HR_MYPAGE', routeName: 'mypage', viewName: '인사 마이페이지', viewDesc: '인사 개인 정보 화면' },
  { viewCode: 'HR_ORG', routeName: 'hr-org', viewName: '조직/팀 조회', viewDesc: '인사 조직/팀 화면' },
  { viewCode: 'HR_ORGCHART', routeName: 'hr-orgchart', viewName: '조직도', viewDesc: '인사 조직도 화면' },
  { viewCode: 'HR_MEMBER_ATTENDANCE', routeName: 'hr-member-attendance', viewName: '팀원 근태', viewDesc: '팀원 근태 조회 화면' },
  { viewCode: 'HR_MEMBER_GOAL', routeName: 'hr-member-goal', viewName: '팀원 목표', viewDesc: '팀원 목표 조회 화면' },
  { viewCode: 'PERFORMANCE', routeName: 'performance', viewName: '성과관리', viewDesc: '성과관리 화면' },
  { viewCode: 'KMS_MAIN', routeName: 'kms-main', viewName: 'KMS 메인', viewDesc: 'KMS 메인 화면' },
  { viewCode: 'KMS_SEARCH', routeName: 'kms-search', viewName: 'KMS 검색', viewDesc: 'KMS 검색 화면' },
  { viewCode: 'KMS_PERMISSION_HISTORY', routeName: 'kms-permission-history', viewName: 'KMS 권한 이력', viewDesc: 'KMS 권한 이력 화면' },
  { viewCode: 'KMS_MANUALS', routeName: 'kms-manuals', viewName: 'KMS 매뉴얼 대시보드', viewDesc: 'KMS 매뉴얼 대시보드 화면' },
  { viewCode: 'KMS_MANUALS_MY', routeName: 'kms-manuals-my', viewName: '내 매뉴얼', viewDesc: 'KMS 내 매뉴얼 화면' },
  { viewCode: 'KMS_MANUALS_TRASH', routeName: 'kms-manuals-trash', viewName: '매뉴얼 휴지통', viewDesc: 'KMS 매뉴얼 휴지통 화면' },
  { viewCode: 'KMS_MANUAL_CATEGORY', routeName: 'kms-manual-category', viewName: '카테고리별 매뉴얼', viewDesc: 'KMS 카테고리 매뉴얼 화면' },
  { viewCode: 'KMS_MANUAL_DETAIL', routeName: 'kms-manual-detail', viewName: '매뉴얼 상세', viewDesc: 'KMS 매뉴얼 상세 화면' },
  { viewCode: 'KMS_MANUAL_HISTORY', routeName: 'kms-manual-history', viewName: '매뉴얼 이력', viewDesc: 'KMS 매뉴얼 이력 화면' },
  { viewCode: 'KMS_MANUAL_UPLOAD', routeName: 'kms-manual-upload', viewName: '매뉴얼 업로드', viewDesc: 'KMS 매뉴얼 업로드 화면' },
  { viewCode: 'KMS_MANUAL_EDIT', routeName: 'kms-manual-edit', viewName: '매뉴얼 수정', viewDesc: 'KMS 매뉴얼 수정 화면' },
  { viewCode: 'KMS_ARCHIVE', routeName: 'kms-archive', viewName: '자료 아카이브', viewDesc: 'KMS 자료 아카이브 화면' },
  { viewCode: 'KMS_ARCHIVE_MY', routeName: 'kms-archive-my', viewName: '내 아카이브', viewDesc: 'KMS 내 아카이브 화면' },
  { viewCode: 'KMS_ARCHIVE_TRASH', routeName: 'kms-archive-trash', viewName: '아카이브 휴지통', viewDesc: 'KMS 아카이브 휴지통 화면' },
  { viewCode: 'KMS_ARCHIVE_HISTORY', routeName: 'kms-archive-history', viewName: '아카이브 이력', viewDesc: 'KMS 아카이브 이력 화면' },
  { viewCode: 'KMS_ARCHIVE_MANAGE', routeName: 'kms-archive-manage', viewName: '아카이브 관리', viewDesc: 'KMS 아카이브 관리 화면' },
  { viewCode: 'KMS_ARCHIVE_DETAIL', routeName: 'kms-archive-detail', viewName: '아카이브 상세', viewDesc: 'KMS 아카이브 상세 화면' },
  { viewCode: 'KMS_DOC_COMPARE', routeName: 'kms-doc-compare', viewName: '문서 비교', viewDesc: 'KMS 문서 비교 화면' },
  { viewCode: 'ATTENDANCE_MAIN', routeName: 'attendance-main', viewName: '근태 메인', viewDesc: '근태 메인 화면' },
  { viewCode: 'ATTENDANCE_RECORD', routeName: 'attendance-record', viewName: '출퇴근 기록', viewDesc: '근태 기록 화면' },
  { viewCode: 'ATTENDANCE_REQUEST', routeName: 'attendance-request', viewName: '근태 신청', viewDesc: '근태 신청 화면' },
  { viewCode: 'ATTENDANCE_HISTORY', routeName: 'attendance-history', viewName: '근태 이력', viewDesc: '근태 이력 화면' },
  { viewCode: 'ATTENDANCE_SCHEDULE', routeName: 'attendance-schedule', viewName: '근무 일정', viewDesc: '근무 일정 화면' },
  { viewCode: 'ATTENDANCE_VACATION', routeName: 'attendance-vacation', viewName: '휴가 관리', viewDesc: '휴가 관리 화면' },
  { viewCode: 'ATTENDANCE_TEAM', routeName: 'attendance-team', viewName: '팀 근태', viewDesc: '팀 근태 화면' },
  { viewCode: 'ATTENDANCE_MANAGE', routeName: 'attendance-manage', viewName: '근태 승인/관리', viewDesc: '근태 승인/관리 화면' },
  { viewCode: 'ATTENDANCE_FLEXIBLE', routeName: 'attendance-flexible', viewName: '유연근무', viewDesc: '유연근무 화면' },
]

export const getRequiredRoleCodesByRouteName = (routeName) => {
  if (!routeName) return []
  return VIEW_PERMISSION_MAP[String(routeName)] || []
}

const ROUTE_VIEW_CODE_MAP = VIEW_CATALOG.reduce((acc, item) => {
  if (item?.routeName && item?.viewCode) {
    acc[String(item.routeName)] = String(item.viewCode)
  }
  return acc
}, {})

export const getViewCodeByRouteName = (routeName) => {
  if (!routeName) return ''
  return ROUTE_VIEW_CODE_MAP[String(routeName)] || ''
}

export const getFirstAllowedRouteName = (allowedViewCodes = []) => {
  const allowedSet = new Set(Array.isArray(allowedViewCodes) ? allowedViewCodes : [])
  const first = VIEW_CATALOG.find(
    (item) => item?.routeName && item.viewCode !== 'LOGIN' && allowedSet.has(item.viewCode)
  )
  return first?.routeName || ''
}
