<template>
  <div class="card fade-up delay-1 profile-card">
    <div class="profile-content">
      <div class="avatar">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        <div class="avatar-badge">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          </svg>
        </div>
      </div>
      <div class="profile-name">{{ name }} {{ position }}</div>
      <div class="profile-team">{{ team }}</div>
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
import { ref } from 'vue'
import { useAttendanceStore } from '@/store/attendance'
import { storeToRefs } from 'pinia'

defineProps({
  name: { type: String, default: '김봉식' },
  position: { type: String, default: '과장' },
  team: { type: String, default: '모바일 1팀' },
})
const emit = defineEmits(['checkin', 'checkout'])

const store = useAttendanceStore()
const { checkInTime, checkOutTime } = storeToRefs(store)

const handleCheckIn = () => {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  store.setCheckInTime(`${h}:${m}`)
}

const handleCheckOut = () => {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  store.setCheckOutTime(`${h}:${m}`)
}
</script>

<style scoped>
.profile-card{height:100%}
.profile-content{text-align:center;padding:24px 16px 20px}
.avatar{
  width:76px;height:76px;border-radius:50%;
  background:linear-gradient(135deg,#94A3B8,#64748B);
  margin:0 auto 4px;display:flex;align-items:center;justify-content:center;
  position:relative;
}
.avatar-badge{
  position:absolute;bottom:0;right:0;width:20px;height:20px;
  background:var(--primary);border-radius:50%;border:2px solid #fff;
  display:flex;align-items:center;justify-content:center;
}
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
