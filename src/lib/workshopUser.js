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
  const displayName = authUser.name || metadata.full_name || metadata.name || authUser.email || 'Workshop Student';

  return {
    ...profile,
    id: authUser.id,
    name: profile.name || displayName,
    studentId: profile.studentId || authUser.studentId || metadata.student_id || authUser.email || 'STU1029',
    college: profile.college || authUser.college || metadata.college || 'PSG College of Technology',
    department: profile.department || authUser.department || metadata.department || 'Mechanical Engineering',
    email: authUser.email || 'student.demo@workshop.edu',
    xp: profile.xp ?? authUser.xp ?? 1240,
    level: profile.level || authUser.level || 'Workshop Apprentice',
    safetyScore: profile.safetyScore ?? authUser.safetyScore ?? 94,
    accuracy: profile.accuracy ?? authUser.accuracy ?? 88,
    completedMissions: profile.completedMissions ?? authUser.completedMissions ?? 12,
    machinesExplored: profile.machinesExplored ?? authUser.machinesExplored ?? 4,
    completedMissionsList: profile.completedMissionsList?.length ? profile.completedMissionsList : (authUser.completedMissionsList || ['lathe_01', 'welding_01', 'milling_01']),
    badges: profile.badges?.length ? profile.badges : (authUser.badges || ['Lathe Beginner', 'Safety First', 'Milling Master'])
  };
}

export function saveWorkshopUser(user) {
  if (!user?.id) return;
  localStorage.setItem(profileStorageKey(user.id), JSON.stringify(user));
}
