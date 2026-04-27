-- ============================================
-- MIGRATION 005: Answer images + per-question scoring
-- ============================================

-- Add image fields for each answer option
ALTER TABLE questions ADD COLUMN IF NOT EXISTS option_a_image TEXT DEFAULT '';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS option_b_image TEXT DEFAULT '';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS option_c_image TEXT DEFAULT '';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS option_d_image TEXT DEFAULT '';

-- Per-question scoring
ALTER TABLE questions ADD COLUMN IF NOT EXISTS points_correct REAL DEFAULT 1;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS points_wrong REAL DEFAULT 0;

-- Exam-level defaults (used when creating new questions)
ALTER TABLE mock_tests ADD COLUMN IF NOT EXISTS points_correct REAL DEFAULT 1;
ALTER TABLE mock_tests ADD COLUMN IF NOT EXISTS points_wrong REAL DEFAULT 0;
