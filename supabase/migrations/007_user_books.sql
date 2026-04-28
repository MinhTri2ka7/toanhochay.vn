-- ============================================
-- MIGRATION 007: User Books + Book Drive Links
-- ============================================

-- Add user_books table to track purchased books
CREATE TABLE IF NOT EXISTS user_books (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  book_id TEXT NOT NULL,
  activated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, book_id)
);

ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;

-- Users can see their own purchased books
CREATE POLICY "user_books_own_read" ON user_books
  FOR SELECT USING (user_id = auth.uid());

-- Admin full access
CREATE POLICY "user_books_admin_all" ON user_books
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );

CREATE INDEX idx_user_books_user ON user_books(user_id);
