-- ============================================
-- MIGRATION 008: Lesson Attachments
-- ============================================

-- Add attachments JSONB column to lessons table
-- Stores array of {name, url, size, type} objects
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
