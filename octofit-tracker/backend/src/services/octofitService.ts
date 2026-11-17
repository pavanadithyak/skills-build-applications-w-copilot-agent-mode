import { Activity, Team, User, Workout } from '../models/index.js';

const objectIdPattern = /^[a-f\d]{24}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isObjectId(value: unknown): value is string {
  return typeof value === 'string' && objectIdPattern.test(value);
}

function badRequest(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(payload: unknown) {
  if (!isRecord(payload)) {
    throw badRequest('Activity input must be an object');
  }

  const { userId, teamId, type, minutes } = payload;
  if (!isObjectId(userId) || !isObjectId(teamId)) {
    throw badRequest('Valid userId and teamId are required');
  }
  if (typeof type !== 'string' || !type.trim()
    || typeof minutes !== 'number' || !Number.isInteger(minutes) || minutes < 1) {
    throw badRequest('A type and positive whole number of minutes are required');
  }

  const [user, team] = await Promise.all([
    User.findById(userId).select('_id').lean(),
    Team.findById(teamId).select('_id').lean(),
  ]);
  if (!user || !team) {
    throw badRequest('The specified user and team must exist');
  }

  const activity = await Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
  return activity;
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(payload: unknown) {
  if (!isRecord(payload)) {
    throw badRequest('Team input must be an object');
  }

  const { name, mascot, members = [] } = payload;
  if (typeof name !== 'string' || !name.trim()) {
    throw badRequest('A team name is required');
  }
  if (typeof mascot !== 'string' || !mascot.trim()) {
    throw badRequest('A team mascot is required');
  }
  if (!Array.isArray(members)) {
    throw badRequest('Team members must be an array of user IDs');
  }

  const memberIds: string[] = [];
  for (const memberId of members) {
    if (!isObjectId(memberId)) {
      throw badRequest('Team members must be valid user IDs');
    }
    memberIds.push(memberId);
  }
  const uniqueMemberIds = [...new Set(memberIds)];
  const users = await User.find({ _id: { $in: uniqueMemberIds } }).select('_id').lean();
  if (users.length !== uniqueMemberIds.length) {
    throw badRequest('All team members must exist');
  }

  return Team.create({
    name: name.trim(),
    mascot: mascot.trim(),
    members: users.map((user) => user._id),
  });
}

export async function getLeaderboard() {
  const teams = await Team.aggregate([
    {
      $lookup: {
        from: Activity.collection.name,
        localField: '_id',
        foreignField: 'team',
        as: 'activities',
      },
    },
    {
      $project: {
        _id: 0,
        teamName: '$name',
        totalPoints: { $sum: '$activities.points' },
      },
    },
    { $sort: { totalPoints: -1, teamName: 1 } },
  ]);
  return teams.map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() })
    .select('_id fitnessGoal')
    .lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const recentActivities = await Activity.find({ user: user._id })
    .sort({ occurredAt: -1 })
    .limit(10)
    .select('type')
    .lean();
  const focusByActivity: Record<string, string> = {
    run: 'endurance',
    cycle: 'endurance',
    strength: 'strength',
    walk: 'mobility',
  };
  const goalFocus = user.fitnessGoal?.trim().toLowerCase();
  const recentFocus = recentActivities
    .map(({ type }) => focusByActivity[type.trim().toLowerCase()] ?? type.trim().toLowerCase())
    .find(Boolean);
  const workouts = await Workout.find().lean();
  const goalMatches = goalFocus
    ? workouts.filter((workout) => workout.focus.trim().toLowerCase() === goalFocus)
    : [];
  const focus = goalMatches.length ? goalFocus : recentFocus;
  if (!focus) return [];

  const matchingWorkouts = goalMatches.length
    ? goalMatches
    : workouts.filter((workout) => workout.focus.trim().toLowerCase() === focus);
  const reason = goalMatches.length
    ? `Recommended for your ${goalFocus} goal.`
    : `Recommended based on your recent ${recentActivities[0]?.type ?? focus} activity.`;
  return matchingWorkouts.map((workout) => ({ ...workout, reason }));
}

export { User };
