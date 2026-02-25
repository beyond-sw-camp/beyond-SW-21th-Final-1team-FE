export const mockUsers = [
    // 임원
    { id: 'u7', name: '강동원', position: '대표이사', department: '임원실', email: 'kang@example.com', canFinalize: true },
    { id: 'u6', name: '정수진', position: '이사', department: '경영지원본부', email: 'jung@example.com', canFinalize: true },
    { id: 'u13', name: '송혜교', position: '본부장', department: '기술연구소', email: 'song@example.com', canFinalize: true },
    { id: 'u14', name: '현빈', position: '상무', department: '영업본부', email: 'hyun@example.com', canFinalize: true },

    // 경영지원본부 - 인사팀
    { id: 'u1', name: '홍길동', position: '사원', department: '인사팀', email: 'hong@example.com', canFinalize: false },
    { id: 'u2', name: '김철수', position: '대리', department: '인사팀', email: 'kim@example.com', canFinalize: false },
    { id: 'u15', name: '최유진', position: '과장', department: '인사팀', email: 'choi@example.com', canFinalize: true },

    // 경영지원본부 - 마케팅팀
    { id: 'u11', name: '김남준', position: '과장', department: '마케팅팀', email: 'kim2@example.com', canFinalize: true },
    { id: 'u16', name: '박지민', position: '사원', department: '마케팅팀', email: 'park3@example.com', canFinalize: false },

    // 기술연구소 - SW개발센터 - 개발1팀
    { id: 'u3', name: '이영희', position: '과장', department: '개발1팀', email: 'lee@example.com', canFinalize: true },
    { id: 'u4', name: '박민수', position: '차장', department: '개발1팀', email: 'park@example.com', canFinalize: true },
    { id: 'u17', name: '정국', position: '사원', department: '개발1팀', email: 'jk@example.com', canFinalize: false },

    // 기술연구소 - SW개발센터 - 개발2팀
    { id: 'u8', name: '이지아', position: '사원', department: '개발2팀', email: 'lee2@example.com', canFinalize: false },
    { id: 'u9', name: '윤도현', position: '대리', department: '개발2팀', email: 'yoon@example.com', canFinalize: false },
    { id: 'u18', name: '민윤기', position: '과장', department: '개발2팀', email: 'suga@example.com', canFinalize: true },

    // 기술연구소 - 디자인팀
    { id: 'u12', name: '박보검', position: '대리', department: '디자인팀', email: 'park2@example.com', canFinalize: false },
    { id: 'u19', name: '김태형', position: '사원', department: '디자인팀', email: 'v@example.com', canFinalize: false },

    // 영업본부 - 영업1팀
    { id: 'u5', name: '최지훈', position: '부장', department: '영업1팀', email: 'choi@example.com', canFinalize: true },
    { id: 'u20', name: '강석진', position: '차장', department: '영업1팀', email: 'jin@example.com', canFinalize: true },

    // 영업본부 - 영업2팀
    { id: 'u10', name: '한소희', position: '사원', department: '영업2팀', email: 'han@example.com', canFinalize: false },
    { id: 'u21', name: '김제니', position: '대리', department: '영업2팀', email: 'jennie@example.com', canFinalize: false },

    // 추가 인원 (대규모 데이터)
    { id: 'u22', name: '임영웅', position: '과장', department: '영업1팀', email: 'lim@example.com', canFinalize: false },
    { id: 'u23', name: '장원영', position: '사원', department: '인사팀', email: 'jang@example.com', canFinalize: false },
    { id: 'u24', name: '안유진', position: '대리', department: '디자인팀', email: 'ahn@example.com', canFinalize: false },
    { id: 'u25', name: '손흥민', position: '본부장', department: '영업본부', email: 'son@example.com', canFinalize: true },
];

export const orgChart = [
    {
        id: 'd1',
        name: 'RHight Inc.',
        children: [
            {
                id: 'd2',
                name: '경영지원본부',
                children: [
                    { id: 'd3', name: '인사팀', users: ['u1', 'u2', 'u15', 'u23'] },
                    { id: 'd4', name: '총무팀', users: [] },
                    { id: 'd11', name: '마케팅팀', users: ['u11', 'u16'] },
                ],
                users: ['u6'],
            },
            {
                id: 'd5',
                name: '기술연구소',
                children: [
                    {
                        id: 'd12',
                        name: 'SW개발센터',
                        children: [
                            { id: 'd6', name: '개발1팀', users: ['u3', 'u4', 'u17'] },
                            { id: 'd13', name: '개발2팀', users: ['u8', 'u9', 'u18'] },
                        ]
                    },
                    { id: 'd7', name: 'QA팀', users: [] },
                    { id: 'd14', name: '디자인팀', users: ['u12', 'u19', 'u24'] },
                ],
                users: ['u13'],
            },
            {
                id: 'd8',
                name: '영업본부',
                children: [
                    { id: 'd9', name: '영업1팀', users: ['u5', 'u20', 'u22'] },
                    { id: 'd15', name: '영업2팀', users: ['u10', 'u21'] },
                ],
                users: ['u14', 'u25'],
            },
            {
                id: 'd10',
                name: '임원실',
                users: ['u7']
            }
        ],
    },
];

// 기본 Mock 결재선 (팀장 -> 부장 -> 대표이사)
export const mockApprovalLine = [
    mockUsers.find(u => u.id === 'u2'),  // 김철수 대리
    mockUsers.find(u => u.id === 'u5'),  // 최지훈 부장
    mockUsers.find(u => u.id === 'u7')   // 강동원 대표이사
];

// 기본 Mock 참조자
export const mockReferrers = [
    mockUsers.find(u => u.id === 'u3'),  // 이영희 과장
    mockUsers.find(u => u.id === 'u6')   // 정수진 이사
];

// 기본 Mock 검토자
export const mockReviewers = [
    mockUsers.find(u => u.id === 'u1'),  // 홍길동 사원
    mockUsers.find(u => u.id === 'u15'), // 최유진 과장
    mockUsers.find(u => u.id === 'u4')   // 박민수 차장
];

export const templates = [
    { id: 'vacation', name: '휴가 신청서', type: 'HR' },
    { id: 'flexible', name: '유연근무 신청서', type: 'HR' },
    { id: 'businessTrip', name: '외근/출장 신청서', type: 'HR' },
    { id: 'overtime', name: '연장근무 신청서', type: 'HR' },
    { id: 'leave', name: '휴직신청서', type: 'HR' },
    { id: 'reinstatement', name: '복직신청서', type: 'HR' }
];

export const mockApprovalStatusList = [
    {
        id: 'DOC-2026-001',
        title: '3월 1주차 재택 유연근무 신청',
        templateName: '유연근무 신청서',
        drafter: '홍길동',
        draftDate: '2026-02-24',
        status: '진행중',
        currentApprover: '최유진 과장',
        progress: 50,
        content: '집중 개발 주간 운영을 위해 3월 1주차 재택 유연근무를 신청합니다.',
        attachments: ['weekly_focus_plan.pdf'],
        reviewers: ['박민수 차장'],
        referrers: ['김철수 대리'],
        approvalLine: [
            { name: '홍길동', position: '사원', status: '기안', date: '2026-02-24' },
            { name: '최유진', position: '과장', status: '대기', date: '' },
            { name: '정수진', position: '이사', status: '대기', date: '' }
        ]
    },
    {
        id: 'DOC-2026-002',
        title: '부산 고객사 방문 출장 신청',
        templateName: '외근/출장 신청서',
        drafter: '홍길동',
        draftDate: '2026-02-22',
        status: '진행중',
        currentApprover: '박민수 차장',
        progress: 33,
        content: '부산 고객사 현장 미팅을 위한 1박 2일 출장 승인 요청입니다.',
        attachments: ['busan_meeting_agenda.pdf'],
        reviewers: ['최유진 과장', '홍길동 사원'],
        referrers: ['정수진 이사'],
        approvalLine: [
            { name: '홍길동', position: '사원', status: '기안', date: '2026-02-22' },
            { name: '박민수', position: '차장', status: '대기', date: '' },
            { name: '정수진', position: '이사', status: '대기', date: '' }
        ]
    },
    {
        id: 'DOC-2026-003',
        title: 'QA 배포 지원 연장근무 신청',
        templateName: '연장근무 신청서',
        drafter: '윤도현',
        draftDate: '2026-02-21',
        status: '진행중',
        currentApprover: '홍길동 사원',
        progress: 66,
        content: '배포 안정성 점검을 위한 연장근무 승인 요청입니다.',
        attachments: ['qa_release_checklist.pdf'],
        reviewers: ['홍길동 사원', '최유진 과장'],
        referrers: ['박민수 차장'],
        approvalLine: [
            { name: '윤도현', position: '대리', status: '기안', date: '2026-02-21' },
            { name: '최유진', position: '과장', status: '승인', date: '2026-02-21' },
            { name: '홍길동', position: '사원', status: '대기', date: '' },
            { name: '정수진', position: '이사', status: '대기', date: '' }
        ]
    },
    {
        id: 'DOC-2026-004',
        title: '3월 연차 사용 계획',
        templateName: '휴가 신청서',
        drafter: '홍길동',
        draftDate: '2026-02-20',
        status: '반려',
        currentApprover: '최유진 과장',
        progress: 33,
        content: '3월 셋째 주 연차 사용 계획 승인 요청입니다.',
        attachments: [],
        reviewers: ['홍길동 사원'],
        referrers: ['박민수 차장'],
        approvalLine: [
            { name: '홍길동', position: '사원', status: '기안', date: '2026-02-20' },
            { name: '최유진', position: '과장', status: '반려', date: '2026-02-20' }
        ]
    },
    {
        id: 'DOC-2026-005',
        title: '복직 후 근무전환 신청',
        templateName: '복직신청서',
        drafter: '홍길동',
        draftDate: '2026-02-18',
        status: '완료',
        currentApprover: '-',
        progress: 100,
        content: '복직 이후 1개월간 유연근무 병행 적용을 신청합니다.',
        attachments: ['return_plan_v2.pdf'],
        reviewers: ['홍길동 사원', '최유진 과장'],
        referrers: ['홍길동 사원', '정수진 이사'],
        approvalLine: [
            { name: '홍길동', position: '사원', status: '기안', date: '2026-02-18' },
            { name: '최유진', position: '과장', status: '승인', date: '2026-02-18' },
            { name: '정수진', position: '이사', status: '전결', date: '2026-02-19' }
        ]
    }
];

export const mockPendingApprovals = [
    { id: 1, title: 'QA 배포 지원 연장근무 신청', templateName: '연장근무', drafter: '윤도현', draftDate: '02-21', isNew: true, currentStep: 2, currentApprover: '홍길동 사원' },
    { id: 2, title: '월말 점검 외근 신청', templateName: '외근/출장', drafter: '박민수', draftDate: '02-22', isNew: true, currentStep: 2, currentApprover: '홍길동 사원' },
    { id: 3, title: '개발2팀 유연근무 검토 요청', templateName: '유연근무', drafter: '민윤기', draftDate: '02-22', isNew: false, currentStep: 1, currentApprover: '홍길동 사원' },
    { id: 4, title: '3월 첫째 주 외근 신청', templateName: '외근/출장', drafter: '이영희', draftDate: '02-23', isNew: false, currentStep: 2, currentApprover: '홍길동 사원' },
    { id: 5, title: '긴급 서버대응 연장근무 신청', templateName: '연장근무', drafter: '김철수', draftDate: '02-24', isNew: false, currentStep: 1, currentApprover: '홍길동 사원' }
];

export const mockMyDrafts = [
    { id: 1, title: '3월 1주차 재택 유연근무 신청', currentApprover: '최유진 과장', status: '진행', approverInitial: '최' },
    { id: 2, title: '부산 고객사 방문 출장 신청', currentApprover: '박민수 차장', status: '진행', approverInitial: '박' },
    { id: 3, title: '복직 후 근무전환 신청', currentApprover: '-', status: '완료', approverInitial: '-' },
    { id: 4, title: '3월 연차 사용 계획', currentApprover: '-', status: '반려', approverInitial: '-' },
    { id: 5, title: '상반기 직무교육 참석 신청', currentApprover: '-', status: '기안', approverInitial: '-' }
];

export const mockReviewList = [
    {
        id: 'REV-2026-001',
        title: 'QA 배포 지원 연장근무 신청',
        drafter: '윤도현',
        position: '대리',
        department: '개발2팀',
        date: '2026-02-24',
        status: '진행중',
        content: '배포 전 점검 강화를 위해 연장근무 승인을 요청합니다.',
        isRead: false,
        category: '연장근무 신청서',
        attachments: ['qa_release_checklist.pdf'],
        reviewers: ['홍길동 사원'],
        canFinalize: false,
        step: 2,
        currentApprover: '홍길동 사원',
        approvalLine: [
            { name: '윤도현', position: '대리', status: '기안', date: '2026-02-24' },
            { name: '최유진', position: '과장', status: '승인', date: '2026-02-24' },
            { name: '홍길동', position: '사원', status: '대기', date: '' },
            { name: '정수진', position: '이사', status: '대기', date: '' }
        ]
    },
    {
        id: 'REV-2026-002',
        title: '월말 점검 외근 신청',
        drafter: '박민수',
        position: '차장',
        department: '개발1팀',
        date: '2026-02-23',
        status: '진행중',
        content: '협력사 시스템 점검을 위한 외근 승인 요청입니다.',
        isRead: false,
        category: '외근/출장 신청서',
        attachments: ['onsite_checklist.pdf'],
        reviewers: ['홍길동 사원', '최유진 과장'],
        canFinalize: false,
        step: 1,
        currentApprover: '홍길동 사원',
        approvalLine: [
            { name: '박민수', position: '차장', status: '기안', date: '2026-02-23' },
            { name: '홍길동', position: '사원', status: '대기', date: '' },
            { name: '정수진', position: '이사', status: '대기', date: '' }
        ]
    },
    {
        id: 'REV-2026-003',
        title: '개발2팀 유연근무 검토 요청',
        drafter: '민윤기',
        position: '과장',
        department: '개발2팀',
        date: '2026-02-22',
        status: '진행중',
        content: '개발2팀 집중 작업 주간 유연근무 신청 검토 요청입니다.',
        isRead: true,
        category: '유연근무 신청서',
        attachments: [],
        reviewers: ['홍길동 사원'],
        canFinalize: false,
        step: 1,
        currentApprover: '홍길동 사원',
        approvalLine: [
            { name: '민윤기', position: '과장', status: '기안', date: '2026-02-22' },
            { name: '홍길동', position: '사원', status: '대기', date: '' },
            { name: '정수진', position: '이사', status: '대기', date: '' }
        ]
    },
    {
        id: 'REV-2026-004',
        title: '3월 첫째 주 외근 신청',
        drafter: '이영희',
        position: '과장',
        department: '개발1팀',
        date: '2026-02-21',
        status: '진행중',
        content: '협력사 기술 미팅 참석을 위한 외근 신청입니다.',
        isRead: true,
        category: '외근/출장 신청서',
        attachments: [],
        reviewers: ['홍길동 사원', '박민수 차장'],
        canFinalize: false,
        step: 2,
        currentApprover: '홍길동 사원',
        approvalLine: [
            { name: '이영희', position: '과장', status: '기안', date: '2026-02-21' },
            { name: '박민수', position: '차장', status: '승인', date: '2026-02-21' },
            { name: '홍길동', position: '사원', status: '대기', date: '' },
            { name: '정수진', position: '이사', status: '대기', date: '' }
        ]
    },
    {
        id: 'REV-2026-005',
        title: '긴급 서버대응 연장근무 신청',
        drafter: '김철수',
        position: '대리',
        department: '인사팀',
        date: '2026-02-20',
        status: '진행중',
        content: '야간 긴급 대응을 위한 연장근무 신청 승인 요청입니다.',
        isRead: false,
        category: '연장근무 신청서',
        attachments: ['incident_summary.pdf'],
        reviewers: ['홍길동 사원'],
        canFinalize: false,
        step: 1,
        currentApprover: '홍길동 사원',
        approvalLine: [
            { name: '김철수', position: '대리', status: '기안', date: '2026-02-20' },
            { name: '홍길동', position: '사원', status: '대기', date: '' },
            { name: '최유진', position: '과장', status: '대기', date: '' }
        ]
    }
];

export const mockApprovalBox = [
    // 진행중 5건
    {
        id: 'ING-2026-001',
        title: '3월 1주차 재택 유연근무 신청',
        drafter: '홍길동',
        position: '사원',
        department: '인사팀',
        date: '2026-02-24 09:10',
        status: '진행중',
        category: '유연근무 신청서',
        isRead: false,
        content: '집중 개발 주간 운영을 위해 재택 유연근무를 신청합니다.',
        attachments: ['weekly_focus_plan.pdf'],
        reviewers: ['박민수 차장'],
        referrers: ['김철수 대리'],
        currentApprover: '최유진 과장',
        approvalLine: [
            { name: '홍길동', position: '사원', status: '기안', date: '2026-02-24' },
            { name: '최유진', position: '과장', status: '대기', date: '' },
            { name: '정수진', position: '이사', status: '대기', date: '' }
        ]
    },
    {
        id: 'ING-2026-002',
        title: '부산 고객사 방문 출장 신청',
        drafter: '홍길동',
        position: '사원',
        department: '인사팀',
        date: '2026-02-23 10:20',
        status: '진행중',
        category: '외근/출장 신청서',
        isRead: false,
        content: '고객사 분기 리뷰 미팅 참석을 위한 출장 승인 요청입니다.',
        attachments: ['busan_meeting_agenda.pdf'],
        reviewers: ['홍길동 사원', '최유진 과장'],
        referrers: ['정수진 이사'],
        currentApprover: '박민수 차장',
        approvalLine: [
            { name: '홍길동', position: '사원', status: '기안', date: '2026-02-23' },
            { name: '박민수', position: '차장', status: '대기', date: '' },
            { name: '정수진', position: '이사', status: '대기', date: '' }
        ]
    },
    {
        id: 'ING-2026-003',
        title: 'QA 배포 지원 연장근무 신청',
        drafter: '윤도현',
        position: '대리',
        department: '개발2팀',
        date: '2026-02-22 18:00',
        status: '진행중',
        category: '연장근무 신청서',
        isRead: true,
        content: '배포 안정성 점검을 위한 QA 연장근무 승인 요청입니다.',
        attachments: ['qa_release_checklist.pdf'],
        reviewers: ['홍길동 사원'],
        currentApprover: '홍길동 사원',
        approvalLine: [
            { name: '윤도현', position: '대리', status: '기안', date: '2026-02-22' },
            { name: '최유진', position: '과장', status: '승인', date: '2026-02-22' },
            { name: '홍길동', position: '사원', status: '대기', date: '' },
            { name: '정수진', position: '이사', status: '대기', date: '' }
        ]
    },
    {
        id: 'ING-2026-004',
        title: '개발2팀 유연근무 검토 요청',
        drafter: '민윤기',
        position: '과장',
        department: '개발2팀',
        date: '2026-02-21 11:15',
        status: '진행중',
        category: '유연근무 신청서',
        isRead: false,
        content: '개발2팀 집중 작업 주간 유연근무 신청 건입니다.',
        attachments: [],
        reviewers: ['홍길동 사원', '최유진 과장'],
        currentApprover: '홍길동 사원',
        approvalLine: [
            { name: '민윤기', position: '과장', status: '기안', date: '2026-02-21' },
            { name: '홍길동', position: '사원', status: '대기', date: '' },
            { name: '정수진', position: '이사', status: '대기', date: '' }
        ]
    },
    {
        id: 'ING-2026-005',
        title: '월말 점검 외근 신청',
        drafter: '박민수',
        position: '차장',
        department: '개발1팀',
        date: '2026-02-20 17:40',
        status: '진행중',
        category: '외근/출장 신청서',
        isRead: true,
        content: '협력사 시스템 월말 점검을 위한 외근 신청입니다.',
        attachments: ['onsite_checklist.pdf'],
        reviewers: ['홍길동 사원'],
        currentApprover: '홍길동 사원',
        approvalLine: [
            { name: '박민수', position: '차장', status: '기안', date: '2026-02-20' },
            { name: '홍길동', position: '사원', status: '대기', date: '' },
            { name: '정수진', position: '이사', status: '대기', date: '' }
        ]
    },

    // 보류/반려 5건
    {
        id: 'ISS-2026-001',
        title: '3월 연차 사용 계획',
        drafter: '홍길동',
        position: '사원',
        department: '인사팀',
        date: '2026-02-19 09:15',
        status: '반려',
        category: '휴가 신청서',
        isRead: true,
        content: '3월 셋째 주 연차 사용 계획 승인 요청 건입니다.',
        attachments: [],
        reviewers: ['홍길동 사원'],
        rejectReason: '해당 주간 인력 운영 계획과 충돌합니다.',
        currentApprover: '최유진 과장',
        approvalLine: [
            { name: '홍길동', position: '사원', status: '기안', date: '2026-02-19' },
            { name: '최유진', position: '과장', status: '반려', date: '2026-02-19' }
        ]
    },
    {
        id: 'ISS-2026-002',
        title: '긴급 서버대응 연장근무 신청',
        drafter: '김철수',
        position: '대리',
        department: '인사팀',
        date: '2026-02-18 15:00',
        status: '보류',
        category: '연장근무 신청서',
        isRead: false,
        content: '긴급 서버대응을 위한 야간 연장근무 신청입니다.',
        attachments: ['incident_summary.pdf'],
        reviewers: ['홍길동 사원'],
        currentApprover: '홍길동 사원',
        approvalLine: [
            { name: '김철수', position: '대리', status: '기안', date: '2026-02-18' },
            { name: '홍길동', position: '사원', status: '보류', date: '2026-02-18' }
        ]
    },
    {
        id: 'ISS-2026-003',
        title: '영업1팀 유연근무 신청',
        drafter: '최지훈',
        position: '부장',
        department: '영업1팀',
        date: '2026-02-17 20:10',
        status: '반려',
        category: '유연근무 신청서',
        isRead: true,
        content: '영업1팀 유연근무 운영 신청 건입니다.',
        attachments: [],
        reviewers: ['홍길동 사원', '최유진 과장'],
        rejectReason: '보완 자료 제출 후 재상신 필요',
        currentApprover: '정수진 이사',
        approvalLine: [
            { name: '최지훈', position: '부장', status: '기안', date: '2026-02-17' },
            { name: '홍길동', position: '사원', status: '승인', date: '2026-02-17' },
            { name: '정수진', position: '이사', status: '반려', date: '2026-02-17' }
        ]
    },
    {
        id: 'ISS-2026-004',
        title: '복직 후 근무전환 신청',
        drafter: '홍길동',
        position: '사원',
        department: '인사팀',
        date: '2026-02-16 08:40',
        status: '보류',
        category: '복직신청서',
        isRead: false,
        content: '복직 후 유연근무 병행 전환 신청 건입니다.',
        attachments: ['return_plan_v1.pdf'],
        reviewers: ['홍길동 사원', '최유진 과장'],
        currentApprover: '최유진 과장',
        approvalLine: [
            { name: '홍길동', position: '사원', status: '기안', date: '2026-02-16' },
            { name: '최유진', position: '과장', status: '보류', date: '2026-02-16' }
        ]
    },
    {
        id: 'ISS-2026-005',
        title: '개발1팀 외근 신청',
        drafter: '이영희',
        position: '과장',
        department: '개발1팀',
        date: '2026-02-15 14:10',
        status: '반려',
        category: '외근/출장 신청서',
        isRead: true,
        content: '협력사 기술 협의 외근 신청입니다.',
        attachments: [],
        reviewers: ['홍길동 사원'],
        rejectReason: '외근 사유서 상세 보완 필요',
        currentApprover: '박민수 차장',
        approvalLine: [
            { name: '이영희', position: '과장', status: '기안', date: '2026-02-15' },
            { name: '홍길동', position: '사원', status: '승인', date: '2026-02-15' },
            { name: '박민수', position: '차장', status: '반려', date: '2026-02-15' }
        ]
    },

    // 완료 5건
    {
        id: 'CMP-2026-001',
        title: '3월 초 연장근무 신청',
        drafter: '홍길동',
        position: '사원',
        department: '인사팀',
        date: '2026-02-14 19:00',
        status: '완료',
        category: '연장근무 신청서',
        isRead: true,
        content: '3월 초 시스템 점검 대응 연장근무 신청 건입니다.',
        attachments: ['maintenance_plan.pdf'],
        reviewers: ['홍길동 사원'],
        referrers: ['홍길동 사원', '최유진 과장'],
        currentApprover: '-',
        approvalLine: [
            { name: '홍길동', position: '사원', status: '기안', date: '2026-02-14' },
            { name: '최유진', position: '과장', status: '승인', date: '2026-02-14' },
            { name: '정수진', position: '이사', status: '전결', date: '2026-02-15' }
        ]
    },
    {
        id: 'CMP-2026-002',
        title: '1분기 고객사 방문 출장 신청',
        drafter: '최지훈',
        position: '부장',
        department: '영업1팀',
        date: '2026-02-13 10:30',
        status: '완료',
        category: '외근/출장 신청서',
        isRead: true,
        content: '1분기 핵심 고객사 방문 출장 신청 건입니다.',
        attachments: ['customer_visit_plan.pdf'],
        reviewers: ['홍길동 사원', '최유진 과장'],
        referrers: ['홍길동 사원', '정수진 이사'],
        currentApprover: '-',
        approvalLine: [
            { name: '최지훈', position: '부장', status: '기안', date: '2026-02-13' },
            { name: '홍길동', position: '사원', status: '승인', date: '2026-02-13' },
            { name: '손흥민', position: '본부장', status: '승인', date: '2026-02-13' },
            { name: '강동원', position: '대표이사', status: '전결', date: '2026-02-14' }
        ]
    },
    {
        id: 'CMP-2026-003',
        title: '2월 연차 사용 신청',
        drafter: '이영희',
        position: '과장',
        department: '개발1팀',
        date: '2026-02-12 09:05',
        status: '완료',
        category: '휴가 신청서',
        isRead: true,
        content: '2월 마지막 주 연차 사용 신청입니다.',
        attachments: [],
        reviewers: ['홍길동 사원'],
        referrers: ['최유진 과장'],
        currentApprover: '-',
        approvalLine: [
            { name: '이영희', position: '과장', status: '기안', date: '2026-02-12' },
            { name: '홍길동', position: '사원', status: '승인', date: '2026-02-12' },
            { name: '정수진', position: '이사', status: '승인', date: '2026-02-13' }
        ]
    },
    {
        id: 'CMP-2026-004',
        title: '복직 신청서',
        drafter: '김제니',
        position: '대리',
        department: '영업2팀',
        date: '2026-02-11 13:20',
        status: '완료',
        category: '복직신청서',
        isRead: true,
        content: '복직 신청 승인 완료 건입니다.',
        attachments: ['return_certificate.pdf'],
        reviewers: ['홍길동 사원', '최유진 과장'],
        referrers: ['박민수 차장'],
        currentApprover: '-',
        approvalLine: [
            { name: '김제니', position: '대리', status: '기안', date: '2026-02-11' },
            { name: '홍길동', position: '사원', status: '승인', date: '2026-02-11' },
            { name: '강석진', position: '차장', status: '승인', date: '2026-02-11' },
            { name: '손흥민', position: '본부장', status: '전결', date: '2026-02-12' }
        ]
    },
    {
        id: 'CMP-2026-005',
        title: '2월 2주차 유연근무 신청',
        drafter: '민윤기',
        position: '과장',
        department: '개발2팀',
        date: '2026-02-10 09:45',
        status: '완료',
        category: '유연근무 신청서',
        isRead: true,
        content: '2월 2주차 유연근무 승인 완료 건입니다.',
        attachments: [],
        reviewers: ['홍길동 사원'],
        referrers: ['김철수 대리'],
        currentApprover: '-',
        approvalLine: [
            { name: '민윤기', position: '과장', status: '기안', date: '2026-02-10' },
            { name: '홍길동', position: '사원', status: '승인', date: '2026-02-10' },
            { name: '정수진', position: '이사', status: '승인', date: '2026-02-10' }
        ]
    },

    // 임시저장 5건 (기안자 본인)
    {
        id: 'TEMP-2026-001',
        title: '(임시) 3월 2주차 유연근무 신청',
        drafter: '홍길동',
        position: '사원',
        department: '인사팀',
        date: '2026-02-25 11:00',
        status: '임시저장',
        category: '유연근무 신청서',
        isRead: true,
        content: '집중 업무를 위한 주 2회 재택 유연근무 임시 저장 건입니다.',
        reviewers: [],
        attachments: ['flex_draft_week2.docx']
    },
    {
        id: 'TEMP-2026-002',
        title: '(임시) 대구 지사 출장 신청',
        drafter: '홍길동',
        position: '사원',
        department: '인사팀',
        date: '2026-02-25 10:10',
        status: '임시저장',
        category: '외근/출장 신청서',
        isRead: true,
        content: '대구 지사 방문 출장 신청 임시 저장 건입니다.',
        reviewers: ['최유진 과장'],
        attachments: []
    },
    {
        id: 'TEMP-2026-003',
        title: '(임시) 분기마감 연장근무 신청',
        drafter: '홍길동',
        position: '사원',
        department: '인사팀',
        date: '2026-02-25 09:30',
        status: '임시저장',
        category: '연장근무 신청서',
        isRead: true,
        content: '분기마감 대응 연장근무 신청 임시 저장 건입니다.',
        reviewers: [],
        attachments: ['overtime_draft.xlsx']
    },
    {
        id: 'TEMP-2026-004',
        title: '(임시) 4월 연차 신청',
        drafter: '홍길동',
        position: '사원',
        department: '인사팀',
        date: '2026-02-24 18:20',
        status: '임시저장',
        category: '휴가 신청서',
        isRead: true,
        content: '4월 중 연차 사용 계획 임시 저장 건입니다.',
        reviewers: ['최유진 과장'],
        attachments: []
    },
    {
        id: 'TEMP-2026-005',
        title: '(임시) 복직 후 유연근무 병행 신청',
        drafter: '홍길동',
        position: '사원',
        department: '인사팀',
        date: '2026-02-24 15:40',
        status: '임시저장',
        category: '복직신청서',
        isRead: true,
        content: '복직 이후 근무형태 전환 신청 임시 저장 건입니다.',
        reviewers: ['최유진 과장'],
        attachments: ['returning_plan.docx']
    }
];

const mapStatusToCategory = (templateName) => {
    if (templateName?.includes('휴가')) return '휴가 신청서';
    if (templateName?.includes('유연근무')) return '유연근무 신청서';
    if (templateName?.includes('외근') || templateName?.includes('출장')) return '외근/출장 신청서';
    if (templateName?.includes('연장근무')) return '연장근무 신청서';
    if (templateName?.includes('복직')) return '복직신청서';
    if (templateName?.includes('휴직')) return '휴직신청서';
    if (templateName?.includes('품의')) return '품의서';
    if (templateName?.includes('보고')) return '보고서';
    return templateName || '기안서';
};

export const findApprovalDocument = (id, source = 'box') => {
    if (!id) return null;

    if (source === 'status') {
        const statusDoc = mockApprovalStatusList.find((doc) => doc.id === id);
        if (!statusDoc) return null;
        return {
            ...statusDoc,
            date: statusDoc.draftDate,
            category: mapStatusToCategory(statusDoc.templateName),
            content: statusDoc.content || '재상신 문서 본문입니다.',
            attachments: statusDoc.attachments || [],
            referrers: statusDoc.referrers || [],
            reviewers: statusDoc.reviewers || [],
            approvalLine: [
                { name: statusDoc.drafter, position: '기안자', status: '기안', date: statusDoc.draftDate },
                ...(statusDoc.approvalLine || [])
            ]
        };
    }

    return mockApprovalBox.find((doc) => doc.id === id) || null;
};
