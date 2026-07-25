import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Daily: delete proctoring events + sessions (and their snapshot blobs) older
// than the 90-day retention window. See `proctoring.purgeExpired`.
// Scheduled at 03:00 UTC to run off-peak.
crons.daily(
  "purge-old-proctoring-data",
  { hourUTC: 3, minuteUTC: 0 },
  internal.proctoring.purgeExpired,
  {}
);

export default crons;
