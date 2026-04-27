-- ============================================
-- MIGRATION 006: Lessons system + progress tracking
-- ============================================

-- Lessons table — each course has multiple lessons
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  video_url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_preview BOOLEAN DEFAULT false,       -- preview lessons visible without purchase
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
  duration INTEGER DEFAULT 0,             -- video duration in seconds
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lessons_public_preview" ON lessons
  FOR SELECT USING (is_preview = true AND status = 'active');

CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_lessons_sort ON lessons(course_id, sort_order);

-- Lesson progress — track which lessons each user has completed
CREATE TABLE IF NOT EXISTS lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  last_position INTEGER DEFAULT 0,        -- seconds watched
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress_own_read" ON lesson_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE INDEX idx_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_progress_lesson ON lesson_progress(lesson_id);
