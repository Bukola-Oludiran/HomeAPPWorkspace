-- Plan A9 / S2-follow-up: maintenance urgency -> priority cleanup.
--
-- The maintenance_requests table has two enum columns that hold the
-- same logical value: `urgency` (legacy) and `priority` (current).
-- Pre-rename, the application service wrote only to `urgency` and
-- ignored `priority` (it stayed at the MEDIUM default for every row).
-- Post-rename, the service writes only to `priority`.
--
-- This migration backfills existing rows so the new read-path
-- (`priority`) matches the historical write-path (`urgency`). The
-- redundant `urgency` column itself is intentionally NOT dropped here
-- — that move is reversible only by restoring a backup, so it lives
-- in a separate, ops-gated migration that runs after this backfill
-- has been verified in production.

UPDATE "maintenance_requests"
SET    "priority" = "urgency"
WHERE  "priority" IS DISTINCT FROM "urgency";

-- Verify: at this point every row has priority = urgency. The
-- application no longer reads or writes urgency; the column is dead
-- weight until the follow-up migration drops it.
