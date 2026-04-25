-- ============================================
-- SUPABASE MIGRATION: toanhochay.vn
-- Full schema + RLS + indexes
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'staff')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "admin_full_access" ON users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- Users can read/update their own profile
CREATE POLICY "users_read_own" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================
-- 2. COURSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  content TEXT,
  price INTEGER DEFAULT 0,
  old_price INTEGER DEFAULT 0,
  image TEXT,
  banner TEXT,
  type TEXT DEFAULT 'live' CHECK (type IN ('live', 'video', 'vip')),
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Public read for active courses
CREATE POLICY "courses_public_read" ON courses
  FOR SELECT USING (status = 'active');

-- Admin full access
CREATE POLICY "courses_admin_all" ON courses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_type ON courses(type);
CREATE INDEX idx_courses_status ON courses(status);

-- ============================================
-- 3. COMBOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS combos (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER DEFAULT 0,
  old_price INTEGER DEFAULT 0,
  image TEXT,
  status TEXT DEFAULT 'active',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE combos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "combos_public_read" ON combos
  FOR SELECT USING (status = 'active');

CREATE POLICY "combos_admin_all" ON combos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- ============================================
-- 4. COMBO ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS combo_items (
  id SERIAL PRIMARY KEY,
  combo_id TEXT NOT NULL REFERENCES combos(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE
);

ALTER TABLE combo_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "combo_items_public_read" ON combo_items
  FOR SELECT USING (true);

CREATE POLICY "combo_items_admin_all" ON combo_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE INDEX idx_combo_items_combo ON combo_items(combo_id);
CREATE INDEX idx_combo_items_course ON combo_items(course_id);

-- ============================================
-- 5. BOOKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER DEFAULT 0,
  old_price INTEGER DEFAULT 0,
  image TEXT,
  pdf_url TEXT,
  stock INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "books_public_read" ON books
  FOR SELECT USING (status = 'active');

CREATE POLICY "books_admin_all" ON books
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- ============================================
-- 6. MOCK TESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS mock_tests (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT DEFAULT 'math',
  duration INTEGER DEFAULT 90,
  total_questions INTEGER DEFAULT 0,
  difficulty TEXT DEFAULT 'medium',
  passcode TEXT DEFAULT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE mock_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mock_tests_public_read" ON mock_tests
  FOR SELECT USING (status = 'active');

CREATE POLICY "mock_tests_admin_all" ON mock_tests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- ============================================
-- 7. QUESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  test_id INTEGER NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
  question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'essay')),
  question_text TEXT NOT NULL,
  image TEXT,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_answer TEXT,
  explanation TEXT,
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read questions (for taking tests)
CREATE POLICY "questions_authenticated_read" ON questions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "questions_admin_all" ON questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE INDEX idx_questions_test ON questions(test_id);

-- ============================================
-- 8. TEST RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS test_results (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  test_id INTEGER NOT NULL REFERENCES mock_tests(id),
  answers JSONB,
  score REAL DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Users can read their own results
CREATE POLICY "test_results_own_read" ON test_results
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own results
CREATE POLICY "test_results_own_insert" ON test_results
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admin can see all results
CREATE POLICY "test_results_admin_all" ON test_results
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE INDEX idx_test_results_user ON test_results(user_id);
CREATE INDEX idx_test_results_test ON test_results(test_id);

-- ============================================
-- 9. ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  total_amount INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  note TEXT,
  payment_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can read their own orders
CREATE POLICY "orders_own_read" ON orders
  FOR SELECT USING (user_id = auth.uid());

-- Users can create orders
CREATE POLICY "orders_own_insert" ON orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admin full access
CREATE POLICY "orders_admin_all" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_code ON orders(payment_code);

-- ============================================
-- 10. ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL CHECK (product_type IN ('course', 'combo', 'book')),
  product_id TEXT NOT NULL,
  product_name TEXT,
  price INTEGER DEFAULT 0,
  quantity INTEGER DEFAULT 1
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users can read their own order items (via order ownership)
CREATE POLICY "order_items_own_read" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
  );

-- Users can insert order items for their own orders
CREATE POLICY "order_items_own_insert" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
  );

-- Admin full access
CREATE POLICY "order_items_admin_all" ON order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================
-- 11. PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  method TEXT DEFAULT 'sepay',
  amount INTEGER DEFAULT 0,
  transaction_id TEXT,
  status TEXT DEFAULT 'pending',
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can read their own payments (via order ownership)
CREATE POLICY "payments_own_read" ON payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = payments.order_id AND o.user_id = auth.uid())
  );

-- Admin full access
CREATE POLICY "payments_admin_all" ON payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE INDEX idx_payments_order ON payments(order_id);

-- ============================================
-- 12. CART ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL CHECK (product_type IN ('course', 'combo', 'book')),
  product_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  UNIQUE(user_id, product_type, product_id)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Users can manage their own cart
CREATE POLICY "cart_own_select" ON cart_items
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "cart_own_insert" ON cart_items
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "cart_own_update" ON cart_items
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "cart_own_delete" ON cart_items
  FOR DELETE USING (user_id = auth.uid());

CREATE INDEX idx_cart_user ON cart_items(user_id);

-- ============================================
-- 13. USER COURSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_courses (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  course_id TEXT NOT NULL,
  activated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE user_courses ENABLE ROW LEVEL SECURITY;

-- Users can see their own purchased courses
CREATE POLICY "user_courses_own_read" ON user_courses
  FOR SELECT USING (user_id = auth.uid());

-- Admin full access
CREATE POLICY "user_courses_admin_all" ON user_courses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE INDEX idx_user_courses_user ON user_courses(user_id);

-- ============================================
-- 14. BANNERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  title TEXT,
  image TEXT,
  link TEXT,
  position TEXT DEFAULT 'home',
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "banners_public_read" ON banners
  FOR SELECT USING (status = 'active');

CREATE POLICY "banners_admin_all" ON banners
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- ============================================
-- 15. FEEDBACKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS feedbacks (
  id TEXT PRIMARY KEY,
  student_name TEXT,
  content TEXT,
  image TEXT,
  score TEXT,
  type TEXT DEFAULT 'feedback' CHECK (type IN ('feedback', 'honor')),
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active'
);

ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedbacks_public_read" ON feedbacks
  FOR SELECT USING (status = 'active');

CREATE POLICY "feedbacks_admin_all" ON feedbacks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- ============================================
-- 16. SECURITY LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS security_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  ip TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Only admin can access security logs
CREATE POLICY "security_logs_admin_all" ON security_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE INDEX idx_security_logs_user ON security_logs(user_id);
CREATE INDEX idx_security_logs_created ON security_logs(created_at);

-- ============================================
-- 17. DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT DEFAULT 'PDF',
  pages INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  category TEXT DEFAULT 'general',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_public_read" ON documents
  FOR SELECT USING (status = 'active');

CREATE POLICY "documents_admin_all" ON documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- ============================================
-- 18. SITE SETTINGS TABLE (key-value store)
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT DEFAULT ''
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings (logo, contact info, etc.)
CREATE POLICY "site_settings_public_read" ON site_settings
  FOR SELECT USING (true);

-- Only admin can modify settings
CREATE POLICY "site_settings_admin_all" ON site_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

-- ============================================
-- FUNCTION: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
