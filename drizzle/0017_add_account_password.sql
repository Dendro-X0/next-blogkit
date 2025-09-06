-- Add missing password column to account for Better Auth
-- Safe to run multiple times due to IF NOT EXISTS
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "password" text;
