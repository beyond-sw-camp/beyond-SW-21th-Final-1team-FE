import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAttendanceStore = defineStore('attendance', () => {
    // --- State ---

    // 1. Daily Attendance Data (Mock)
    // Used in AttendanceManage (Admin) and AttendanceRecord (User)
    const dailyAttendance = ref(Array.from({ length: 15 }, (_, i) => {
        const isLate = i % 5 === 0
        const isAbsent = i === 7
        const isLeave = i === 12

        let status = 'normal'
        if (isLate) status = 'late'
        else if (isAbsent) status = 'absent'
        else if (isLeave) status = 'leave'

        // Assigning specific user IDs for testing
        // User 0 (Kim Cheolsu) will be our test 'user1' (Assume 'user1' is Kim Cheolsu)
        // Admin is admin1234

        return {
            id: i,
            userId: i === 0 ? 'user1' : `user${i + 1}`,
            name: ['김철수', '이영희', '박민수', '최자바', '정뷰', '홍길동', '김서버', '이디비', '박프론', '최백엔'][i % 10],
            position: ['사원', '대리', '과장', '팀장'][i % 4],
            deptName: ['개발팀', '인사팀', '영업팀'][i % 3],
            date: `2026-02-${String(10 + i).padStart(2, '0')}`,
            checkIn: isAbsent || isLeave ? null : (isLate ? '09:45' : '08:50'),
            checkOut: isAbsent || isLeave ? null : '18:10',
            workHours: isAbsent || isLeave ? '0h' : '8h 20m',
            status: status
        }
    }))

    // 2. Leave Requests Data (Mock)
    // Used in AttendanceManage (Admin) and AttendanceHistory (User)
    const leaveRequests = ref([
        { id: 101, userId: 'user1', name: '김철수', position: '사원', deptName: '개발팀', type: '연차', title: '연차 신청 (1일)', period: '2026-02-20', days: 1, reason: '개인 사정', status: 'pending', appliedAt: '2026-02-10', targetDate: '2026-02-20', approver: 'Steve 매니저' },
        { id: 102, userId: 'user2', name: '이영희', position: '대리', deptName: '개발팀', type: '반차', title: '반차 신청 (오후)', period: '2026-02-21 (오후)', days: 0.5, reason: '병원 진료', status: 'approved', appliedAt: '2026-02-12', targetDate: '2026-02-21', approver: 'Steve 매니저' },
        { id: 103, userId: 'user3', name: '홍길동', position: '과장', deptName: '영업팀', type: '연차', title: '연차 신청 (2일)', period: '2026-02-24 ~ 02-25', days: 2, reason: '가족 여행', status: 'pending', appliedAt: '2026-02-15', targetDate: '2026-02-24', approver: 'Steve 매니저' },
        // More mock data for history view
        { id: 104, userId: 'user1', name: '김철수', position: '사원', deptName: '개발팀', type: '연장', title: '연장근무 신청 (2h)', period: '2026-02-12', days: 0, reason: '프로젝트 마감', status: 'approved', appliedAt: '2026-02-12', targetDate: '2026-02-12', approver: 'Steve 매니저' },
        { id: 105, userId: 'user1', name: '김철수', position: '사원', deptName: '개발팀', type: '재택', title: '재택근무 신청', period: '2026-02-03', days: 1, reason: '집중 근무', status: 'rejected', appliedAt: '2026-02-02', targetDate: '2026-02-03', approver: 'Kim 이사' },
    ])

    // 3. Flexible Work Plans Data (Mock)
    // Used in FlexibleWorkManage (Admin)
    const flexibleWorkPlans = ref([
        { id: 1, userId: 'user1', name: '김철수', position: '대리', dept: '개발팀', period: '02.23 - 02.27', type: '시차출퇴근', status: 'pending' },
        { id: 2, userId: 'user2', name: '이영희', position: '사원', dept: '개발팀', period: '02.23 - 02.27', type: '선택적근로', status: 'pending' },
        { id: 3, userId: 'user3', name: '박민수', position: '과장', dept: '영업팀', period: '02.23 - 02.27', type: '재택근무', status: 'approved' },
        { id: 4, userId: 'user4', name: '최자바', position: '팀장', dept: '개발팀', period: '02.23 - 02.27', type: '시차출퇴근', status: 'rejected' },
        { id: 5, userId: 'user5', name: '정뷰', position: '사원', dept: '디자인', period: '02.23 - 02.27', type: '시차출퇴근', status: 'pending' },
    ])

    // 4. Current User Check-in/out State
    const checkInTime = ref(null)
    const checkOutTime = ref(null)


    // --- Actions ---

    // Daily Attendance
    const updateDailyAttendance = (id, updates) => {
        const idx = dailyAttendance.value.findIndex(item => item.id === id)
        if (idx !== -1) {
            dailyAttendance.value[idx] = { ...dailyAttendance.value[idx], ...updates }
        }
    }

    // Leave Requests
    const updateLeaveStatus = (id, status, rejectReason = '') => {
        const idx = leaveRequests.value.findIndex(item => item.id === id)
        if (idx !== -1) {
            leaveRequests.value[idx].status = status
            if (status === 'rejected' && rejectReason) {
                leaveRequests.value[idx].rejectReason = rejectReason
            }
        }
    }

    // Flexible Work Plans
    const updateFlexibleStatus = (id, status, rejectReason = '') => {
        const idx = flexibleWorkPlans.value.findIndex(item => item.id === id)
        if (idx !== -1) {
            flexibleWorkPlans.value[idx].status = status
            if (status === 'rejected' && rejectReason) {
                flexibleWorkPlans.value[idx].rejectReason = rejectReason
            }
        }
    }

    const setCheckInTime = (time) => {
        checkInTime.value = time
    }

    const setCheckOutTime = (time) => {
        checkOutTime.value = time
    }


    const formatDateKey = (date) => {
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
    }

    const parseTimeToMinutes = (timeText) => {
        if (!timeText) return null
        const [h, m] = String(timeText).split(':').map(Number)
        if (Number.isNaN(h) || Number.isNaN(m)) return null
        return h * 60 + m
    }

    const minutesToText = (minutes) => {
        const safe = Math.max(0, Math.floor(minutes || 0))
        const h = Math.floor(safe / 60)
        const m = safe % 60
        return `${h}h ${String(m).padStart(2, '0')}m`
    }

    const upsertMyDailyAttendance = ({ date = new Date(), checkIn, checkOut, status = 'normal' } = {}) => {
        const dateKey = formatDateKey(date)
        const targetIdx = dailyAttendance.value.findIndex((item) => item.userId === 'user1' && item.date === dateKey)

        const inMin = parseTimeToMinutes(checkIn)
        const outMin = parseTimeToMinutes(checkOut)
        const workMinutes = inMin !== null && outMin !== null && outMin >= inMin ? outMin - inMin : null

        const payload = {
            userId: 'user1',
            name: '김철수',
            position: '사원',
            deptName: '개발팀',
            date: dateKey,
            checkIn: checkIn || null,
            checkOut: checkOut || null,
            workHours: workMinutes !== null ? minutesToText(workMinutes) : '0h',
            status
        }

        if (targetIdx !== -1) {
            dailyAttendance.value[targetIdx] = {
                ...dailyAttendance.value[targetIdx],
                ...payload
            }
            return
        }

        dailyAttendance.value.unshift({
            id: Date.now(),
            ...payload
        })
    }

    // Getters for User View (assuming 'user1' is the current user)
    // In a real app, this would use the auth store to get the current user ID
    const myLeaveRequests = computed(() => {
        // For demo purposes, we will return requests for 'user1' (Kim Cheolsu)
        // or we can just mock it to return a mix if we want to show more data.
        // Let's stick to 'user1' as the "current user"
        return leaveRequests.value.filter(req => req.userId === 'user1')
    })

    return {
        dailyAttendance,
        leaveRequests,
        flexibleWorkPlans,
        updateDailyAttendance,
        updateLeaveStatus,
        updateFlexibleStatus,
        myLeaveRequests,
        checkInTime,
        checkOutTime,
        setCheckInTime,
        setCheckOutTime,
        upsertMyDailyAttendance
    }
})
