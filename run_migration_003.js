import supabase from './server/supabase.js';

async function migrate() {
  console.log('Running migration 003: Homepage Sections...');
  
  // Check if table already exists
  const { data: check, error: checkErr } = await supabase.from('homepage_sections').select('id').limit(1);
  
  if (check !== null && !checkErr) {
    console.log('✅ Table homepage_sections already exists');
    // Check if has data
    if (check.length > 0) {
      console.log(`   Already has ${check.length}+ rows`);
    } else {
      // Insert seed data
      console.log('   Seeding default sections...');
      const { error } = await supabase.from('homepage_sections').insert([
        { title: 'COMBO TOÁN HỌC', subtitle: 'XUẤT PHÁT SỚM CÙNG 2K7 - 2K8', product_type: 'combo', category: '', icon: 'BookCopy', sort_order: 1 },
        { title: 'KHÓA HỌC 2K8', subtitle: 'Chinh Phục Lớp 11 Cùng 2K8', product_type: 'course', category: '2k8', icon: 'LibraryBig', sort_order: 2 },
        { title: 'KHÓA HỌC 2K7', subtitle: 'KHOÁ 2K7 - LUYỆN THI THPTQG 2025', product_type: 'course', category: '2k7', icon: 'LibraryBig', sort_order: 3 },
        { title: 'SÁCH', subtitle: 'BỘ ĐỀ ÔN TẬP - XUẤT PHÁT SỚM', product_type: 'book', category: '', icon: 'BookText', sort_order: 4 },
      ]);
      if (error) console.log('   Seed error:', error.message);
      else console.log('   ✅ Seeded 4 default sections');
    }
  } else {
    console.log('❌ Table homepage_sections does NOT exist.');
    console.log('');
    console.log('Please run this SQL in Supabase Dashboard SQL Editor:');
    console.log('https://supabase.com/dashboard/project/zmmixpcxlezhadbqtiey/sql/new');
    console.log('');
    console.log(`--- COPY FROM HERE ---`);
    console.log(`
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '';
ALTER TABLE books ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '';

UPDATE courses SET category = '2k7' WHERE slug LIKE '%2k7%';
UPDATE courses SET category = '2k8' WHERE slug LIKE '%2k8%';

CREATE TABLE IF NOT EXISTS homepage_sections (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  product_type TEXT NOT NULL CHECK (product_type IN ('course', 'combo', 'book')),
  category TEXT DEFAULT '',
  icon TEXT DEFAULT 'LibraryBig',
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "homepage_sections_public_read" ON homepage_sections
  FOR SELECT USING (status = 'active');

CREATE POLICY "homepage_sections_admin_all" ON homepage_sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

INSERT INTO homepage_sections (title, subtitle, product_type, category, icon, sort_order) VALUES
  ('COMBO TOÁN HỌC', 'XUẤT PHÁT SỚM CÙNG 2K7 - 2K8', 'combo', '', 'BookCopy', 1),
  ('KHÓA HỌC 2K8', 'Chinh Phục Lớp 11 Cùng 2K8', 'course', '2k8', 'LibraryBig', 2),
  ('KHÓA HỌC 2K7', 'KHOÁ 2K7 - LUYỆN THI THPTQG 2025', 'course', '2k7', 'LibraryBig', 3),
  ('SÁCH', 'BỘ ĐỀ ÔN TẬP - XUẤT PHÁT SỚM', 'book', '', 'BookText', 4);
`);
    console.log(`--- END ---`);
  }

  // Test category column on courses
  const { data: courseTest } = await supabase.from('courses').select('id, category').limit(1);
  if (courseTest && courseTest[0] && 'category' in courseTest[0]) {
    console.log('✅ courses.category column exists');
  } else {
    console.log('❌ courses.category column missing - need to run ALTER TABLE');
  }
  
  // Test category column on books
  const { data: bookTest } = await supabase.from('books').select('id, category').limit(1);
  if (bookTest && bookTest[0] && 'category' in bookTest[0]) {
    console.log('✅ books.category column exists');
  } else {
    console.log('❌ books.category column missing - need to run ALTER TABLE');
  }
}

migrate().catch(console.error);
