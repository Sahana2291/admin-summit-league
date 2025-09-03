import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

// Run snapshot updates every 30 minutes
crons.interval('update-snapshots', { minutes: 30 }, internal.snapshots.updateAllSnapshots, {})

// Check for league activation every hour
crons.interval(
    'activate-scheduled-leagues',
    { minutes: 60 },
    internal.leagues.activateScheduledLeagues,
    {}
)

// Update league participant counts and prize pools every 15 minutes
crons.interval(
    'update-league-stats',
    { minutes: 15 },
    internal.leagues.updateAllLeagueStats,
    {}
)

// Check and deactivate expired leagues every hour
crons.interval(
    'check-expired-leagues',
    { minutes: 60 },
    internal.leagues.checkAndDeactivateExpiredLeagues,
    {}
)

// Daily check at 6 AM UTC to ensure proper league management
crons.daily(
    'daily-league-maintenance',
    { hourUTC: 6, minuteUTC: 0 },
    internal.leagues.dailyLeagueMaintenance,
    {}
)

export default crons
