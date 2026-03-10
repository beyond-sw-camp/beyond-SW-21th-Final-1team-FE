import { AUTH_KEYS } from '@/utils/auth';
import { mockUsers } from '@/utils/approvalData';

const fallbackUserByLoginId = {
  test1234: { name: '홍길동', position: '사원' },
  admin1234: { name: '정수진', position: '이사' }
};

const normalize = (value) => String(value || '').trim();

export const getCurrentApprovalUser = () => {
  const hasSession = typeof sessionStorage !== 'undefined';
  const userId = hasSession ? normalize(sessionStorage.getItem(AUTH_KEYS.userId)) : '';
  const userName = hasSession ? normalize(sessionStorage.getItem(AUTH_KEYS.userName)) : '';

  const byId = mockUsers.find((user) => user.id === userId);
  const byName = mockUsers.find((user) => user.name === userName);
  const fallback = fallbackUserByLoginId[userId];

  return {
    userId,
    userName,
    name: byId?.name || byName?.name || fallback?.name || userName,
    position: byId?.position || byName?.position || fallback?.position || ''
  };
};

export const matchesCurrentApprovalUser = (label, currentUser) => {
  const text = normalize(label);
  if (!text) return false;

  const name = normalize(currentUser?.name || currentUser?.userName);
  const fullNameWithPosition = normalize(name && currentUser?.position ? `${name} ${currentUser.position}` : '');

  if (fullNameWithPosition && text === fullNameWithPosition) return true;
  if (name && (text === name || text.startsWith(`${name} `))) return true;
  return false;
};

export const isUserRelatedApprovalDocument = (doc, currentUser) => {
  if (!doc) return false;

  if (matchesCurrentApprovalUser(doc.drafter, currentUser)) return true;
  if (matchesCurrentApprovalUser(doc.currentApprover, currentUser)) return true;

  if (Array.isArray(doc.approvalLine) && doc.approvalLine.some((line) => {
    if (!line) return false;
    if (matchesCurrentApprovalUser(line.name, currentUser)) return true;
    return matchesCurrentApprovalUser(`${line.name} ${line.position || ''}`, currentUser);
  })) {
    return true;
  }

  if (Array.isArray(doc.referrers) && doc.referrers.some((referrer) => matchesCurrentApprovalUser(referrer, currentUser))) {
    return true;
  }

  return false;
};

export const isCurrentUserDrafterDocument = (doc, currentUser) => {
  if (!doc) return false;
  return matchesCurrentApprovalUser(doc.drafter, currentUser);
};
