-- ============================================
-- MIGRATION 003: Homepage Sections
-- Admin can create dynamic sections on homepage
-- ============================================

-- Add category field to courses (for grouping)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '';

-- Add category field to books (for grouping)
ALTER TABLE books ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '';

-- Update existing courses with categories based on slug
UPDATE courses SET category = '2k7' WHERE slug LIKE '%2k7%';
UPDATE courses SET category = '2k8' WHERE slug LIKE '%2k8%';

-- ============================================
-- HOMEPAGE SECTIONS TABLE
-- Controls what sections appear on the homepage
-- ============================================
CREATE TABLE IF NOT EXISTS homepage_sections (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,              -- e.g. "KHÓA HỌC 2K7"
  subtitle TEXT,                     -- e.g. "KHOÁ 2K7 - LUYỆN THI THPTQG 2025"
  product_type TEXT NOT NULL CHECK (product_type IN ('course', 'combo', 'book')),
  category TEXT DEFAULT '',          -- filter: matches courses.category or books.category
  icon TEXT DEFAULT 'LibraryBig',    -- lucide icon name
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

-- Public can read active sections
CREATE POLICY "homepage_sections_public_read" ON homepage_sections
  FOR SELECT USING (status = 'active');

-- Admin full access
CREATE POLICY "homepage_sections_admin_all" ON homepage_sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- ============================================
-- SEED DEFAULT SECTIONS
-- ============================================
INSERT INTO homepage_sections (title, subtitle, product_type, category, icon, sort_order) VALUES
  ('COMBO TOÁN HỌC', 'XUẤT PHÁT SỚM CÙNG 2K7 - 2K8', 'combo', '', 'BookCopy', 1),
  ('KHÓA HỌC 2K8', 'Chinh Phục Lớp 11 Cùng 2K8', 'course', '2k8', 'LibraryBig', 2),
  ('KHÓA HỌC 2K7', 'KHOÁ 2K7 - LUYỆN THI THPTQG 2025', 'course', '2k7', 'LibraryBig', 3),
  ('SÁCH', 'BỘ ĐỀ ÔN TẬP - XUẤT PHÁT SỚM', 'book', '', 'BookText', 4);
