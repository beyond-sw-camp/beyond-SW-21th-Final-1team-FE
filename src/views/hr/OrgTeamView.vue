<template>
  <div class="org-page">
    <div class="breadcrumb">인사 / 내 조직 조회</div>

    <section class="page-head">
      <div class="title-wrap">
        <h1>내 조직 조회</h1>
      </div>
      <div v-if="canViewMemberDetail" class="head-actions">
        <button class="btn-head btn-head-muted" type="button" @click="goToTeamAttendance">근태</button>
        <button class="btn-head btn-head-muted" type="button" @click="goToPerformanceInquiry">목표</button>
      </div>
    </section>

    <section class="info-bar">
      <strong>{{ currentUser.teamName }}</strong>
      <span>팀원 {{ sortedTeamMembers.length }}명</span>
      <span v-if="canViewMemberDetail" class="permission-text"></span>
    </section>

    <section class="member-grid">
      <article
        v-for="member in sortedTeamMembers"
        :key="member.employeeId"
        class="member-card"
        :class="{ clickable: canViewMemberDetail }"
        @click="openMemberDetail(member)"
      >
        <div class="profile-top">
          <div class="profile-avatar">
            <span>{{ member.profileInitial }}</span>
          </div>
          <div class="profile-head">
            <strong>{{ member.name }}</strong>
            <span class="status" :class="statusClass(member.status)">{{ member.status }}</span>
          </div>
        </div>

        <div class="member-rows">
          <div class="row"><span>내선</span><strong>{{ member.extension }}</strong></div>
          <div class="row"><span>연락처</span><strong>{{ member.phone }}</strong></div>
          <div class="row"><span>이메일</span><strong>{{ member.email }}</strong></div>
          <div class="row"><span>직책/직무/직위</span><strong>{{ member.duty }} · {{ member.job }} · {{ member.position }}</strong></div>
        </div>
      </article>
    </section>

    <BaseModal v-model="showDetailModal" width="760px">
      <div v-if="selectedMember" class="member-detail">
        <div class="detail-head">
          <div>
            <h2>{{ selectedMember.name }} 인사 정보</h2>
          </div>
        </div>

        <div class="detail-sections">
          <section class="detail-card">
            <h3>개인 정보</h3>
            <div class="detail-row"><span>이름</span><strong>{{ selectedMember.name }}</strong></div>
            <div class="detail-row"><span>이메일</span><strong>{{ selectedMember.email }}</strong></div>
            <div class="detail-row"><span>연락처</span><strong>{{ selectedMember.phone }}</strong></div>
            <div class="detail-row"><span>내선번호</span><strong>{{ selectedMember.extension }}</strong></div>
            <div class="detail-row"><span>생년월일</span><strong>{{ selectedMember.personalInfo?.birthDate || '-' }}</strong></div>
          </section>

          <section class="detail-card">
            <h3>인사 정보</h3>
            <div class="detail-row"><span>조직</span><strong>{{ selectedMember.hrInfo?.organization || '-' }}</strong></div>
            <div class="detail-row"><span>직책/직무/직위</span><strong>{{ selectedMember.hrInfo?.dutyJobPosition || '-' }}</strong></div>
            <div class="detail-row"><span>재직 상태</span><strong>{{ selectedMember.hrInfo?.employmentStatus || '-' }}</strong></div>
            <div class="detail-row"><span>입사일</span><strong>{{ selectedMember.hrInfo?.hireDate || '-' }}</strong></div>
            <div class="detail-row"><span>근무 형태</span><strong>{{ selectedMember.hrInfo?.workType || '-' }}</strong></div>
            <div class="detail-row"><span>근무 지역</span><strong>{{ selectedMember.hrInfo?.workRegion || '-' }}</strong></div>
          </section>

          <section class="detail-card">
            <h3>역량 정보</h3>
            <div v-if="selectedMember.skills?.length" class="skill-list">
              <div v-for="(skill, idx) in selectedMember.skills" :key="`${selectedMember.employeeId}-${idx}`" class="skill-item">
                <strong>{{ skill.name }}</strong>
                <span>{{ skill.type }} · {{ skill.issuer }} · {{ skill.date }}</span>
                <div class="item-actions">
                  <button type="button" class="link-btn" @click="openSkillEvidence(skill)">증빙 조회</button>
                </div>
              </div>
            </div>
            <p v-else class="empty-text">등록된 역량 정보가 없습니다.</p>
          </section>

          <section class="detail-card">
            <h3>경력사항</h3>
            <div v-if="selectedMember.careers?.length" class="career-list">
              <div
                v-for="(career, idx) in selectedMember.careers"
                :key="`${selectedMember.employeeId}-career-${idx}`"
                class="career-item"
              >
                <strong>{{ career.company }}</strong>
                <span>{{ career.role }}</span>
                <span class="font-num">{{ career.period }}</span>
                <div class="item-actions">
                  <button type="button" class="link-btn" @click="openCareerEvidence(career)">증빙 조회</button>
                </div>
              </div>
            </div>
            <p v-else class="empty-text">등록된 경력사항이 없습니다.</p>
          </section>

          <section class="detail-card history-card">
            <h3>인사 히스토리</h3>
            <div v-if="selectedMemberHistories.length" class="history-list">
              <div
                v-for="history in selectedMemberHistories"
                :key="history.hr_event_id"
                class="history-item"
              >
                <div class="history-top">
                  <span class="history-type">{{ history.event_type }}</span>
                  <strong>{{ history.event_title }}</strong>
                </div>
                <div class="history-meta">
                  <span>적용일: {{ history.effective_from }}</span>
                  <span>상태: {{ historyStatusText(history.event_status) }}</span>
                </div>
                <p class="history-change">{{ history.before_value }} → {{ history.after_value }}</p>
              </div>
            </div>
            <p v-else class="empty-text">등록된 인사 히스토리가 없습니다.</p>
          </section>
        </div>

        <div class="detail-actions">
          <button type="button" class="btn-ghost" @click="showDetailModal = false">닫기</button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseModal from '@/components/common/BaseModal.vue'
import { AUTH_KEYS } from '@/utils/auth'
import { usePerformanceStore } from '@/store/performance'
import {
  createHrCurrentUserMock,
  createHrTeamMembersMock,
  sortMembersByRule
} from '@/mocks/hr/organization'
import { createHrEventsMock } from '@/mocks/hr/hrEvents'

const router = useRouter()
const performanceStore = usePerformanceStore()

const currentUser = ref(createHrCurrentUserMock())
const teamMembers = ref(createHrTeamMembersMock())
const hrEvents = ref(createHrEventsMock())

const showDetailModal = ref(false)
const selectedMember = ref(null)

const canViewMemberDetail = computed(() => sessionStorage.getItem(AUTH_KEYS.userId) === 'admin1234')
const sortedTeamMembers = computed(() => sortMembersByRule(teamMembers.value))
const selectedMemberHistories = computed(() => {
  if (!selectedMember.value?.employeeId) return []
  return hrEvents.value
    .filter((item) => item.employee_id === selectedMember.value.employeeId)
    .sort(
      (a, b) =>
        Number(String(b.effective_from).replaceAll('.', '')) -
        Number(String(a.effective_from).replaceAll('.', ''))
    )
})

const openMemberDetail = (member) => {
  if (!canViewMemberDetail.value) return
  selectedMember.value = member
  showDetailModal.value = true
}

const goToTeamAttendance = () => {
  router.push('/attendance/team')
}

const goToPerformanceInquiry = () => {
  performanceStore.setPage('inquiry')
  router.push('/performance')
}

const statusClass = (status) => {
  if (status === '정상') return 'ok'
  if (status === '재택') return 'remote'
  return 'leave'
}

const historyStatusText = (status) => {
  if (status === 'APPROVED') return '완료'
  if (status === 'REJECTED') return '반려'
  return '진행중'
}

const openDataUrl = (url) => {
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

const buildSkillEvidenceFallback = (skill) => {
  const text = `${skill?.name || '역량'} 증빙 더미 파일`
  return `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`
}

const buildCareerEvidenceFallback = (career) => {
  const text = `${career?.company || '경력'} 증빙 더미 파일`
  return `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`
}

const openSkillEvidence = (skill) => {
  openDataUrl(skill?.fileUrl || buildSkillEvidenceFallback(skill))
}

const openCareerEvidence = (career) => {
  openDataUrl(career?.fileUrl || buildCareerEvidenceFallback(career))
}
</script>

<style scoped>
.org-page { width: 100%; max-width: none; min-width: 0; }

.breadcrumb { font-size: .78rem; color: var(--gray400); margin-bottom: 4px; }

.page-head {
  margin-top: 12px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-wrap h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--gray800);
}

.view-badge {
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: .74rem;
  font-weight: 700;
  color: #0F766E;
  background: #CCFBF1;
  display: inline-flex;
  align-items: center;
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-head {
  border: 1px solid var(--primary);
  background: var(--accent);
  color: var(--primary);
  height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  font-size: .84rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-head:hover {
  background: var(--primary);
  color: #fff;
}

.btn-head-muted {
  border-color: var(--gray200);
  background: #fff;
  color: var(--gray600);
}

.btn-head-muted:hover {
  background: var(--gray50);
  color: var(--gray700);
}

.info-bar {
  margin-top: 12px;
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: var(--radius);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--gray600);
  font-size: .86rem;
}

.permission-text {
  color: #0EA5E9;
  font-weight: 700;
}

.member-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.member-card {
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 16px;
}

.member-card.clickable {
  cursor: pointer;
}

.member-card.clickable:hover {
  border-color: #7DD3FC;
  box-shadow: 0 10px 24px rgba(2, 132, 199, .12);
}

.profile-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.profile-avatar {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #A5F3FC, #0891B2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar span {
  color: #fff;
  font-weight: 800;
  font-size: .93rem;
}

.profile-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-head strong {
  font-size: 1.08rem;
  color: var(--gray800);
}

.status {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: .72rem;
  font-weight: 700;
}

.status.ok {
  background: #DCFCE7;
  color: #16A34A;
}

.status.remote {
  background: #DBEAFE;
  color: #2563EB;
}

.status.leave {
  background: #FEF3C7;
  color: #D97706;
}

.member-rows {
  display: grid;
  gap: 8px;
}

.row {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  gap: 8px;
  font-size: .84rem;
}

.row span {
  color: var(--gray500);
}

.row strong {
  color: var(--gray800);
  word-break: break-word;
}

.member-detail {
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: min(78vh, 820px);
}

.detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-head h2 {
  margin: 0;
  color: var(--gray800);
  font-size: 1.32rem;
}

.detail-head p {
  margin: 4px 0 0;
  color: var(--gray500);
  font-size: .82rem;
}

.detail-sections {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 4px;
  align-content: start;
}

.detail-card {
  background: #fff;
  border: 1px solid var(--gray200);
  border-radius: 12px;
  padding: 12px;
}

.detail-card:last-child {
  grid-column: 1 / -1;
}

.detail-card h3 {
  margin: 0 0 10px;
  color: var(--gray800);
  font-size: .94rem;
}

.detail-row {
  display: grid;
  grid-template-columns: 98px minmax(0, 1fr);
  gap: 8px;
  font-size: .82rem;
  padding: 5px 0;
}

.detail-row span { color: var(--gray500); }
.detail-row strong { color: var(--gray800); word-break: break-word; }

.skill-list {
  display: grid;
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 2px;
}

.skill-item {
  border: 1px solid var(--gray100);
  border-radius: 8px;
  padding: 8px;
  display: grid;
  gap: 4px;
}

.skill-item strong {
  color: var(--gray800);
  font-size: .86rem;
}

.skill-item span {
  color: var(--gray500);
  font-size: .8rem;
}

.career-list {
  display: grid;
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 2px;
}

.career-item {
  border: 1px solid var(--gray100);
  border-radius: 8px;
  padding: 8px;
  display: grid;
  gap: 3px;
}

.career-item strong {
  color: var(--gray800);
  font-size: .86rem;
}

.career-item span {
  color: var(--gray500);
  font-size: .8rem;
}

.item-actions {
  margin-top: 4px;
}

.link-btn {
  border: none;
  background: transparent;
  color: var(--primary);
  font-size: .8rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.link-btn:hover {
  text-decoration: underline;
}

.history-list {
  max-height: 240px;
  overflow-y: auto;
  display: grid;
  gap: 8px;
}

.history-item {
  border: 1px solid var(--gray100);
  border-radius: 8px;
  background: #fff;
  padding: 8px 10px;
}

.history-top {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.history-top strong {
  color: var(--gray800);
  font-size: .84rem;
}

.history-type {
  height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  font-size: .7rem;
  font-weight: 700;
  color: #0369a1;
  background: #e0f2fe;
}

.history-meta {
  margin-top: 5px;
  display: flex;
  gap: 10px;
  color: var(--gray500);
  font-size: .76rem;
}

.history-change {
  margin: 6px 0 0;
  color: var(--gray700);
  font-size: .8rem;
  font-weight: 600;
}

.empty-text {
  margin: 0;
  color: var(--gray400);
  font-size: .82rem;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-ghost {
  height: 34px;
  border-radius: 10px;
  padding: 0 14px;
  font-size: .84rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-ghost {
  border: 1px solid var(--gray200);
  background: #fff;
  color: var(--gray600);
}

.btn-ghost:hover {
  background: var(--gray50);
}

@media (max-width: 980px) {
  .member-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .detail-sections {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
