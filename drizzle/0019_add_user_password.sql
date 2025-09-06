-- Add missing password column to user for Better Auth local accounts
-- Safe to run multiple times due to IF NOT EXISTS
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "password" text;
