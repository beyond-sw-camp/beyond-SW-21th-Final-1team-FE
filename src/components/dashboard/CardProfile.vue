<template>
  <div class="card fade-up delay-1 profile-card">
    <div class="profile-content">
      <div class="avatar">
        <img
          v-if="profileImageUrl"
          :src="profileImageUrl"
          alt="프로필 이미지"
          class="avatar-image"
        />
        <svg v-else width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      </div>
      <div class="profile-name">{{ displayName }}</div>
      <div class="profile-team">{{ displayOrgName }}</div>
      <div class="profile-btns">
        <div class="btn-group">
          <button class="btn-checkin" @click="handleCheckIn">출근</button>
          <div v-if="checkInTime" class="time-display">{{ checkInTime }}</div>
        </div>
        <div class="btn-group">
          <button class="btn-checkout" @click="handleCheckOut">퇴근</button>
          <div v-if="checkOutTime" class="time-display">{{ checkOutTime }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAttendanceStore } from '@/store/attendance'
import { storeToRefs } from 'pinia'
import { getMyPageHeader } from '@/api/hr'
import { AUTH_KEYS } from '@/utils/auth'

const emit = defineEmits(['checkin', 'checkout'])

const store = useAttendanceStore()
const { checkInTime, checkOutTime } = storeToRefs(store)

const profile = ref({
  employeeName: sessionStorage.getItem(AUTH_KEYS.userName) || '',
  orgName: sessionStorage.getItem(AUTH_KEYS.orgName) || '',
  profileFileUrl: '',
})

const displayName = computed(() => profile.value.employeeName || '-')
const displayOrgName = computed(() => profile.value.orgName || '-')
const profileImageUrl = computed(() => profile.value.profileFileUrl || '')

const handleCheckIn = () => {
  return store.clockIn().catch((error) => {
    alert(error.response?.data?.message || '출근 처리에 실패했습니다.')
  })
}

const handleCheckOut = async () => {
  try {
    await store.clockOut()
  } catch (error) {
    alert(error.response?.data?.message || '퇴근 처리에 실패했습니다.')
  }
}

const loadProfileHeader = async () => {
  try {
    const header = await getMyPageHeader()
    profile.value = {
      employeeName: header?.employeeName || profile.value.employeeName,
      orgName: header?.orgName || profile.value.orgName,
      profileFileUrl: header?.profileFileUrl || '',
    }
  } catch (_error) {
    // 대시보드 카드 실패 시에는 세션 정보로만 렌더링
  }
}

onMounted(() => {
  loadProfileHeader()
})
</script>

<style scoped>
.profile-card{height:100%}
.profile-content{text-align:center;padding:24px 16px 20px}
.avatar{
  width:76px;height:76px;border-radius:50%;
  background:linear-gradient(135deg,#94A3B8,#64748B);
  margin:0 auto 4px;display:flex;align-items:center;justify-content:center;
  position:relative;
  overflow:hidden;
}
.avatar-image{width:100%;height:100%;object-fit:cover;display:block}
.profile-name{font-size:1.05rem;font-weight:700;color:var(--gray800);margin-top:10px}
.profile-team{font-size:0.8rem;color:var(--gray500);margin-bottom:16px}
.profile-btns{display:flex;gap:6px}
.btn-group { flex: 1; display: flex; flex-direction: column; gap: 4px; align-items: center; }
.btn-checkin,.btn-checkout{
  width: 100%; padding:9px;border-radius:var(--radius-sm);font-size:0.85rem;font-weight:600;
  transition:all var(--transition);
}
.btn-checkin{background:var(--primary);color:#fff;border:none}
.btn-checkin:hover{background:var(--primary-dark)}
.btn-checkout{background:var(--gray100);color:var(--gray600);border:1px solid var(--gray200)}
.btn-checkout:hover{background:var(--gray200)}
.time-display { font-size: 0.85rem; color: var(--primary); font-weight: 600; margin-top: 2px; }
</style>
