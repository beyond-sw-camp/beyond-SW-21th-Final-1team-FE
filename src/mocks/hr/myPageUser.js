export const hrMyPageUserMock = {
  profileImage: '',
  name: '김봉식',
  team: '모바일1팀',
  jobTitle: '백엔드 개발자',
  position: '팀장',
  email: 'bong@rhight.co.kr',
  phone: '010-1234-5678',
  extension: '1042',
  workLocation: '서울 강남',
  lastLogin: '2026.02.09 09:12',
  empNo: '2402040001',
  birthDate: '1995.03.28',
  address: '서울시 강남구 테헤란로 123 어딘가 아파트 101동 202호',
  ssn: '950328-1******',
  bankAccount: '신한 110-****-****890',
  orgPosition: '모바일1팀 · 팀장',
  jobRole: '백엔드 개발자 · 사무직',
  rank: '과장 · 3호봉',
  status: '재직',
  hireDate: '2024.02.04',
  tenure: '2년 0개월',
  workType: '정규직',
  workRegion: '서울 강남',
  hireType: '경력',
  careers: [
    {
      company: 'RHight',
      role: '백엔드 개발자 · 모바일1팀',
      period: '2024.02 ~ 재직중',
      duration: '2년 0개월',
      fileName: 'RHight_재직증빙.pdf',
      fileType: 'application/pdf',
      fileUrl: 'data:text/plain;charset=utf-8,RHight%20%EA%B2%BD%EB%A0%A5%20%EC%A6%9D%EB%B9%99%20%EB%8D%94%EB%AF%B8%20%ED%8C%8C%EC%9D%BC'
    },
    {
      company: '네이버',
      role: '서버 개발자 · 플랫폼개발팀',
      period: '2021.03 ~ 2024.01',
      duration: '2년 11개월',
      fileName: 'Naver_경력증빙.pdf',
      fileType: 'application/pdf',
      fileUrl: 'data:text/plain;charset=utf-8,Naver%20%EA%B2%BD%EB%A0%A5%20%EC%A6%9D%EB%B9%99%20%EB%8D%94%EB%AF%B8%20%ED%8C%8C%EC%9D%BC'
    },
    {
      company: '카카오',
      role: '백엔드 개발자 · 서비스개발팀',
      period: '2019.07 ~ 2021.02',
      duration: '1년 8개월',
      fileName: 'Kakao_경력증빙.pdf',
      fileType: 'application/pdf',
      fileUrl: 'data:text/plain;charset=utf-8,Kakao%20%EA%B2%BD%EB%A0%A5%20%EC%A6%9D%EB%B9%99%20%EB%8D%94%EB%AF%B8%20%ED%8C%8C%EC%9D%BC'
    }
  ],
  skills: [
    {
      type: '자격증',
      name: '정보처리기사',
      issuer: '한국산업인력공단',
      date: '2023.06',
      status: '유효',
      fileName: '정보처리기사_증빙.pdf',
      fileType: 'application/pdf',
      fileUrl: 'data:text/plain;charset=utf-8,%EC%A0%95%EB%B3%B4%EC%B2%98%EB%A6%AC%EA%B8%B0%EC%82%AC%20%EC%A6%9D%EB%B9%99%20%EB%8D%94%EB%AF%B8%20%ED%8C%8C%EC%9D%BC'
    },
    {
      type: '어학',
      name: 'TOEIC 920',
      issuer: 'ETS',
      date: '2024.01',
      status: '유효',
      fileName: 'TOEIC_920_증빙.pdf',
      fileType: 'application/pdf',
      fileUrl: 'data:text/plain;charset=utf-8,TOEIC%20920%20%EC%A6%9D%EB%B9%99%20%EB%8D%94%EB%AF%B8%20%ED%8C%8C%EC%9D%BC'
    },
    {
      type: '자격증',
      name: 'SQLD',
      issuer: '한국데이터산업진흥원',
      date: '2023.09',
      status: '유효',
      fileName: 'SQLD_증빙.pdf',
      fileType: 'application/pdf',
      fileUrl: 'data:text/plain;charset=utf-8,SQLD%20%EC%A6%9D%EB%B9%99%20%EB%8D%94%EB%AF%B8%20%ED%8C%8C%EC%9D%BC'
    }
  ]
}

export const createHrMyPageUserMock = () => structuredClone(hrMyPageUserMock)
