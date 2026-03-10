const rankOrder = {
  대표이사: 0,
  상무: 1,
  본부장: 2,
  이사: 3,
  부장: 4,
  팀장: 5,
  차장: 6,
  과장: 7,
  대리: 8,
  주임: 9,
  사원: 10
}

const makeMember = (payload) => ({
  employeeId: payload.employeeId,
  profileInitial: payload.profileInitial,
  name: payload.name,
  extension: payload.extension,
  phone: payload.phone,
  email: payload.email,
  duty: payload.duty,
  job: payload.job,
  position: payload.position,
  status: payload.status || '정상',
  workLocation: payload.workLocation || '서울 강남',
  hireDate: payload.hireDate,
  isLeader: Boolean(payload.isLeader),
  approvalAuthority: Boolean(payload.approvalAuthority),
  personalInfo: payload.personalInfo || undefined,
  hrInfo: payload.hrInfo || undefined,
  skills: payload.skills || undefined,
  careers: payload.careers || undefined
})

const mobile1Members = [
  makeMember({
    employeeId: '2402040001',
    profileInitial: '봉식',
    name: '김봉식',
    extension: '1042',
    phone: '010-1234-5678',
    email: 'bong@rhight.co.kr',
    duty: '팀장',
    job: '백엔드 개발자',
    position: '모바일1팀',
    status: '정상',
    hireDate: '2024.02.04',
    isLeader: true,
    approvalAuthority: true,
    personalInfo: { birthDate: '1995.03.28' },
    hrInfo: {
      organization: 'RHight Inc. · 기술연구소 · SW개발센터 · 개발부 · 모바일1팀',
      dutyJobPosition: '팀장 · 백엔드 개발자 · 모바일1팀',
      employmentStatus: '재직',
      hireDate: '2024.02.04',
      workType: '정규직',
      workRegion: '서울 강남'
    },
    skills: [
      { type: '자격증', name: '정보처리기사', issuer: '한국산업인력공단', date: '2023.06' },
      { type: '어학', name: 'TOEIC 920', issuer: 'ETS', date: '2024.01' },
      { type: '클라우드', name: 'AWS SAA', issuer: 'Amazon', date: '2024.04' },
      { type: '자격증', name: 'SQLD', issuer: '한국데이터산업진흥원', date: '2023.09' },
      { type: '어학', name: 'OPIc IH', issuer: 'ACTFL', date: '2024.03' }
    ],
    careers: [
      { company: 'RHight', role: '백엔드 개발자 · 모바일1팀', period: '2024.02 ~ 재직중' },
      { company: '네이버', role: '서버 개발자 · 플랫폼개발팀', period: '2021.03 ~ 2024.01' }
    ]
  }),
  makeMember({
    employeeId: '2404180007',
    profileInitial: '준호',
    name: '이준호',
    extension: '1048',
    phone: '010-7777-8800',
    email: 'junho.lee@rhight.co.kr',
    duty: '주임',
    job: '백엔드 개발자',
    position: '모바일1팀',
    status: '정상',
    hireDate: '2024.04.18',
    personalInfo: { birthDate: '1997.02.15' },
    hrInfo: {
      organization: 'RHight Inc. · 기술연구소 · SW개발센터 · 개발부 · 모바일1팀',
      dutyJobPosition: '주임 · 백엔드 개발자 · 모바일1팀',
      employmentStatus: '재직',
      hireDate: '2024.04.18',
      workType: '정규직',
      workRegion: '서울 강남'
    },
    skills: [{ type: '자격증', name: 'AWS SAA', issuer: 'Amazon', date: '2024.02' }],
    careers: [
      { company: 'RHight', role: '백엔드 개발자 · 모바일1팀', period: '2024.04 ~ 재직중' }
    ]
  }),
  makeMember({
    employeeId: '2405010003',
    profileInitial: '민지',
    name: '박민지',
    extension: '1045',
    phone: '010-3388-4545',
    email: 'minji.park@rhight.co.kr',
    duty: '대리',
    job: '프론트엔드 개발자',
    position: '모바일1팀',
    status: '재택',
    hireDate: '2024.05.01',
    personalInfo: { birthDate: '1998.11.04' },
    hrInfo: {
      organization: 'RHight Inc. · 기술연구소 · SW개발센터 · 개발부 · 모바일1팀',
      dutyJobPosition: '대리 · 프론트엔드 개발자 · 모바일1팀',
      employmentStatus: '재택 근무',
      hireDate: '2024.05.01',
      workType: '정규직',
      workRegion: '서울 강남'
    },
    skills: [
      { type: '자격증', name: 'SQLD', issuer: '한국데이터산업진흥원', date: '2023.09' },
      { type: '어학', name: 'OPIc IH', issuer: 'ACTFL', date: '2024.03' }
    ],
    careers: [
      { company: 'RHight', role: '프론트엔드 개발자 · 모바일1팀', period: '2024.05 ~ 재직중' }
    ]
  }),
  makeMember({
    employeeId: '2410010012',
    profileInitial: '수빈',
    name: '최수빈',
    extension: '1051',
    phone: '010-1223-8844',
    email: 'subin.choi@rhight.co.kr',
    duty: '사원',
    job: 'QA 엔지니어',
    position: '모바일1팀',
    status: '휴가',
    hireDate: '2024.10.01',
    personalInfo: { birthDate: '2000.08.30' },
    hrInfo: {
      organization: 'RHight Inc. · 기술연구소 · SW개발센터 · 개발부 · 모바일1팀',
      dutyJobPosition: '사원 · QA 엔지니어 · 모바일1팀',
      employmentStatus: '연차',
      hireDate: '2024.10.01',
      workType: '정규직',
      workRegion: '서울 강남'
    },
    skills: [{ type: '자격증', name: 'ISTQB FL', issuer: 'ISTQB', date: '2024.06' }],
    careers: [
      { company: 'RHight', role: 'QA 엔지니어 · 모바일1팀', period: '2024.10 ~ 재직중' }
    ]
  })
]

export const hrCurrentUserMock = {
  employeeId: '2402040001',
  name: '김봉식',
  role: 'TEAM_LEADER',
  teamNodeId: 'TEAM-MOBILE-1',
  teamName: '모바일1팀'
}

export const hrOrgTreeMock = {
  id: 'ORG-RHIGHT',
  type: '회사',
  name: 'RHight Inc.',
  children: [
    {
      id: 'DIV-MGMT',
      type: '본부',
      name: '경영지원본부',
      members: [
        makeMember({
          employeeId: '2103020011',
          profileInitial: '수진',
          name: '정수진',
          extension: '2101',
          phone: '010-9991-8899',
          email: 'sujin.jung@rhight.co.kr',
          duty: '이사',
          job: '경영지원',
          position: '경영지원본부',
          hireDate: '2021.03.02',
          isLeader: true,
          approvalAuthority: true
        })
      ],
      children: [
        {
          id: 'TEAM-HR',
          type: '팀',
          name: '인사팀',
          members: [
            makeMember({
              employeeId: '2304010032',
              profileInitial: '홍길',
              name: '홍길동',
              extension: '2201',
              phone: '010-2233-2211',
              email: 'gildong.hong@rhight.co.kr',
              duty: '사원',
              job: '인사 운영',
              position: '인사팀',
              hireDate: '2023.04.01'
            }),
            makeMember({
              employeeId: '2202030091',
              profileInitial: '철수',
              name: '김철수',
              extension: '2202',
              phone: '010-7788-2299',
              email: 'chulsoo.kim@rhight.co.kr',
              duty: '대리',
              job: '인사 기획',
              position: '인사팀',
              hireDate: '2022.02.03'
            }),
            makeMember({
              employeeId: '2109270039',
              profileInitial: '유진',
              name: '최유진',
              extension: '2203',
              phone: '010-1192-1177',
              email: 'yujin.choi@rhight.co.kr',
              duty: '과장',
              job: '인사 평가',
              position: '인사팀',
              hireDate: '2021.09.27',
              approvalAuthority: true
            }),
            makeMember({
              employeeId: '2401070044',
              profileInitial: '원영',
              name: '장원영',
              extension: '2204',
              phone: '010-1022-3344',
              email: 'wonyoung.jang@rhight.co.kr',
              duty: '사원',
              job: '채용 운영',
              position: '인사팀',
              hireDate: '2024.01.07'
            })
          ]
        },
        {
          id: 'TEAM-GA',
          type: '팀',
          name: '총무팀',
          members: []
        },
        {
          id: 'TEAM-MKT',
          type: '팀',
          name: '마케팅팀',
          members: [
            makeMember({
              employeeId: '2203100014',
              profileInitial: '남준',
              name: '김남준',
              extension: '2301',
              phone: '010-4561-8890',
              email: 'namjoon.kim@rhight.co.kr',
              duty: '과장',
              job: '퍼포먼스 마케팅',
              position: '마케팅팀',
              hireDate: '2022.03.10',
              approvalAuthority: true
            }),
            makeMember({
              employeeId: '2312010072',
              profileInitial: '지민',
              name: '박지민',
              extension: '2302',
              phone: '010-8091-2245',
              email: 'jimin.park@rhight.co.kr',
              duty: '사원',
              job: '브랜드 마케팅',
              position: '마케팅팀',
              hireDate: '2023.12.01'
            })
          ]
        }
      ]
    },
    {
      id: 'DIV-TECH',
      type: '본부',
      name: '기술연구소',
      members: [
        makeMember({
          employeeId: '1809150001',
          profileInitial: '혜교',
          name: '송혜교',
          extension: '3001',
          phone: '010-1000-8899',
          email: 'hyegyo.song@rhight.co.kr',
          duty: '본부장',
          job: '연구소 총괄',
          position: '기술연구소',
          hireDate: '2018.09.15',
          isLeader: true,
          approvalAuthority: true
        })
      ],
      children: [
        {
          id: 'CENTER-SW',
          type: '센터',
          name: 'SW개발센터',
          children: [
            {
              id: 'DEPT-DEV',
              type: '부',
              name: '개발부',
              children: [
                {
                  id: 'TEAM-DEV-1',
                  type: '팀',
                  name: '개발1팀',
                  members: [
                    makeMember({
                      employeeId: '2104100032',
                      profileInitial: '영희',
                      name: '이영희',
                      extension: '3101',
                      phone: '010-3377-1001',
                      email: 'younghee.lee@rhight.co.kr',
                      duty: '과장',
                      job: '백엔드 개발자',
                      position: '개발1팀',
                      hireDate: '2021.04.10',
                      approvalAuthority: true
                    }),
                    makeMember({
                      employeeId: '1903020009',
                      profileInitial: '민수',
                      name: '박민수',
                      extension: '3102',
                      phone: '010-1178-9001',
                      email: 'minsoo.park@rhight.co.kr',
                      duty: '차장',
                      job: '백엔드 개발자',
                      position: '개발1팀',
                      hireDate: '2019.03.02',
                      isLeader: true,
                      approvalAuthority: true
                    }),
                    makeMember({
                      employeeId: '2407030052',
                      profileInitial: '정국',
                      name: '정국',
                      extension: '3103',
                      phone: '010-2345-7890',
                      email: 'jungkook@rhight.co.kr',
                      duty: '사원',
                      job: '백엔드 개발자',
                      position: '개발1팀',
                      hireDate: '2024.07.03'
                    })
                  ]
                },
                {
                  id: 'TEAM-DEV-2',
                  type: '팀',
                  name: '개발2팀',
                  members: [
                    makeMember({
                      employeeId: '2306070021',
                      profileInitial: '지아',
                      name: '이지아',
                      extension: '3111',
                      phone: '010-8001-2234',
                      email: 'jia.lee@rhight.co.kr',
                      duty: '사원',
                      job: '프론트엔드 개발자',
                      position: '개발2팀',
                      hireDate: '2023.06.07'
                    }),
                    makeMember({
                      employeeId: '2209050071',
                      profileInitial: '도현',
                      name: '윤도현',
                      extension: '3112',
                      phone: '010-9090-1234',
                      email: 'dohyun.yoon@rhight.co.kr',
                      duty: '대리',
                      job: '프론트엔드 개발자',
                      position: '개발2팀',
                      hireDate: '2022.09.05'
                    }),
                    makeMember({
                      employeeId: '2008110014',
                      profileInitial: '윤기',
                      name: '민윤기',
                      extension: '3113',
                      phone: '010-9922-1122',
                      email: 'yoongi.min@rhight.co.kr',
                      duty: '과장',
                      job: '풀스택 개발자',
                      position: '개발2팀',
                      hireDate: '2020.08.11',
                      isLeader: true,
                      approvalAuthority: true
                    })
                  ]
                },
                {
                  id: 'TEAM-MOBILE-1',
                  type: '팀',
                  name: '모바일1팀',
                  members: mobile1Members
                },
                {
                  id: 'TEAM-QA',
                  type: '팀',
                  name: 'QA팀',
                  members: []
                },
                {
                  id: 'TEAM-DESIGN',
                  type: '팀',
                  name: '디자인팀',
                  members: [
                    makeMember({
                      employeeId: '2201170003',
                      profileInitial: '보검',
                      name: '박보검',
                      extension: '3121',
                      phone: '010-4988-2244',
                      email: 'bogum.park@rhight.co.kr',
                      duty: '대리',
                      job: 'UI 디자이너',
                      position: '디자인팀',
                      hireDate: '2022.01.17'
                    }),
                    makeMember({
                      employeeId: '2403060022',
                      profileInitial: '태형',
                      name: '김태형',
                      extension: '3122',
                      phone: '010-8077-0012',
                      email: 'taehyung.kim2@rhight.co.kr',
                      duty: '사원',
                      job: 'UX 디자이너',
                      position: '디자인팀',
                      hireDate: '2024.03.06'
                    }),
                    makeMember({
                      employeeId: '2212110012',
                      profileInitial: '유진',
                      name: '안유진',
                      extension: '3123',
                      phone: '010-2111-5523',
                      email: 'yujin.an@rhight.co.kr',
                      duty: '대리',
                      job: '프로덕트 디자이너',
                      position: '디자인팀',
                      hireDate: '2022.12.11'
                    })
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'DIV-SALES',
      type: '본부',
      name: '영업본부',
      members: [
        makeMember({
          employeeId: '1707010007',
          profileInitial: '현빈',
          name: '현빈',
          extension: '4001',
          phone: '010-1112-1188',
          email: 'hyunbin@rhight.co.kr',
          duty: '상무',
          job: '영업 총괄',
          position: '영업본부',
          hireDate: '2017.07.01',
          isLeader: true,
          approvalAuthority: true
        }),
        makeMember({
          employeeId: '1802100009',
          profileInitial: '흥민',
          name: '손흥민',
          extension: '4002',
          phone: '010-3000-9900',
          email: 'heungmin.son@rhight.co.kr',
          duty: '본부장',
          job: '영업 전략',
          position: '영업본부',
          hireDate: '2018.02.10',
          approvalAuthority: true
        })
      ],
      children: [
        {
          id: 'TEAM-SALES-1',
          type: '팀',
          name: '영업1팀',
          members: [
            makeMember({
              employeeId: '1909140005',
              profileInitial: '지훈',
              name: '최지훈',
              extension: '4101',
              phone: '010-5555-4400',
              email: 'jihun.choi@rhight.co.kr',
              duty: '부장',
              job: '기업 영업',
              position: '영업1팀',
              hireDate: '2019.09.14',
              isLeader: true,
              approvalAuthority: true
            }),
            makeMember({
              employeeId: '2003010083',
              profileInitial: '석진',
              name: '강석진',
              extension: '4102',
              phone: '010-6655-1100',
              email: 'seokjin.kang@rhight.co.kr',
              duty: '차장',
              job: '기업 영업',
              position: '영업1팀',
              hireDate: '2020.03.01',
              approvalAuthority: true
            }),
            makeMember({
              employeeId: '2108010018',
              profileInitial: '영웅',
              name: '임영웅',
              extension: '4103',
              phone: '010-7771-2222',
              email: 'youngwoong.lim@rhight.co.kr',
              duty: '과장',
              job: '기업 영업',
              position: '영업1팀',
              hireDate: '2021.08.01'
            })
          ]
        },
        {
          id: 'TEAM-SALES-2',
          type: '팀',
          name: '영업2팀',
          members: [
            makeMember({
              employeeId: '2401020049',
              profileInitial: '소희',
              name: '한소희',
              extension: '4111',
              phone: '010-1199-4412',
              email: 'sohee.han@rhight.co.kr',
              duty: '사원',
              job: '채널 영업',
              position: '영업2팀',
              hireDate: '2024.01.02'
            }),
            makeMember({
              employeeId: '2303020063',
              profileInitial: '제니',
              name: '김제니',
              extension: '4112',
              phone: '010-9922-6711',
              email: 'jenny.kim@rhight.co.kr',
              duty: '대리',
              job: '채널 영업',
              position: '영업2팀',
              hireDate: '2023.03.02'
            })
          ]
        },
        {
          id: 'OFFICE-EXEC',
          type: '실',
          name: '임원실',
          members: [
            makeMember({
              employeeId: '1601010001',
              profileInitial: '동원',
              name: '강동원',
              extension: '5001',
              phone: '010-2000-1111',
              email: 'ceo.kang@rhight.co.kr',
              duty: '대표이사',
              job: '경영 총괄',
              position: '임원실',
              hireDate: '2016.01.01',
              isLeader: true,
              approvalAuthority: true
            })
          ]
        }
      ]
    }
  ]
}

const dateToNumber = (value) => Number(String(value || '').replaceAll('.', '')) || 0

export const sortMembersByRule = (members) => {
  return [...members].sort((a, b) => {
    if (a.isLeader !== b.isLeader) return a.isLeader ? -1 : 1

    const rankDiff = (rankOrder[a.duty] ?? 99) - (rankOrder[b.duty] ?? 99)
    if (rankDiff !== 0) return rankDiff

    const hireDiff = dateToNumber(a.hireDate) - dateToNumber(b.hireDate)
    if (hireDiff !== 0) return hireDiff

    return String(a.name).localeCompare(String(b.name), 'ko')
  })
}

export const findNodeById = (node, nodeId) => {
  if (!node) return null
  if (node.id === nodeId) return node
  for (const child of node.children || []) {
    const found = findNodeById(child, nodeId)
    if (found) return found
  }
  return null
}

export const findPathByNodeId = (node, targetId, path = []) => {
  if (!node) return null

  const nextPath = [...path, node.id]
  if (node.id === targetId) return nextPath

  for (const child of node.children || []) {
    const childPath = findPathByNodeId(child, targetId, nextPath)
    if (childPath) return childPath
  }

  return null
}

export const createHrCurrentUserMock = () => structuredClone(hrCurrentUserMock)
export const createHrOrgTreeMock = () => structuredClone(hrOrgTreeMock)
export const createHrTeamMembersMock = () => {
  const teamNode = findNodeById(hrOrgTreeMock, hrCurrentUserMock.teamNodeId)
  return structuredClone(sortMembersByRule(teamNode?.members || []))
}
