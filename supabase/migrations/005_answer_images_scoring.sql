-- ============================================
-- MIGRATION 005: Answer images + custom scoring
-- ============================================

-- Add image fields for each answer option
ALTER TABLE questions ADD COLUMN IF NOT EXISTS option_a_image TEXT DEFAULT '';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS option_b_image TEXT DEFAULT '';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS option_c_image TEXT DEFAULT '';
ALTER TABLE questions ADD COLUMN IF NOT EXISTS option_d_image TEXT DEFAULT '';

-- Add scoring config to mock_tests
ALTER TABLE mock_tests ADD COLUMN IF NOT EXISTS points_correct REAL DEFAULT 1;
ALTER TABLE mock_tests ADD COLUMN IF NOT EXISTS points_wrong REAL DEFAULT 0;
