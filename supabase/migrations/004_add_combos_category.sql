-- ============================================
-- MIGRATION 004: Add category to combos
-- Ensures combos can also be grouped into homepage sections
-- ============================================

-- Add category field to combos (for grouping on homepage)
ALTER TABLE combos ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '';
