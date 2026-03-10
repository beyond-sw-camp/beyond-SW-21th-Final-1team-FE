import { USER_ROLES } from '@/utils/auth'

export const kmsCategories = [
  { key: 'dev', name: '개발', restricted: false },
  { key: 'hr', name: '인사', restricted: false },
  { key: 'general', name: '총무', restricted: false },
  { key: 'finance', name: '재무', restricted: true },
  { key: 'security', name: '보안', restricted: true },
]

export const manuals = [
  { id: 101, title: 'Vue 프론트엔드 배포 가이드', category: 'dev', author: '김도윤', createdAt: '2026-02-13', updatedAt: '2026-02-15', version: 'V2.1', summary: 'Vite 기반 프론트엔드 배포 절차와 점검 항목', body: '배포 전 .env 검증, 빌드, 스테이징 검수, 운영 배포 순서로 진행합니다.' },
  { id: 102, title: '신규 입사자 온보딩 체크리스트', category: 'hr', author: '이하늘', createdAt: '2026-02-12', updatedAt: '2026-02-12', version: 'V1.4', summary: '입사 전 계정 발급부터 2주 온보딩 운영 절차', body: '입사 D-3 계정 발급, 입사일 장비 지급, 1주차 교육, 2주차 피드백을 포함합니다.' },
  { id: 103, title: '법인카드 정산 처리 기준', category: 'general', author: '박세진', createdAt: '2026-02-11', updatedAt: '2026-02-11', version: 'V1.2', summary: '법인카드 사용 및 정산 반려 기준 정리', body: '영수증 첨부 누락 시 반려되며, 결제일 기준 7일 내 정산해야 합니다.' },
  { id: 104, title: '로그 모니터링 알람 대응 가이드', category: 'dev', author: '정유진', createdAt: '2026-02-10', updatedAt: '2026-02-10', version: 'V1.8', summary: '에러 레벨별 대응 순서 및 장애 티켓 연결 규칙', body: 'Critical 알람은 10분 내 1차 대응하고 장애 티켓을 필수 발행합니다.' },
  { id: 105, title: '연차 촉진 절차 안내', category: 'hr', author: '오민석', createdAt: '2026-02-09', updatedAt: '2026-02-09', version: 'V1.0', summary: '연차 촉진 공지, 대상자 추출, 이력 보관 절차', body: '반기별로 미사용 연차 보유자를 추출하여 촉진 공지를 발송합니다.' },
  { id: 106, title: '회의실 예약 운영 정책', category: 'general', author: '최서연', createdAt: '2026-02-08', updatedAt: '2026-02-08', version: 'V1.3', summary: '회의실 예약 우선순위 및 취소 정책', body: '30분 이상 무단 미사용 시 자동 취소되며 반복 예약은 월 단위 승인합니다.' },
  { id: 107, title: '백엔드 API 장애 공지 템플릿', category: 'dev', author: '김태훈', createdAt: '2026-02-07', updatedAt: '2026-02-07', version: 'V1.6', summary: '장애 공지 작성 표준 템플릿', body: '장애 영향 범위, 임시 조치, 복구 예상 시간을 반드시 포함해야 합니다.' },
  { id: 108, title: '인사평가 이의신청 처리 흐름', category: 'hr', author: '한지민', createdAt: '2026-02-06', updatedAt: '2026-02-06', version: 'V1.1', summary: '평가 이의 접수부터 위원회 검토까지의 처리 절차', body: '접수 후 3영업일 이내 사실 확인을 시작하며 결과는 서면으로 통보합니다.' },
  { id: 109, title: '비품 구매 승인 매트릭스', category: 'general', author: '정소라', createdAt: '2026-02-05', updatedAt: '2026-02-05', version: 'V2.0', summary: '구매 금액 구간별 승인 권한 매트릭스', body: '200만원 이상 구매는 부서장+재무팀 이중 승인 대상입니다.' },
  { id: 110, title: '개인정보 반출 승인 절차', category: 'security', author: '윤성호', createdAt: '2026-02-04', updatedAt: '2026-02-04', version: 'V3.0', summary: '개인정보 반출 요청 및 승인 절차', body: '개인정보 반출은 최소 권한 원칙 기반으로 사전 승인 후 수행합니다.' },
  { id: 111, title: '월 마감 비용 계정 처리 규칙', category: 'finance', author: '신혜원', createdAt: '2026-02-03', updatedAt: '2026-02-03', version: 'V2.4', summary: '월 마감 시 계정 대체 기준과 검증 순서', body: '마감 전 비용 계정 잔액 검토, 전표 증빙 확인, 결산 체크리스트 점검이 필요합니다.' },
  { id: 112, title: '프론트 배포 점검표(내 문서)', category: 'dev', author: '테스트 사용자', createdAt: '2026-02-16', updatedAt: '2026-02-18', version: 'V1.3', summary: '배포 전후 점검 항목을 체크리스트 형태로 정리', body: '배포 전 의존성 검증, 환경변수 체크, 배포 후 모니터링 확인 절차를 포함합니다.' },
  { id: 113, title: '인수인계 문서 작성 가이드(내 문서)', category: 'general', author: '테스트 사용자', createdAt: '2026-02-14', updatedAt: '2026-02-17', version: 'V1.1', summary: '인수인계 문서 템플릿과 필수 섹션 작성 기준', body: '업무 범위, 현재 이슈, 담당자 연락처, 일정 리스크를 반드시 포함합니다.' },
  { id: 114, title: '임시 삭제된 메뉴얼 샘플 A', category: 'hr', author: '테스트 사용자', createdAt: '2026-02-10', updatedAt: '2026-02-12', version: 'V1.2', summary: '휴지통 UI 확인용 샘플 데이터 A', body: '임시 보관함 동작 검증용 본문입니다.', isDeleted: true, deletedAt: '2026-02-19', deletedBy: '테스트 사용자' },
  { id: 115, title: '임시 삭제된 메뉴얼 샘플 B', category: 'dev', author: '테스트 사용자', createdAt: '2026-02-09', updatedAt: '2026-02-11', version: 'V1.0', summary: '휴지통 UI 확인용 샘플 데이터 B', body: '삭제 문서 복원 기능 테스트용 본문입니다.', isDeleted: true, deletedAt: '2026-02-20', deletedBy: '테스트 사용자' },
]

export const archiveDocuments = [
  {
    id: 901,
    team: '모바일1팀',
    org: '기술연구소',
    category: '회의록',
    title: '2월 2주차 스프린트 회고',
    createdAt: '2026-02-14',
    owner: '김도윤',
    summary: '배포 지연 원인 및 스프린트 개선안 논의',
    body: '이번 스프린트에서 API 응답 지연으로 배포가 하루 지연되었습니다. 원인 분석과 재발 방지 항목을 정리했습니다.',
    attachments: [
      { name: 'sprint-retro-2026-02-14.pdf', size: '1.2MB' },
      { name: 'action-items.xlsx', size: '248KB' },
    ],
    allowDownload: true,
    allowedScopes: ['기술연구소', '모바일1팀'],
    allowedUserIds: ['admin1234']
  },
  {
    id: 902,
    team: '모바일1팀',
    org: '기술연구소',
    category: '지식문서',
    title: '디자인 시스템 운영회의',
    createdAt: '2026-02-13',
    owner: '정유진',
    summary: '컴포넌트 표준화와 릴리즈 정책 합의',
    body: '컴포넌트 네이밍 규칙, 버전 정책, 리뷰 기준을 통합했습니다.',
    attachments: [{ name: 'design-system-guideline-v3.pdf', size: '940KB' }],
    allowDownload: true,
    allowedScopes: ['기술연구소', '모바일1팀'],
    allowedUserIds: []
  },
  {
    id: 903,
    team: '개발1팀',
    org: '기술연구소',
    category: '회의록',
    title: '접근성 품질 점검 회의',
    createdAt: '2026-02-12',
    owner: '최서연',
    summary: 'WCAG 기준 미흡 항목 정리 및 일정 확정',
    body: '대체 텍스트 누락, 키보드 접근성 이슈를 정리하고 개선 일정을 합의했습니다.',
    attachments: [{ name: 'a11y-checklist.docx', size: '312KB' }],
    allowDownload: false,
    allowedScopes: ['기술연구소', '개발1팀'],
    allowedUserIds: ['admin1234']
  },
  {
    id: 904,
    team: '개발2팀',
    org: '기술연구소',
    category: '지식문서',
    title: 'Q1 목표 재정렬 미팅',
    createdAt: '2026-02-11',
    owner: '김태훈',
    summary: '성과지표 재설정 및 리소스 재배분',
    body: '핵심지표를 기능 출시 수에서 사용자 체류시간 중심으로 변경했습니다.',
    attachments: [{ name: 'q1-kpi-alignment.pptx', size: '2.1MB' }],
    allowDownload: true,
    allowedScopes: ['기술연구소', '개발2팀'],
    allowedUserIds: []
  },
  {
    id: 905,
    team: '인사팀',
    org: '경영지원본부',
    category: '회의록',
    title: '인사 운영 정기회의',
    createdAt: '2026-02-10',
    owner: '박세진',
    summary: '채용 프로세스 개선 및 평가 일정 공유',
    body: '채용 단계별 SLA를 재정의하고 평가 일정 변경사항을 공유했습니다.',
    attachments: [{ name: 'hr-weekly-minutes.pdf', size: '540KB' }],
    allowDownload: true,
    allowedScopes: ['경영지원본부', '인사팀'],
    allowedUserIds: []
  },
  {
    id: 906,
    team: '영업1팀',
    org: '영업본부',
    category: '지식문서',
    title: 'B2B 제안서 작성 기준',
    createdAt: '2026-02-09',
    owner: '한지민',
    summary: '영업 제안서 작성 표준 템플릿',
    body: '제안서 필수 섹션과 가격 정책 기재 방식을 표준화했습니다.',
    attachments: [{ name: 'b2b-proposal-template.docx', size: '180KB' }],
    allowDownload: true,
    allowedScopes: ['영업본부', '영업1팀'],
    allowedUserIds: []
  },
  {
    id: 907,
    team: '모바일1팀',
    org: '기술연구소',
    category: '지식문서',
    title: '코드리뷰 가이드 정비',
    createdAt: '2026-02-08',
    owner: '윤성호',
    summary: '리뷰 SLA와 필수 체크리스트 수립',
    body: '코드리뷰 응답시간 SLA를 정의하고 리뷰 템플릿을 통일했습니다.',
    attachments: [{ name: 'code-review-template.md', size: '34KB' }],
    allowDownload: true,
    allowedScopes: ['기술연구소', '모바일1팀', '개발1팀', '개발2팀'],
    allowedUserIds: []
  },
  {
    id: 908,
    team: '모바일1팀',
    org: '기술연구소',
    category: '회의록',
    title: '릴리즈 캘린더 운영회의',
    createdAt: '2026-02-07',
    owner: '신혜원',
    summary: '정기 배포 주기 조정 및 공지 프로세스',
    body: '주간 배포에서 격주 배포로 전환하고 공지 템플릿을 통일합니다.',
    attachments: [{ name: 'release-calendar-2026Q1.xlsx', size: '420KB' }],
    allowDownload: true,
    allowedScopes: ['기술연구소', '모바일1팀'],
    allowedUserIds: []
  },
  {
    id: 909,
    team: '모바일1팀',
    org: '기술연구소',
    category: '회의록',
    title: '신입 멘토링 회의',
    createdAt: '2026-02-06',
    owner: '이하늘',
    summary: '온보딩 개선 피드백 공유',
    body: '멘토링 주차별 체크리스트와 피드백 문항을 개선했습니다.',
    attachments: [{ name: 'mentoring-feedback-form.pdf', size: '270KB' }],
    allowDownload: true,
    allowedScopes: ['기술연구소', '모바일1팀'],
    allowedUserIds: []
  },
  {
    id: 910,
    team: '모바일1팀',
    org: '기술연구소',
    category: '회의록',
    title: '장애 대응 리허설 회의',
    createdAt: '2026-02-05',
    owner: '오민석',
    summary: '비상대응 역할 분장 및 훈련 계획',
    body: '장애 대응 단계별 커뮤니케이션 채널과 역할을 재정의했습니다.',
    attachments: [{ name: 'incident-playbook-v2.pdf', size: '1.0MB' }],
    allowDownload: true,
    allowedScopes: ['기술연구소', '모바일1팀'],
    allowedUserIds: []
  },
  {
    id: 911,
    team: '플랫폼팀',
    org: '기술연구소',
    category: '지식문서',
    title: 'DB 이중화 운영 점검',
    createdAt: '2026-02-04',
    owner: '조민재',
    summary: '장애 복구 시나리오 테스트 결과',
    body: '주요 장애 시나리오 테스트 결과와 복구 체크리스트를 공유합니다.',
    attachments: [{ name: 'db-drill-result.pdf', size: '620KB' }],
    allowDownload: false,
    allowedScopes: ['기술연구소', '플랫폼팀'],
    allowedUserIds: ['admin1234']
  },
  {
    id: 912,
    team: '모바일1팀',
    org: '기술연구소',
    category: '회의록',
    title: '모바일1팀 주간 스크럼(테스트 계정 샘플)',
    createdAt: '2026-02-16',
    owner: '김봉식 팀장',
    ownerUserId: 'test1234',
    summary: '금주 이슈 공유 및 우선순위 조정',
    body: '신규 기능 일정과 버그 수정 우선순위를 재조정하고 담당자를 확정했습니다.',
    attachments: [
      { name: 'weekly-scrum-2026-02-16.pdf', size: '510KB' },
      { name: 'sprint-backlog-20260216.xlsx', size: '180KB' }
    ],
    allowDownload: true,
    allowedScopes: ['기술연구소', '모바일1팀'],
    allowedUserIds: ['test1234']
  },
  {
    id: 913,
    team: '모바일1팀',
    org: '기술연구소',
    category: '회의록',
    title: '앱 성능 개선 회의록',
    createdAt: '2026-02-15',
    owner: '김봉식 팀장',
    ownerUserId: 'test1234',
    summary: '렌더링 지연 구간 분석 및 개선안 확정',
    body: '초기 로딩 구간 성능 병목을 확인했고 이미지 최적화와 lazy-load 적용 범위를 합의했습니다.',
    attachments: [
      { name: 'app-performance-minutes.pdf', size: '640KB' }
    ],
    allowDownload: true,
    allowedScopes: ['기술연구소', '모바일1팀'],
    allowedUserIds: []
  },
  {
    id: 914,
    team: '모바일1팀',
    org: '기술연구소',
    category: '회의록',
    title: '장애 대응 회고(테스트 계정 전용)',
    createdAt: '2026-02-14',
    owner: '김봉식 팀장',
    ownerUserId: 'test1234',
    summary: '장애 탐지부터 공지까지 대응 흐름 회고',
    body: '알림 탐지 시간, 1차 대응, 사용자 공지 타이밍을 점검하고 개선 체크리스트를 정리했습니다.',
    attachments: [
      { name: 'incident-retro-20260214.docx', size: '220KB' }
    ],
    allowDownload: true,
    allowedScopes: ['기술연구소'],
    allowedUserIds: ['test1234']
  },
  {
    id: 915,
    team: '모바일1팀',
    org: '기술연구소',
    category: '회의록',
    title: '임시 보관 회의록 샘플 A',
    createdAt: '2026-02-13',
    owner: '김봉식 팀장',
    ownerUserId: 'test1234',
    summary: '아카이브 휴지통 UX 검증용 샘플 A',
    body: '휴지통 복원/영구삭제 버튼 시연용 회의록 본문입니다.',
    attachments: [{ name: 'archive-trash-a.pdf', size: '320KB' }],
    allowDownload: true,
    allowedScopes: ['기술연구소', '모바일1팀'],
    allowedUserIds: ['test1234'],
    isDeleted: true,
    deletedAt: '2026-02-20',
    deletedBy: '김봉식 팀장'
  },
  {
    id: 916,
    team: '모바일1팀',
    org: '기술연구소',
    category: '회의록',
    title: '임시 보관 회의록 샘플 B',
    createdAt: '2026-02-12',
    owner: '김봉식 팀장',
    ownerUserId: 'test1234',
    summary: '아카이브 휴지통 UX 검증용 샘플 B',
    body: '읽기 권한 이력 화면과 함께 데모할 삭제 문서입니다.',
    attachments: [{ name: 'archive-trash-b.docx', size: '140KB' }],
    allowDownload: true,
    allowedScopes: ['기술연구소', '모바일1팀'],
    allowedUserIds: ['test1234'],
    isDeleted: true,
    deletedAt: '2026-02-19',
    deletedBy: '김봉식 팀장'
  },
]

export const meetingArchives = archiveDocuments.map((doc) => ({
  id: doc.id,
  team: doc.team,
  title: doc.title,
  createdAt: doc.createdAt,
  owner: doc.owner,
  summary: doc.summary
}))

export const archiveCategoryOptions = ['전체', '회의록', '지식문서']

export const manualVersionHistories = {
  101: [
    { version: 'V2.1', type: 'minor', editor: '김도윤', updatedAt: '2026-02-15', notes: '배포 체크리스트 보강', body: '배포 전 .env 검증, 빌드, 스테이징 검수, 운영 배포 순서로 진행합니다. 배포 직후 캐시 무효화와 에러 모니터링 확인을 추가했습니다.' },
    { version: 'V2.0', type: 'major', editor: '김도윤', updatedAt: '2026-01-30', notes: '배포 전략 전면 개편', body: '배포 절차를 블루/그린 기준으로 재정의했습니다. 스테이징 승인 절차와 롤백 체크리스트를 신규 추가했습니다.' },
    { version: 'V1.4', type: 'minor', editor: '정유진', updatedAt: '2025-12-18', notes: '검수 항목 세부화', body: '배포 전 필수 검수 항목을 품질/보안/성능 기준으로 세분화했습니다.' },
  ],
  102: [
    { version: 'V1.4', type: 'minor', editor: '이하늘', updatedAt: '2026-02-12', notes: '2주차 온보딩 피드백 항목 추가', body: '입사 D-3 계정 발급, 입사일 장비 지급, 1주차 교육, 2주차 피드백을 포함합니다. 2주차 피드백 문항을 최신화했습니다.' },
    { version: 'V1.3', type: 'minor', editor: '이하늘', updatedAt: '2026-01-24', notes: '장비 지급 체크리스트 업데이트', body: '입사 전 계정 발급, 장비 지급 체크리스트, 부서별 온보딩 안내를 포함합니다.' },
    { version: 'V1.0', type: 'major', editor: '이하늘', updatedAt: '2025-12-20', notes: '초기 온보딩 체크리스트 등록', body: '온보딩 시작용 기본 체크리스트 초안입니다.' },
  ],
  103: [
    { version: 'V1.2', type: 'minor', editor: '박세진', updatedAt: '2026-02-11', notes: '정산 반려 기준 사례 보강' },
    { version: 'V1.0', type: 'major', editor: '박세진', updatedAt: '2026-01-08', notes: '법인카드 정산 기준 문서 초안' },
  ],
  104: [
    { version: 'V1.8', type: 'minor', editor: '정유진', updatedAt: '2026-02-10', notes: 'Critical 알람 대응 SLA 반영' },
    { version: 'V1.5', type: 'minor', editor: '정유진', updatedAt: '2026-01-11', notes: '알람 티켓 템플릿 정리' },
  ],
  105: [
    { version: 'V1.0', type: 'major', editor: '오민석', updatedAt: '2026-02-09', notes: '연차 촉진 절차 신규 등록' },
  ],
  106: [
    { version: 'V1.3', type: 'minor', editor: '최서연', updatedAt: '2026-02-08', notes: '반복 예약 승인 기준 명시' },
    { version: 'V1.1', type: 'minor', editor: '최서연', updatedAt: '2026-01-19', notes: '무단 미사용 자동 취소 규정 추가' },
  ],
  107: [
    { version: 'V1.6', type: 'minor', editor: '김태훈', updatedAt: '2026-02-07', notes: '복구 예상 시간 작성 예시 보완' },
    { version: 'V1.0', type: 'major', editor: '김태훈', updatedAt: '2025-12-29', notes: '장애 공지 템플릿 최초 작성' },
  ],
  108: [
    { version: 'V1.1', type: 'minor', editor: '한지민', updatedAt: '2026-02-06', notes: '서면 통보 문안 템플릿 추가' },
    { version: 'V1.0', type: 'major', editor: '한지민', updatedAt: '2025-11-21', notes: '이의신청 처리 흐름 초안 등록' },
  ],
  109: [
    { version: 'V2.0', type: 'major', editor: '정소라', updatedAt: '2026-02-05', notes: '승인 매트릭스 금액 구간 개편' },
    { version: 'V1.5', type: 'minor', editor: '정소라', updatedAt: '2025-12-15', notes: '재무 승인 기준 예외 조항 반영' },
  ],
  110: [
    { version: 'V3.0', type: 'major', editor: '윤성호', updatedAt: '2026-02-04', notes: '개인정보 반출 승인 단계 강화' },
    { version: 'V2.2', type: 'minor', editor: '윤성호', updatedAt: '2025-12-03', notes: '반출 로그 보관 기간 업데이트' },
  ],
  111: [
    { version: 'V2.4', type: 'minor', editor: '신혜원', updatedAt: '2026-02-03', notes: '결산 체크리스트 검증 순서 보강' },
    { version: 'V2.0', type: 'major', editor: '신혜원', updatedAt: '2025-11-30', notes: '월 마감 계정 처리 규칙 개편' },
  ],
}

export const getManualVersionHistory = (manualId) => manualVersionHistories[String(manualId)] || []

export const canReadManual = (manual, role = USER_ROLES.user) => {
  if (!manual) return false
  const category = kmsCategories.find((item) => item.key === manual.category)
  if (!category?.restricted) return true
  return role === USER_ROLES.admin
}

export const permissionTargets = {
  read: ['프론트엔드팀', '플랫폼팀', '김도윤'],
  edit: ['프론트엔드팀 리더', '김도윤'],
  delete: ['관리자', '김도윤'],
}

export const sortByDateDesc = (rows, dateKey = 'createdAt') => {
  return [...rows].sort((a, b) => new Date(b[dateKey]).getTime() - new Date(a[dateKey]).getTime())
}

export const archiveVersionHistories = {
  912: [
    { version: 'V1.2', type: 'minor', editor: '김봉식 팀장', updatedAt: '2026-02-17', notes: '우선순위 재조정 내용 보강', body: '신규 기능 일정과 버그 수정 우선순위를 재조정하고 담당자를 확정했습니다. 위험 항목 추적 규칙을 추가했습니다.' },
    { version: 'V1.1', type: 'minor', editor: '김봉식 팀장', updatedAt: '2026-02-16', notes: '회의 액션아이템 정리', body: '신규 기능 일정과 버그 수정 우선순위를 재조정하고 담당자를 확정했습니다.' },
    { version: 'V1.0', type: 'major', editor: '김봉식 팀장', updatedAt: '2026-02-15', notes: '초안 등록', body: '주간 스크럼 초안 문서입니다.' }
  ],
  913: [
    { version: 'V1.1', type: 'minor', editor: '김봉식 팀장', updatedAt: '2026-02-15', notes: '개선 범위 확정', body: '초기 로딩 구간 성능 병목을 확인했고 이미지 최적화와 lazy-load 적용 범위를 합의했습니다.' },
    { version: 'V1.0', type: 'major', editor: '김봉식 팀장', updatedAt: '2026-02-14', notes: '회의록 신규 등록', body: '앱 성능 개선 회의 초안입니다.' }
  ],
  914: [
    { version: 'V1.0', type: 'major', editor: '김봉식 팀장', updatedAt: '2026-02-14', notes: '장애 대응 회고 등록', body: '알림 탐지 시간, 1차 대응, 사용자 공지 타이밍을 점검하고 개선 체크리스트를 정리했습니다.' }
  ]
}

export const getArchiveVersionHistory = (archiveId) => archiveVersionHistories[String(archiveId)] || []

export const permissionChangeTimeline = [
  { id: 'perm-001', module: 'manual', docId: 101, title: 'Vue 프론트엔드 배포 가이드', changedAt: '2026-02-18 10:24', actor: '김봉식 팀장', change: '열람 권한에 모바일1팀 추가', before: '기술연구소', after: '기술연구소, 모바일1팀' },
  { id: 'perm-002', module: 'archive', docId: 912, title: '모바일1팀 주간 스크럼(테스트 계정 샘플)', changedAt: '2026-02-18 11:03', actor: '김봉식 팀장', change: '특정 사용자 권한 추가', before: '모바일1팀', after: '모바일1팀 + test1234' },
  { id: 'perm-003', module: 'archive', docId: 913, title: '앱 성능 개선 회의록', changedAt: '2026-02-19 09:42', actor: '김봉식 팀장', change: '열람 권한에서 개발2팀 제외', before: '모바일1팀, 개발2팀', after: '모바일1팀' },
  { id: 'perm-004', module: 'manual', docId: 112, title: '프론트 배포 점검표(내 문서)', changedAt: '2026-02-19 16:10', actor: '김봉식 팀장', change: '삭제 권한을 관리자 전용으로 변경', before: '모바일1팀 리더', after: '관리자' },
]
