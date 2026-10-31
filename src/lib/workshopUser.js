const profileStorageKey = (userId) => `workshop_profile_${userId}`;

function readProfile(userId) {
  const key = profileStorageKey(userId);
  const storedProfile = localStorage.getItem(key);
  if (!storedProfile) return {};

  try {
    const profile = JSON.parse(storedProfile);
    return profile && typeof profile === 'object' && !Array.isArray(profile) ? profile : {};
  } catch {
    localStorage.removeItem(key);
    return {};
  }
}

export function toWorkshopUser(authUser) {
  if (!authUser?.id) return null;

  const metadata = authUser.user_metadata || {};
  const profile = readProfile(authUser.id);
  const displayName = metadata.full_name || metadata.name || authUser.email || 'Workshop Student';

  return {
    ...profile,
    id: authUser.id,
    name: profile.name || displayName,
    studentId: profile.studentId || metadata.student_id || authUser.email || '',
    college: profile.college || metadata.college || '',
    department: profile.department || metadata.department || '',
    email: authUser.email || '',
    xp: profile.xp ?? 0,
    level: profile.level || 'Apprentice',
    safetyScore: profile.safetyScore ?? 100,
    accuracy: profile.accuracy ?? 100,
    completedMissions: profile.completedMissions ?? 0,
    machinesExplored: profile.machinesExplored ?? 0,
    completedMissionsList: profile.completedMissionsList || [],
    badges: profile.badges || []
  };
}

export function saveWorkshopUser(user) {
  if (!user?.id) return;
  localStorage.setItem(profileStorageKey(user.id), JSON.stringify(user));
}
