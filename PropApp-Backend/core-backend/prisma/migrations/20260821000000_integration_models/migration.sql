-- Recreate integration tables removed by the historical AI-session migration.
CREATE TYPE "PayoutStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE "DocumentType" AS ENUM ('IDENTITY', 'INCOME', 'ADDRESS_PROOF', 'LEASE', 'FINANCIAL_REPORT', 'CERTIFICATE', 'OTHER');
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED');
CREATE TYPE "OAuthProvider" AS ENUM ('GOOGLE', 'APPLE', 'FACEBOOK');
CREATE TYPE "ReviewType" AS ENUM ('TENANT_REVIEW', 'LANDLORD_REVIEW', 'AGENT_REVIEW', 'PROPERTY_REVIEW');

CREATE TABLE "sessions" (
  "id" UUID NOT NULL, "user_id" UUID NOT NULL, "token_hash" VARCHAR(255) NOT NULL,
  "device_name" VARCHAR(120), "device_type" VARCHAR(40), "browser" VARCHAR(80), "os" VARCHAR(80),
  "ip_address" VARCHAR(64), "location" JSONB, "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" TIMESTAMP(3) NOT NULL, "revoked_at" TIMESTAMP(3), "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payment_methods" (
  "id" UUID NOT NULL, "user_id" UUID NOT NULL, "type" VARCHAR(20) NOT NULL, "brand" VARCHAR(30),
  "last4" VARCHAR(4) NOT NULL, "expiry_month" INTEGER, "expiry_year" INTEGER, "holder_name" VARCHAR(100),
  "is_default" BOOLEAN NOT NULL DEFAULT false, "provider_token" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL, "deleted_at" TIMESTAMP(3),
  CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bank_accounts" (
  "id" UUID NOT NULL, "user_id" UUID NOT NULL, "bank_code" VARCHAR(10) NOT NULL, "bank_name" VARCHAR(100) NOT NULL,
  "account_number" VARCHAR(255) NOT NULL, "account_number_masked" VARCHAR(20) NOT NULL, "account_name" VARCHAR(100) NOT NULL,
  "account_type" VARCHAR(20) NOT NULL, "currency" VARCHAR(3) NOT NULL DEFAULT 'NGN', "is_default" BOOLEAN NOT NULL DEFAULT false,
  "is_verified" BOOLEAN NOT NULL DEFAULT false, "verified_at" TIMESTAMP(3), "recipient_code" VARCHAR(100),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL, "deleted_at" TIMESTAMP(3),
  CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payouts" (
  "id" UUID NOT NULL, "user_id" UUID NOT NULL, "bank_account_id" UUID NOT NULL, "amount" DECIMAL(15,2) NOT NULL,
  "currency" VARCHAR(3) NOT NULL DEFAULT 'NGN', "status" "PayoutStatus" NOT NULL DEFAULT 'PROCESSING',
  "reference" VARCHAR(100) NOT NULL, "description" VARCHAR(255), "completed_at" TIMESTAMP(3), "failed_at" TIMESTAMP(3),
  "failure_reason" TEXT, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "documents" (
  "id" UUID NOT NULL, "user_id" UUID NOT NULL, "entity_type" VARCHAR(30), "entity_id" UUID,
  "type" "DocumentType" NOT NULL, "subtype" VARCHAR(30), "name" VARCHAR(255) NOT NULL, "filename" VARCHAR(255) NOT NULL,
  "mime_type" VARCHAR(100) NOT NULL, "size" INTEGER NOT NULL, "storage_key" VARCHAR(500) NOT NULL, "thumbnail_key" VARCHAR(500),
  "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING', "expiry_date" TIMESTAMP(3), "metadata" JSONB,
  "verified_at" TIMESTAMP(3), "verified_by" UUID, "rejection_reason" TEXT,
  "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "deleted_at" TIMESTAMP(3),
  CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "connected_accounts" (
  "id" UUID NOT NULL, "user_id" UUID NOT NULL, "provider" "OAuthProvider" NOT NULL,
  "provider_user_id" VARCHAR(255) NOT NULL, "email" VARCHAR(255) NOT NULL, "profile" JSONB,
  "connected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "connected_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reviews" (
  "id" UUID NOT NULL, "reviewer_id" UUID NOT NULL, "reviewee_id" UUID, "property_id" UUID, "lease_id" UUID, "agent_job_id" UUID,
  "type" "ReviewType" NOT NULL, "rating" INTEGER NOT NULL, "title" VARCHAR(255), "content" TEXT,
  "is_public" BOOLEAN NOT NULL DEFAULT true, "is_verified" BOOLEAN NOT NULL DEFAULT false, "response" TEXT,
  "responded_at" TIMESTAMP(3), "report_count" INTEGER NOT NULL DEFAULT 0, "is_hidden" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL, "deleted_at" TIMESTAMP(3),
  CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "sessions_token_hash_idx" ON "sessions"("token_hash");
CREATE INDEX "payment_methods_user_id_idx" ON "payment_methods"("user_id");
CREATE INDEX "bank_accounts_user_id_idx" ON "bank_accounts"("user_id");
CREATE UNIQUE INDEX "payouts_reference_key" ON "payouts"("reference");
CREATE INDEX "payouts_user_id_idx" ON "payouts"("user_id");
CREATE INDEX "documents_user_id_idx" ON "documents"("user_id");
CREATE INDEX "documents_type_idx" ON "documents"("type");
CREATE UNIQUE INDEX "connected_accounts_user_id_provider_key" ON "connected_accounts"("user_id", "provider");
CREATE UNIQUE INDEX "connected_accounts_provider_provider_user_id_key" ON "connected_accounts"("provider", "provider_user_id");
CREATE INDEX "reviews_reviewer_id_idx" ON "reviews"("reviewer_id");
CREATE INDEX "reviews_reviewee_id_idx" ON "reviews"("reviewee_id");
CREATE INDEX "reviews_type_idx" ON "reviews"("type");

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "connected_accounts" ADD CONSTRAINT "connected_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewee_id_fkey" FOREIGN KEY ("reviewee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "applicant_invitations" (
  "id" UUID NOT NULL,
  "token_hash" VARCHAR(64) NOT NULL,
  "landlord_id" UUID NOT NULL,
  "property_id" UUID NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "personal_info" JSONB,
  "employment_info" JSONB,
  "application_id" UUID,
  "accepted_by_id" UUID,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "accepted_at" TIMESTAMP(3),
  "revoked_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "applicant_invitations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "agent_availability" (
  "id" UUID NOT NULL,
  "agent_id" UUID NOT NULL,
  "date" DATE NOT NULL,
  "start_time" VARCHAR(5) NOT NULL,
  "end_time" VARCHAR(5) NOT NULL,
  "recurring" BOOLEAN NOT NULL DEFAULT false,
  "recurring_days" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "agent_availability_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "sessions_user_id_revoked_at_expires_at_idx" ON "sessions"("user_id", "revoked_at", "expires_at");
CREATE UNIQUE INDEX "applicant_invitations_token_hash_key" ON "applicant_invitations"("token_hash");
CREATE UNIQUE INDEX "applicant_invitations_application_id_key" ON "applicant_invitations"("application_id");
CREATE INDEX "applicant_invitations_landlord_id_created_at_idx" ON "applicant_invitations"("landlord_id", "created_at");
CREATE INDEX "applicant_invitations_email_expires_at_idx" ON "applicant_invitations"("email", "expires_at");
CREATE INDEX "agent_availability_agent_id_date_idx" ON "agent_availability"("agent_id", "date");
CREATE UNIQUE INDEX "reviews_unique_lease_context" ON "reviews"("reviewer_id", "reviewee_id", "lease_id") WHERE "lease_id" IS NOT NULL AND "deleted_at" IS NULL;
CREATE UNIQUE INDEX "reviews_unique_job_context" ON "reviews"("reviewer_id", "reviewee_id", "agent_job_id") WHERE "agent_job_id" IS NOT NULL AND "deleted_at" IS NULL;

ALTER TABLE "applicant_invitations" ADD CONSTRAINT "applicant_invitations_landlord_id_fkey" FOREIGN KEY ("landlord_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "applicant_invitations" ADD CONSTRAINT "applicant_invitations_accepted_by_id_fkey" FOREIGN KEY ("accepted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "applicant_invitations" ADD CONSTRAINT "applicant_invitations_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "applicant_invitations" ADD CONSTRAINT "applicant_invitations_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "agent_availability" ADD CONSTRAINT "agent_availability_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
