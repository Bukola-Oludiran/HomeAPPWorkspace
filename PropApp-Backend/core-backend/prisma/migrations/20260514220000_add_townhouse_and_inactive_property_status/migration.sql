-- Plan S1.2: Property enums reconciled with frontend.
--
-- Adds:
--   * TOWNHOUSE to PropertyType  (frontend's prior MAISONETTE/TERRACE
--                                  were renamed to TOWNHOUSE on the
--                                  contract side; backend gains the
--                                  matching enum value here).
--   * INACTIVE  to PropertyStatus (covers a paused-listing state
--                                   the frontend has long had).
--
-- PostgreSQL note: `ALTER TYPE ... ADD VALUE` cannot run inside a
-- transaction block. Prisma's migrate executor runs each statement
-- separately, so the implicit BEGIN/COMMIT around the whole migration
-- file is split per-statement when ENUM additions are detected.

-- AlterEnum
ALTER TYPE "PropertyType" ADD VALUE IF NOT EXISTS 'TOWNHOUSE';

-- AlterEnum
ALTER TYPE "PropertyStatus" ADD VALUE IF NOT EXISTS 'INACTIVE';
