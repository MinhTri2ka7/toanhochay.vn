-- ============================================
-- SEED DATA: toanhochay.vn
-- Run after schema migration
-- ============================================

-- ============================================
-- COURSES
-- ============================================
INSERT INTO courses (id, slug, name, price, old_price, image, type) VALUES
  ('cm0m24un00008yt3rb67hh3uj', 'live-s-2k7', 'LIVE S - Khởi động - Toán 2K7 - HTT', 1000000, 2000000, '/api/assets/course/cm0m24un00008yt3rb67hh3uj', 'live'),
  ('cm0m26sih000ayt3rrw4yke29', 'live-c-2k7', 'LIVE C - Chuyên đề - Toán 2K7 - HTT', 1000000, 2000000, '/api/assets/course/cm0m26sih000ayt3rrw4yke29', 'live'),
  ('cm0m2b4pv000cyt3rro70uqii', 'live-t-2k7', 'LIVE T - Luyện đề - Toán 2K7 - HTT', 1000000, 2000000, '/api/assets/course/cm0m2b4pv000cyt3rro70uqii', 'live'),
  ('cm0m2cabc000eyt3rrkgcv8zz', 'live-g-2k7', 'LIVE G - Tổng ôn - Toán học 2K7 - HTT', 1000000, 2000000, '/api/assets/course/cm0m2cabc000eyt3rrkgcv8zz', 'live'),
  ('cm0m2dyg4000gyt3r8vs2r8fx', 'live-vip-hk1-2k8', 'LIVE VIP TOÁN LỚP 11 HỌC KỲ 1 2K8 THẦY HỒ THỨC THUẬN', 1200000, 2400000, '/api/assets/course/cm0m2dyg4000gyt3r8vs2r8fx', 'vip'),
  ('cm0m2fcma000iyt3r5cnoxxn3', 'live-vip-hk2-2k8', 'LIVE VIP TOÁN LỚP 11 HỌC KỲ 2 2K8 THẦY HỒ THỨC THUẬN', 1200000, 2400000, '/api/assets/course/cm0m2fcma000iyt3r5cnoxxn3', 'vip'),
  ('cmjnot0110005n4ej9oid615i', '2k8livec', 'KHÓA LIVE C CHUYÊN ĐỀ 2K8', 1990000, 3600000, '/api/assets/course/cmjnot0110005n4ej9oid615i', 'live')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- COMBOS
-- ============================================
INSERT INTO combos (id, name, price, old_price, image) VALUES
  ('cm0m2hhi6000jyt3ra143ofm9', 'COMBO LIVE VIP TOÁN 11 - Khoá 2K8 THẦY HỒ THỨC THUẬN', 1800000, 3600000, '/api/assets/combo/cm0m2hhi6000jyt3ra143ofm9'),
  ('cm0m2ix9e000kyt3rec9bmop3', 'COMBO CTG TOÁN 2K7 - HTT', 2000000, 4000000, '/api/assets/combo/cm0m2ix9e000kyt3rec9bmop3')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- BOOKS
-- ============================================
INSERT INTO books (id, name, price, old_price, image, stock) VALUES
  ('cm0m1z3mh0002yt3rd2ndvwsa', 'BỘ 20 ĐỀ ĐÁNH GIÁ NĂNG LỰC MÔN TOÁN ĐẠI HỌC QUỐC GIA HÀ NỘI', 190000, 250000, '/api/assets/book/cm0m1z3mh0002yt3rd2ndvwsa', 50),
  ('cm0m20o7l0003yt3r89xuax8t', 'BỘ 20 ĐỀ ĐÁNH GIÁ NĂNG LỰC MÔN TOÁN ĐẠI HỌC QUỐC GIA HỒ CHÍ MINH', 190000, 250000, '/api/assets/book/cm0m20o7l0003yt3r89xuax8t', 50),
  ('cm0m21ddp0004yt3rwqzo4186', 'BỘ 20 ĐỀ ĐÁNH GIÁ NĂNG LỰC MÔN TOÁN ĐẠI HỌC BÁCH KHOA HN', 190000, 250000, '/api/assets/book/cm0m21ddp0004yt3rwqzo4186', 50),
  ('cm0m2202h0005yt3r2q21csw7', '26 CHUYÊN ĐỀ VDC TOÁN LỚP 12', 190000, 250000, '/api/assets/book/cm0m2202h0005yt3r2q21csw7', 50),
  ('cm0m22ibt0006yt3r9cscr60b', '24 CHUYÊN ĐỀ VDC TOÁN LỚP 11', 190000, 250000, '/api/assets/book/cm0m22ibt0006yt3r9cscr60b', 50)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- FEEDBACKS
-- ============================================
INSERT INTO feedbacks (id, type) VALUES
  ('cm0m2shuz000lyt3rha324ybr', 'honor'),
  ('cm0m2shuz000myt3reow5qaxl', 'honor'),
  ('cm0m2shuz000nyt3rjosnr72a', 'honor'),
  ('cm0m2shuz000oyt3re452kyom', 'honor'),
  ('cm0m2shuz000pyt3reqcnfsck', 'honor'),
  ('cm0m2shuz000qyt3r7gwvtfcu', 'honor'),
  ('cm0m2shuz000ryt3r9lps1x0r', 'honor'),
  ('cm0m2wpuk000zyt3r5lcm6neb', 'feedback'),
  ('cm0m2wpuk0010yt3rajnmu1rr', 'feedback'),
  ('cm0m2wpuk0011yt3rq296meqx', 'feedback'),
  ('cm0m2wpuk0012yt3r1nm0avy5', 'feedback'),
  ('cm0m2wpuk0013yt3rz8nul2og', 'feedback'),
  ('cm0m2wpuk0014yt3r1k6thg1l', 'feedback'),
  ('cm0m2wpuk0015yt3r6wxshnkt', 'feedback')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MOCK TESTS
-- ============================================
INSERT INTO mock_tests (title, subject, duration, total_questions, difficulty) VALUES
  ('Đề thi THPT Quốc Gia 2024 - Môn Toán', 'math', 90, 50, 'hard'),
  ('Đề thi giữa kỳ 1 - Toán 12', 'math', 60, 40, 'medium'),
  ('Đề thi cuối kỳ 1 - Toán 12', 'math', 60, 40, 'medium'),
  ('Đề thi thử THPT QG lần 1 - 2025', 'math', 90, 50, 'hard'),
  ('Đề thi thử THPT QG lần 2 - 2025', 'math', 90, 50, 'very_hard'),
  ('Đề thi giữa kỳ 2 - Toán 11', 'math', 45, 35, 'medium');

-- ============================================
-- QUESTIONS (for test 1)
-- ============================================
INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, sort_order) VALUES
  (1, 'Cho hàm số y = x³ - 3x + 2. Hàm số đồng biến trên khoảng nào?', '(-∞, -1)', '(-1, 1)', '(1, +∞)', '(-∞, -1) và (1, +∞)', 'D', 'Đạo hàm y'' = 3x² - 3 = 3(x-1)(x+1). y'' > 0 khi x < -1 hoặc x > 1.', 1),
  (1, 'Giá trị lớn nhất của hàm số f(x) = -x² + 4x - 3 là?', '1', '2', '3', '4', 'A', 'f''(x) = -2x + 4 = 0 → x = 2. f(2) = -4 + 8 - 3 = 1.', 2),
  (1, 'Tích phân ∫₀¹ x²dx bằng?', '1/2', '1/3', '1/4', '1', 'B', '∫₀¹ x²dx = [x³/3]₀¹ = 1/3.', 3),
  (1, 'log₂(8) = ?', '2', '3', '4', '8', 'B', '2³ = 8 nên log₂(8) = 3.', 4),
  (1, 'Số phức z = 3 + 4i có |z| = ?', '3', '4', '5', '7', 'C', '|z| = √(3² + 4²) = √25 = 5.', 5);

-- ============================================
-- ADMIN USER
-- Note: Password is bcrypt hash of 'admin123'
-- ============================================
INSERT INTO users (name, email, password, role) VALUES
  ('Admin', 'admin@thaythuan.vn', '$2a$10$rQXBOiHzRfFGz2eAOxhJaOrSpkCp1P.Xr0tFYgCDBhKzFIYKBjiHy', 'admin')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- SITE SETTINGS
-- ============================================
INSERT INTO site_settings (key, value) VALUES
  ('site_name', 'Toán Thầy Thuận'),
  ('site_description', '8 năm kinh nghiệm luyện thi đại học chất lượng cao. Đồng hành cùng hàng ngàn học sinh trên cả nước.'),
  ('logo', '/logo_footer.webp'),
  ('avatar', '/avatar.png'),
  ('address', '70 Nguyễn Đức Cảnh - Tương Mai, Hoàng Mai, Hà Nội'),
  ('email', 'hothucthuan@gmail.com'),
  ('phone', '0869998668'),
  ('zalo', 'https://zalo.me/0869998668'),
  ('facebook', 'https://www.facebook.com/Thaygiaothuan.99'),
  ('youtube', 'https://www.youtube.com/c/HồThứcThuậnOfficial'),
  ('tiktok', 'https://www.tiktok.com/@thay_hothucthuan'),
  ('bank_name', 'MB Bank'),
  ('bank_account', '0869998668'),
  ('bank_owner', 'HO THUC THUAN')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- DOCUMENTS
-- ============================================
INSERT INTO documents (title, description, file_url, file_type, pages, downloads, category, sort_order) VALUES
  ('Chuyên đề Hàm số và Ứng dụng', 'Tổng hợp lý thuyết và bài tập chuyên đề hàm số', '', 'PDF', 45, 1250, 'Chuyên đề', 1),
  ('Chuyên đề Tích phân - Nguyên hàm', 'Phương pháp tính tích phân và nguyên hàm', '', 'PDF', 38, 980, 'Chuyên đề', 2),
  ('Chuyên đề Hình học không gian', 'Hình học không gian tổng hợp', '', 'PDF', 52, 1100, 'Chuyên đề', 3),
  ('Tóm tắt công thức Toán 12', 'Tất cả công thức Toán 12 cần nhớ', '', 'PDF', 20, 3200, 'Tổng hợp', 4),
  ('Chuyên đề Số phức', 'Lý thuyết và bài tập số phức', '', 'PDF', 30, 870, 'Chuyên đề', 5),
  ('Bài tập Xác suất - Thống kê', 'Bài tập tự luyện xác suất thống kê', '', 'PDF', 35, 760, 'Bài tập', 6),
  ('Đề cương ôn tập giữa kỳ 1 - Toán 12', 'Đề cương ôn tập chi tiết', '', 'PDF', 25, 1500, 'Đề cương', 7),
  ('Phương pháp giải nhanh trắc nghiệm', 'Các tips giải nhanh trắc nghiệm Toán', '', 'PDF', 40, 2100, 'Tổng hợp', 8);
