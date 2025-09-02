import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

// Run snapshot updates every 30 minutes
crons.interval('update-snapshots', { minutes: 30 }, internal.snapshots.updateAllSnapshots, {})

export default crons
