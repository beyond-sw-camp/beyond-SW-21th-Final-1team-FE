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
      <strong>전체 인원 {{ memberTotal }}명</strong>
      <span v-if="canViewMemberDetail" class="permission-text"></span>
    </section>

    <section class="team-filter-bar">
      <label for="teamFilter">팀 필터</label>
      <select id="teamFilter" v-model="selectedTeam">
        <option value="">전체</option>
        <option v-for="team in teamOptions" :key="team" :value="team">{{ team }}</option>
      </select>
    </section>

    <section v-for="group in groupedMembers" :key="group.teamName" class="team-section">
      <div class="team-section-head">
        <strong>{{ group.teamName }}</strong>
        <span>{{ group.members.length }}명</span>
      </div>
      <div class="member-grid">
        <article
          v-for="member in group.members"
          :key="member.employeeId"
          class="member-card"
          :class="{ clickable: canViewMemberDetail }"
          @click="openMemberDetail(member)"
        >
          <div class="profile-top">
            <div class="profile-avatar">
              <img
                v-if="member.profileFileUrl"
                :src="member.profileFileUrl"
                alt="프로필 이미지"
                class="profile-avatar-image"
              />
              <span v-else>{{ member.profileInitial }}</span>
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
            <div class="row"><span>소속팀</span><strong>{{ member.orgName }}</strong></div>
            <div class="row"><span>직책/직무/직위</span><strong>{{ member.duty }} · {{ member.job }} · {{ member.position }}</strong></div>
          </div>
        </article>
      </div>
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
            <div v-if="selectedMember.skills?.length" class="list-scroll">
              <div v-for="(skill, idx) in selectedMember.skills" :key="`${selectedMember.employeeId}-${idx}`" class="skill-item">
                <strong>{{ skill.name }}</strong>
                <span>{{ skill.type }} · {{ skill.date }}</span>
                <div class="item-actions">
                  <button type="button" class="link-btn" @click="openSkillEvidence(skill)">증빙 조회</button>
                </div>
              </div>
            </div>
            <p v-else class="empty-text">등록된 역량 정보가 없습니다.</p>
          </section>

          <section class="detail-card">
            <h3>경력사항</h3>
            <div v-if="selectedMember.careers?.length" class="list-scroll">
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

          <section class="detail-card detail-card-full">
            <h3>인사 히스토리</h3>
            <div v-if="selectedMember.hrHistories?.length" class="history-list">
              <div
                v-for="(history, idx) in selectedMember.hrHistories"
                :key="`${selectedMember.employeeId}-history-${idx}`"
                class="history-item"
              >
                <div class="history-top">
                  <span class="history-type">{{ history.eventTypeDescription || history.eventType || '-' }}</span>
                  <strong>{{ history.eventTitle || '-' }}</strong>
                </div>
                <div class="history-meta">
                  <span>적용일: {{ history.effectiveFrom || '-' }}</span>
                  <span>종료일: {{ history.effectiveTo || '-' }}</span>
                </div>
                <template v-if="history.changeItems?.length">
                  <p
                    v-for="(change, changeIdx) in history.changeItems"
                    :key="`${history.hrEventId}-change-${changeIdx}`"
                    class="history-change"
                  >
                    {{ change.label }}: {{ change.before || '-' }} → {{ change.after || '-' }}
                  </p>
                </template>
                <template v-else>
                  <p class="history-change">변경 전: {{ history.beforeChange || '-' }}</p>
                  <p class="history-change">변경 후: {{ history.afterChange || '-' }}</p>
                </template>
                <p class="history-change">사유: {{ history.reason || '-' }}</p>
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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseModal from '@/components/common/BaseModal.vue'
import { getSessionRoleCodes } from '@/utils/auth'
import { usePerformanceStore } from '@/store/performance'
import {
  getMyOrganizationMembers,
  getOrganizationMemberCareerEvidence,
  getOrganizationMemberDetail,
  getOrganizationMemberSkillEvidence,
} from '@/api/hr'

const router = useRouter()
const performanceStore = usePerformanceStore()

const teamMembers = ref([])
const memberTotal = ref(0)
const selectedTeam = ref('')

const showDetailModal = ref(false)
const selectedMember = ref(null)

const canViewMemberDetail = computed(() => {
  const roleCodes = getSessionRoleCodes()
  return roleCodes.includes('EVALUATOR') || roleCodes.includes('ROLE_EVALUATOR')
})
const sortedTeamMembers = computed(() => [...teamMembers.value])
const teamOptions = computed(() => {
  const names = [...new Set(sortedTeamMembers.value.map((item) => item.orgName).filter(Boolean))]
  return names.sort((a, b) => a.localeCompare(b, 'ko'))
})
const filteredMembers = computed(() => {
  if (!selectedTeam.value) return sortedTeamMembers.value
  return sortedTeamMembers.value.filter((item) => item.orgName === selectedTeam.value)
})
const groupedMembers = computed(() => {
  const grouped = new Map()
  for (const member of filteredMembers.value) {
    const teamName = member.orgName || '미분류'
    if (!grouped.has(teamName)) {
      grouped.set(teamName, [])
    }
    grouped.get(teamName).push(member)
  }
  return [...grouped.entries()].map(([teamName, members]) => ({ teamName, members }))
})

const parseChangeMap = (raw) => {
  if (!raw || typeof raw !== 'string') return {}
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const separatorIdx = part.indexOf(':')
      if (separatorIdx < 0) return acc
      const key = part.slice(0, separatorIdx).trim()
      const value = part.slice(separatorIdx + 1).trim()
      if (key) acc[key] = value
      return acc
    }, {})
}

const buildChangedItems = (beforeRaw, afterRaw) => {
  const beforeMap = parseChangeMap(beforeRaw)
  const afterMap = parseChangeMap(afterRaw)
  const keys = [...new Set([...Object.keys(beforeMap), ...Object.keys(afterMap)])]
  return keys
    .filter((key) => (beforeMap[key] || '') !== (afterMap[key] || ''))
    .map((key) => ({
      label: key,
      before: beforeMap[key] || '',
      after: afterMap[key] || '',
    }))
}

const toSkillCategoryLabel = (category) => {
  const map = {
    CERTIFICATE: '자격',
    LANGUAGE: '어학',
  }
  return map[category] || category || '-'
}

const mapMember = (row) => ({
  employeeId: row.employeeId,
  name: row.employeeName,
  profileInitial: String(row.employeeName || '').slice(-2) || '직원',
  profileFileUrl: row.profileFileUrl || '',
  orgId: row.orgId,
  orgName: row.orgName || '-',
  extension: row.extensionNum || '-',
  phone: row.phone || '-',
  email: row.email || '-',
  duty: row.positionName || '-',
  job: row.jobName || '-',
  position: row.rankName || '-',
  status: row.employeeStateDescription || '-',
})

const loadMembers = async () => {
  try {
    const pageData = await getMyOrganizationMembers(1)
    const content = Array.isArray(pageData?.content) ? pageData.content : []
    teamMembers.value = content.map(mapMember)
    memberTotal.value = Number(pageData?.totalElements || content.length || 0)
  } catch (error) {
    teamMembers.value = []
    memberTotal.value = 0
    alert(error?.response?.data?.error?.message || '내 조직 구성원 조회에 실패했습니다.')
  }
}

const openMemberDetail = async (member) => {
  if (!canViewMemberDetail.value) return
  try {
    const detail = await getOrganizationMemberDetail(member.employeeId)
    selectedMember.value = {
      employeeId: member.employeeId,
      name: detail?.personalInfo?.employeeName || member.name,
      email: detail?.personalInfo?.email || member.email,
      phone: detail?.personalInfo?.phone || member.phone,
      extension: detail?.personalInfo?.extensionNum || member.extension,
      personalInfo: {
        birthDate: detail?.personalInfo?.birthDate || '-',
      },
      hrInfo: {
        organization: detail?.hrInfo?.orgName || '-',
        dutyJobPosition: `${detail?.hrInfo?.positionName || '-'} · ${detail?.hrInfo?.jobName || '-'} · ${detail?.hrInfo?.rankName || '-'}`,
        employmentStatus: detail?.hrInfo?.employeeStateDescription || '-',
        hireDate: detail?.hrInfo?.hireDate || '-',
        workType: detail?.hrInfo?.employTypeDescription || '-',
        workRegion: detail?.hrInfo?.areaName || '-',
      },
      skills: (detail?.skills || []).map((skill) => ({
        skillId: skill.skillId,
        name: skill.skillName,
        type: toSkillCategoryLabel(skill.category),
        date: skill.acquisitionDate || '-',
      })),
      careers: (detail?.careers || []).map((career) => ({
        careerId: career.careerId,
        company: career.companyName,
        role: career.orgName,
        period: `${career.startDate || '-'} ~ ${career.endDate || '재직중'}`,
      })),
      hrHistories: (detail?.hrHistories || []).map((history) => ({
        hrEventId: history.hrEventId,
        eventType: history.eventType,
        eventTypeDescription: history.eventTypeDescription,
        eventTitle: history.eventTitle,
        effectiveFrom: history.effectiveFrom,
        effectiveTo: history.effectiveTo,
        reason: history.reason,
        beforeChange: history.beforeChange,
        afterChange: history.afterChange,
        changeItems: buildChangedItems(history.beforeChange, history.afterChange),
      })),
    }
    showDetailModal.value = true
  } catch (error) {
    alert(error?.response?.data?.error?.message || '구성원 상세 조회에 실패했습니다.')
  }
}

const goToTeamAttendance = () => {
  router.push('/attendance/team')
}

const goToPerformanceInquiry = () => {
  performanceStore.setPage('inquiry')
  router.push('/performance')
}

const statusClass = (status) => {
  if (status === '재직') return 'ok'
  if (status === '휴직') return 'remote'
  return 'leave'
}

const openSkillEvidence = async (skill) => {
  if (!selectedMember.value?.employeeId || !skill?.skillId) return
  try {
    const response = await getOrganizationMemberSkillEvidence(selectedMember.value.employeeId, skill.skillId)
    if (response?.fileUrl) {
      window.open(response.fileUrl, '_blank', 'noopener,noreferrer')
    }
  } catch (error) {
    alert(error?.response?.data?.error?.message || '역량 증빙 조회에 실패했습니다.')
  }
}

const openCareerEvidence = async (career) => {
  if (!selectedMember.value?.employeeId || !career?.careerId) return
  try {
    const response = await getOrganizationMemberCareerEvidence(selectedMember.value.employeeId, career.careerId)
    if (response?.fileUrl) {
      window.open(response.fileUrl, '_blank', 'noopener,noreferrer')
    }
  } catch (error) {
    alert(error?.response?.data?.error?.message || '경력 증빙 조회에 실패했습니다.')
  }
}

onMounted(async () => {
  await loadMembers()
})
</script>

<style scoped>
.org-page { width: 100%; max-width: none; min-width: 0; }

.breadcrumb { font-size: .78rem; color: var(--gray400); margin-bottom: 4px; }

.page-head {
  margin-top: 8px;
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
  border: 1px solid #dbe3ef;
  border-radius: var(--radius);
  box-shadow: 0 8px 24px rgba(15, 23, 42, .04);
  padding: 12px 16px;
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
  font-size: 1.24rem;
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
  height: 32px;
  padding: 0 10px;
  border-radius: 10px;
  font-size: .8rem;
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
  margin-top: 8px;
  background: #f8fbff;
  border: 1px solid #dbe6f3;
  border-radius: var(--radius);
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #52637a;
  font-size: .82rem;
}

.permission-text {
  color: #0EA5E9;
  font-weight: 700;
}

.team-filter-bar {
  margin-top: 8px;
  background: #f8fbff;
  border: 1px solid #dbe6f3;
  border-radius: var(--radius);
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  min-width: 320px;
}

.team-filter-bar label {
  font-size: .82rem;
  color: var(--gray500);
  font-weight: 600;
}

.team-filter-bar select {
  min-width: 220px;
  height: 34px;
  border: 1px solid #cfdae8;
  border-radius: 10px;
  padding: 0 12px;
  background: #fff;
  color: var(--gray700);
  font-size: .84rem;
}

.team-filter-bar select:focus {
  outline: none;
  border-color: #0EA5E9;
}

.team-section {
  margin-top: 10px;
  background: #f9fbff;
  border: 1px solid #dbe6f3;
  border-radius: 14px;
  padding: 10px;
}

.team-section-head {
  height: 38px;
  background: transparent;
  border: none;
  border-bottom: 1px dashed #d6e0ee;
  border-radius: 0;
  padding: 0 4px 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.team-section-head strong {
  color: var(--gray800);
  font-size: .95rem;
}

.team-section-head span {
  color: #66778f;
  font-size: .82rem;
  font-weight: 600;
}

.member-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.member-card {
  background: #fff;
  border: 1px solid #e1e8f3;
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(15, 23, 42, .04);
  padding: 12px;
  transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease;
}

.member-card.clickable {
  cursor: pointer;
}

.member-card.clickable:hover {
  border-color: #8fc7ff;
  box-shadow: 0 10px 24px rgba(2, 132, 199, .12);
  transform: translateY(-1px);
}

.profile-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.profile-avatar {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #A5F3FC, #0891B2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.profile-avatar span {
  color: #fff;
  font-weight: 800;
  font-size: .82rem;
}

.profile-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-head strong {
  font-size: .98rem;
  color: var(--gray800);
}

.status {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: .68rem;
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
  gap: 6px;
}

.row {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 6px;
  font-size: .76rem;
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
  min-height: 190px;
  max-height: 190px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.detail-card-full {
  grid-column: 1 / -1;
  min-height: 240px;
  max-height: 240px;
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

.list-scroll {
  display: grid;
  gap: 8px;
  min-height: 0;
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
  min-height: 0;
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

  .detail-card,
  .detail-card-full {
    min-height: 220px;
    max-height: 220px;
  }

  .team-filter-bar {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    min-width: 0;
  }

  .team-filter-bar select {
    min-width: 100%;
    width: 100%;
  }
}

@media (max-width: 1500px) {
  .member-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1200px) {
  .member-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
