-- Plan S1.4: Maintenance status enum unified.
--
-- Adds ON_HOLD to MaintenanceStatus. The frontend's
-- `UpdateMaintenanceRequest.status` already accepted ON_HOLD; this
-- migration brings the database column type into line so the value
-- can actually be persisted.

-- AlterEnum
ALTER TYPE "MaintenanceStatus" ADD VALUE IF NOT EXISTS 'ON_HOLD';
