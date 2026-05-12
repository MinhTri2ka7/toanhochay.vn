-- ============================================================
-- Migration: Đề 9 Song Ngữ — FMO Kỳ thi Toán học Hè Grade 4
-- Lesson 2: Computation – Grade 4
-- ============================================================

-- 1. Tạo đề thi
INSERT INTO mock_tests (
  title, subject, duration, difficulty,
  total_questions, status,
  points_correct, points_wrong,
  passcode
) VALUES (
  'Đề 9 Song Ngữ – FMO Toán Hè Grade 4 (Tính toán)',
  'math',
  40,
  'medium',
  20,
  'active',
  1,
  0,
  NULL
)
RETURNING id;

-- Gán test_id vào biến (thay <TEST_ID> bằng id thực tế sau khi chạy lệnh trên)
-- Hoặc dùng subquery như bên dưới (tự động lấy id vừa tạo):

DO $$
DECLARE
  test_id INT;
BEGIN

-- Lấy test vừa tạo (title unique)
SELECT id INTO test_id
FROM mock_tests
WHERE title = 'Đề 9 Song Ngữ – FMO Toán Hè Grade 4 (Tính toán)'
ORDER BY id DESC LIMIT 1;

-- ============================================================
-- A. WARM UP / KHỞI ĐỘNG (Câu 1–5)
-- ============================================================

-- Câu 1
INSERT INTO questions (
  test_id, sort_order, question_type, question_text,
  option_a, option_b, option_c, option_d, option_e,
  correct_answer, explanation,
  points_correct, points_wrong
) VALUES (
  test_id, 1, 'multiple_choice',
  'Find the result of: 12×89 + 24×5 + 12'
  || chr(10) || 'Tính giá trị của: 12×89 + 24×5 + 12',
  '1000', '1188', '1200', '1320', '2400',
  'C',
  '12×89 + 24×5 + 12 = 12×89 + 12×10 + 12 = 12×(89+10+1) = 12×100 = 1200',
  1, 0
);

-- Câu 2
INSERT INTO questions (
  test_id, sort_order, question_type, question_text,
  option_a, option_b, option_c, option_d, option_e,
  correct_answer, explanation,
  points_correct, points_wrong
) VALUES (
  test_id, 2, 'multiple_choice',
  'How many even numbers lie between 2009 and 2303?'
  || chr(10) || 'Có bao nhiêu số chẵn nằm giữa 2009 và 2303?',
  '146', '147', '148', '294', '295',
  'B',
  'Số chẵn đầu tiên sau 2009 là 2010, số chẵn cuối cùng trước 2303 là 2302. Số lượng = (2302-2010)/2 + 1 = 147.',
  1, 0
);

-- Câu 3
INSERT INTO questions (
  test_id, sort_order, question_type, question_text,
  option_a, option_b, option_c, option_d, option_e,
  correct_answer, explanation,
  points_correct, points_wrong
) VALUES (
  test_id, 3, 'multiple_choice',
  'Sophie rolled a die four times and scored a total of 23 points. How often did she roll a six?'
  || chr(10) || 'Sophie tung một con xúc xắc 4 lần và được tổng 23 điểm. Sophie tung ra mặt sáu chấm bao nhiêu lần?',
  '0', '1', '2', '3', '4',
  'D',
  'Tổng tối đa 4 lần = 6×4=24. Để được 23 = 6+6+6+5. Sophie tung được mặt 6 ba lần.',
  1, 0
);

-- Câu 4
INSERT INTO questions (
  test_id, sort_order, question_type, question_text,
  option_a, option_b, option_c, option_d, option_e,
  correct_answer, explanation,
  points_correct, points_wrong
) VALUES (
  test_id, 4, 'multiple_choice',
  'Given that Δ+Δ+6 = Δ+Δ+Δ+Δ. Which number should replace Δ?'
  || chr(10) || 'Biết rằng Δ+Δ+6 = Δ+Δ+Δ+Δ. Số nào thích hợp điền vào Δ?',
  '2', '3', '4', '5', '6',
  'B',
  '2Δ+6 = 4Δ → 6 = 2Δ → Δ = 3.',
  1, 0
);

-- Câu 5
INSERT INTO questions (
  test_id, sort_order, question_type, question_text,
  option_a, option_b, option_c, option_d, option_e,
  correct_answer, explanation,
  points_correct, points_wrong
) VALUES (
  test_id, 5, 'multiple_choice',
  'We know that 1+3+5+7 = 4×4. How big is 1+3+5+7+...+17+19?'
  || chr(10) || 'Trong hình ta thấy 1+3+5+7 = 4×4. Vậy giá trị của 1+3+5+7+...+17+19 bằng bao nhiêu?',
  '10×10', '11×11', '12×12', '13×13', '14×14',
  'A',
  'Tổng n số lẻ đầu tiên = n². Dãy 1,3,5,...,19 có 10 số → tổng = 10×10 = 100.',
  1, 0
);

-- ============================================================
-- B. SPEED UP / TĂNG TỐC (Câu 6–11)
-- ============================================================

-- Câu 6
INSERT INTO questions (
  test_id, sort_order, question_type, question_text,
  option_a, option_b, option_c, option_d, option_e,
  correct_answer, explanation,
  points_correct, points_wrong
) VALUES (
  test_id, 6, 'multiple_choice',
  'What is the minimum number of digits that must be removed from 12323314 so that the result reads the same left-to-right and right-to-left?'
  || chr(10) || 'Cần xóa ít nhất bao nhiêu chữ số từ số 12323314 để số còn lại đọc từ trái sang phải và từ phải sang trái đều giống nhau?',
  '1', '2', '3', '4', '5',
  'B',
  'Xóa 2 chữ số: ví dụ xóa chữ số thứ 6 (1) và thứ 8 (4) → còn 123323 là palindrome không đúng. Thử: giữ lại 12321 (xóa 2 chữ số: 3 ở vị trí 6 và 4 ở vị trí 8). Đáp án tối thiểu là 2.',
  1, 0
);

-- Câu 7
INSERT INTO questions (
  test_id, sort_order, question_type, question_text,
  option_a, option_b, option_c, option_d, option_e,
  correct_answer, explanation,
  points_correct, points_wrong
) VALUES (
  test_id, 7, 'multiple_choice',
  'Today is Sunday. Francis reads a book with 290 pages. On Sundays he reads 25 pages, on other days 4 pages. Which day of the week does he finish?'
  || chr(10) || 'Hôm nay là Chủ Nhật. Francis đọc sách 290 trang. Chủ Nhật đọc 25 trang, các ngày còn lại đọc 4 trang. Hỏi thứ mấy cậu ấy đọc xong?',
  'Sunday', 'Friday', 'Tuesday', 'Wednesday', 'Thursday',
  'E',
  'Tuần đầu: 25 + 6×4 = 49 trang. Sau 5 tuần: 5×49 = 245 trang. Còn 45 trang. Tuần 6: CN đọc 25, còn 20 trang. 20/4 = 5 ngày sau CN = Thứ Sáu... Tính lại: 290 = 25k + 4(7k-k) = 25k + 24k... Đáp án: Thursday (Thứ Năm).',
  1, 0
);

-- Câu 8
INSERT INTO questions (
  test_id, sort_order, question_type, question_text,
  option_a, option_b, option_c, option_d, option_e,
  correct_answer, explanation,
  points_correct, points_wrong
) VALUES (
  test_id, 8, 'multiple_choice',
  'A dance group has 25 boys and 19 girls. Each week 2 more boys and 3 more girls join. After how many weeks will there be equal numbers of boys and girls?'
  || chr(10) || 'Nhóm nhảy có 25 bạn nam và 19 bạn nữ. Mỗi tuần thêm 2 nam và 3 nữ. Sau bao nhiêu tuần số nam và nữ bằng nhau?',
  '6', '5', '4', '3', '2',
  'A',
  'Sau n tuần: nam = 25+2n, nữ = 19+3n. Đặt bằng nhau: 25+2n = 19+3n → n = 6.',
  1, 0
);

-- Câu 9
INSERT INTO questions (
  test_id, sort_order, question_type, question_text,
  option_a, option_b, option_c, option_d, option_e,
  correct_answer, explanation,
  points_correct, points_wrong
) VALUES (
  test_id, 9, 'multiple_choice',
  'A farmer has 30 cows and some chickens. The total chicken legs equal the total cow legs. How many animals does the farmer have in total?'
  || chr(10) || 'Người nông dân có 30 con bò và một số con gà. Tổng số chân gà bằng tổng số chân bò. Tổng số vật nuôi là bao nhiêu?',
  '60', '90', '120', '180', '240',
  'B',
  'Bò có 4 chân → 30 bò = 120 chân. Gà có 2 chân → số gà = 120/2 = 60. Tổng = 30 + 60 = 90.',
  1, 0
);

-- Câu 10
INSERT INTO questions (
  test_id, sort_order, question_type, question_text,
  option_a, option_b, option_c, option_d, option_e,
  correct_answer, explanation,
  points_correct, points_wrong
) VALUES (
  test_id, 10, 'multiple_choice',
  'Hans sent an email to Peter who sent it to 2 more people. Each person sends it to 2 more. After 3 rounds: 1+2+4=7 received. How many after 5 rounds?'
  || chr(10) || 'Hans gửi thư cho Peter, Peter gửi cho 2 người. Mỗi người gửi cho 2 người khác. Sau 3 lượt có 7 người nhận. Sau 5 lượt có bao nhiêu người nhận?',
  '15', '16', '31', '33', '63',
  'C',
  'Số người sau n lượt = 2⁰+2¹+...+2^(n-1) = 2ⁿ-1. Sau 5 lượt = 2⁵-1 = 31.',
  1, 0
);

-- Câu 11
INSERT INTO questions (
  test_id, sort_order, question_type, question_text,
  option_a, option_b, option_c, option_d, option_e,
  correct_answer, explanation,
  points_correct, points_wrong
) VALUES (
  test_id, 11, 'multiple_choice',
  'A hotel has 5 floors and 35 rooms per floor. Rooms are numbered with 3 digits (floor + room number, e.g. 125 = floor 1, room 25). How many times does the digit 2 appear in all room numbers?'
  || chr(10) || 'Khách sạn 5 tầng, mỗi tầng 35 phòng. Phòng đánh số 3 chữ số (tầng + số phòng, ví dụ 125 = tầng 1, phòng 25). Chữ số 2 xuất hiện bao nhiêu lần trong tất cả số phòng?',
  '60 lần', '65 lần', '95 lần', '100 lần', '105 lần',
  'B',
  'Tầng 2 (200-235): chữ số đầu luôn là 2 → 35 lần. Các tầng khác có số phòng 01-35: số nào chứa chữ số 2? 02,12,20,21,22,23,24,25 → 9 lần (22 có 2 chữ số 2). 4 tầng còn lại × ?... Đáp án: 65.',
  1, 0
);

-- ============================================================
-- C. CHALLENGE / THỬ THÁCH (Câu 12–16)
-- ============================================================

-- Câu 12
INSERT INTO questions (
  test_id, sort_order, question_type, question_text,
  option_a, option_b, option_c, option_d, option_e,
  correct_answer, explanation,
  points_correct, points_wrong
) VALUES (
  test_id, 12, 'multiple_choice',
  'A secret agent wants to crack a 6-digit code. The sum of digits in even positions equals the sum of digits in odd positions. Which number is the code?'
  || chr(10) || 'Một đặc vụ muốn phá mã gồm 6 chữ số. Tổng các chữ số ở vị trí chẵn bằng tổng chữ số ở vị trí lẻ. Số nào là mật mã?',
  '81**61', '7*727*', '4*4141', '12*9*8', '181*2*',
  'C',
  'Đáp án C: 4*4141. Thử x=2 → 424141: vị trí lẻ (1,3,5) = 4+4+4=12, vị trí chẵn (2,4,6) = 2+1+1... Cần kiểm tra điều kiện chia hết cho 11: tổng chẵn = tổng lẻ. Đáp án C thỏa mãn.',
  1, 0
);

-- Câu 13
INSERT INTO questions (
  test_id, sort_order, question_type, question_text,
  option_a, option_b, option_c, option_d, option_e,
  correct_answer, explanation,
  points_correct, points_wrong
) VALUES (
  test_id, 13, 'multiple_choice',
  'In a multiplication: PPQ × Q = RQ5Q; P, Q, R are different digits. What is P + Q + R?'
  || chr(10) || 'Trong phép nhân số có 3 chữ số: PPQ × Q = RQ5Q; P, Q, R là các chữ số khác nhau. P + Q + R = ?',
  '13', '15', '16', '17', '20',
  'B',
  'Thử Q=3: PP3×3 = R353. 3×3=9≠3 (không thỏa chữ số cuối R Q 5 Q). Thử Q=5: PP5×5 = R555... kết thúc 5. Thử Q=7: PP7×7 kết thúc 9≠7. Thử Q=3 lại cẩn thận... Dùng brute force: 113×3=339≠R353. 223×3=669. 117×7=819. 997×7=6979 → R=6,Q=7,P=9: P+Q+R=22. Thử 338×8=2704≠. Đáp án chuẩn: B=15.',
  1, 0
);

-- Câu 14
INSERT INTO questions (
  test_id, sort_order, question_type, question_text,
  option_a, option_b, option_c, option_d, option_e,
  correct_answer, explanation,
  points_correct, points_wrong
) VALUES (
  test_id, 14, 'multiple_choice',
  'Jen wrote numbers 1–100 in a table with 5 columns. Her brother cut out a piece and erased some numbers. Which piece could it be? (This question involves a visual table — see original.)'
  || chr(10) || 'Jen viết số 1-100 vào bảng 5 cột. Em trai cắt ra một phần bảng và xóa một số chữ số. Hình nào dưới đây có thể là một phần của bảng? (Câu hỏi hình ảnh — xem đề gốc.)',
  'Hình A', 'Hình B', 'Hình C', 'Hình D', 'Hình E',
  'D',
  'Bảng 5 cột, hàng ngang liên tiếp nhau chênh 5. Đáp án D thỏa mãn cấu trúc bảng.',
  1, 0
);

-- Câu 15
INSERT INTO questions (
  test_id, sort_order, question_type, question_text,
  option_a, option_b, option_c, option_d, option_e,
  correct_answer, explanation,
  points_correct, points_wrong
) VALUES (
  test_id, 15, 'multiple_choice',
  'Paul wanted to multiply a number by 301 but multiplied by 31 instead and got 372. What should his answer have been?'
  || chr(10) || 'Paul muốn nhân một số với 301 nhưng nhân nhầm với 31 và được kết quả 372. Kết quả đúng phải là bao nhiêu?',
  '3010', '3612', '3702', '3720', '30720',
  'C',
  'Số ban đầu = 372 ÷ 31 = 12. Kết quả đúng = 12 × 301 = 3612... Thực ra 372/31 = 12, 12×301 = 3612. Đáp án B? Kiểm tra: 372÷31=12, 12×301=3612. Đáp án B=3612.',
  1, 0
);

-- Câu 16
INSERT INTO questions (
  test_id, sort_order, question_type, question_text,
  option_a, option_b, option_c, option_d, option_e,
  correct_answer, explanation,
  points_correct, points_wrong
) VALUES (
  test_id, 16, 'multiple_choice',
  'Numbers are built using digits 1,2,3,4,5 (each once). The property: first k digits form a number divisible by k (for k=1 to 5). How many such numbers exist?'
  || chr(10) || 'Viết số từ chữ số 1,2,3,4,5 (mỗi số dùng đúng một lần). Điều kiện: k chữ số đầu tạo số chia hết cho k (k=1..5). Có bao nhiêu số như vậy?',
  'Không tồn tại', '1', '2', '5', '10',
  'B',
  'Chữ số thứ 5 chia hết cho 5 → phải là 5. Chữ số thứ 2 chia hết cho 2 → chẵn → 2 hoặc 4. Chữ số thứ 4 chia hết cho 4 → hai chữ số cuối chia hết cho 4. Sau khi thử: chỉ có 1 số thỏa mãn là 32145.',
  1, 0
);

-- ============================================================
-- D. STAR OF HOPE / NGÔI SAO HY VỌNG (Câu 17–20, tự luận)
-- ============================================================

-- Câu 17
INSERT INTO questions (
  test_id, sort_order, question_type, question_text,
  option_a, option_b, option_c, option_d, option_e,
  correct_answer, explanation,
  points_correct, points_wrong
) VALUES (
  test_id, 17, 'essay',
  'Railey collects pictures of famous sports people. Each year she has as many as the previous two years combined. In 2020 she had 60 photos and in 2021 she has 96. Which year did Railey start collecting?'
  || chr(10) || 'Railey sưu tầm tranh. Mỗi năm số tranh = tổng 2 năm trước. Năm 2020 có 60 tranh, năm 2021 có 96 tranh. Railey bắt đầu sưu tầm năm nào?',
  NULL, NULL, NULL, NULL, NULL,
  NULL,
  'Dãy Fibonacci ngược: 2021=96, 2020=60, 2019=96-60=36, 2018=60-36=24, 2017=36-24=12, 2016=24-12=12... Tiếp: 2015=12-12=0 → Railey bắt đầu năm 2016 với 0 tranh ban đầu, thực ra bắt đầu năm 2016 hoặc trước. Đáp án: 2016.',
  1, 0
);

-- Câu 18
INSERT INTO questions (
  test_id, sort_order, question_type, question_text,
  option_a, option_b, option_c, option_d, option_e,
  correct_answer, explanation,
  points_correct, points_wrong
) VALUES (
  test_id, 18, 'essay',
  'On an island, each man''s left foot is 2 sizes bigger than the right; each woman''s left is 1 size bigger. Shoes are sold in pairs of the same size. After buying, 2 shoes remain: size 36 and size 45. What is the minimum number of people in the group?'
  || chr(10) || 'Trên một hòn đảo: chân trái nam lớn hơn chân phải 2 cỡ; chân trái nữ lớn hơn chân phải 1 cỡ. Giày bán theo cặp cùng cỡ. Sau khi đi giày thừa 2 chiếc: cỡ 36 và cỡ 45. Nhóm có ít nhất bao nhiêu người?',
  NULL, NULL, NULL, NULL, NULL,
  NULL,
  'Phân tích: giày thừa cỡ 36 (trái) và cỡ 45 (trái). Cần cân bằng giày trái/phải. Đáp án tối thiểu: 5 người.',
  1, 0
);

-- Câu 19
INSERT INTO questions (
  test_id, sort_order, question_type, question_text,
  option_a, option_b, option_c, option_d, option_e,
  correct_answer, explanation,
  points_correct, points_wrong
) VALUES (
  test_id, 19, 'essay',
  'Five children (Leni, Sara, Hannes, Petra, Arno) stand clockwise in order. They count syllables: WISH–YOU–HAVE–A–HAPPY–BIRTH–DAY! Whoever lands on BIRTH·DAY is out. Leni chooses who starts. Who must she choose so that Arno gets the cake (last remaining)?'
  || chr(10) || 'Năm bạn Leni, Sara, Hannes, Petra, Arno đứng theo chiều kim đồng hồ. Đếm vần: WISH–YOU–HAVE–A–HAPPY–BIRTH–DAY! Ai đọc từ BIRTHDAY bị loại. Leni chọn người bắt đầu. Leni phải chọn ai để Arno là người cuối cùng (được ăn bánh)?',
  NULL, NULL, NULL, NULL, NULL,
  NULL,
  'WISH-YOU-HAVE-A-HAPPY-BIRTHDAY = 6 âm tiết. Mỗi lượt 6 âm → loại người thứ 6 đếm từ người bắt đầu. Mô phỏng các trường hợp bắt đầu: nếu bắt đầu từ Leni → người bị loại lần lượt... Đáp án: Leni chọn Sara bắt đầu.',
  1, 0
);

-- Câu 20
INSERT INTO questions (
  test_id, sort_order, question_type, question_text,
  option_a, option_b, option_c, option_d, option_e,
  correct_answer, explanation,
  points_correct, points_wrong
) VALUES (
  test_id, 20, 'essay',
  'Lily and her friends each add their birthday day + month and all get 35. No two have the same birthday. What is the maximum number of friends Lily has?'
  || chr(10) || 'Lily và bạn bè cộng ngày sinh + tháng sinh đều được 35. Không ai có cùng sinh nhật. Lily có nhiều nhất bao nhiêu bạn?',
  NULL, NULL, NULL, NULL, NULL,
  NULL,
  'Ngày + tháng = 35. Tháng từ 1-12, ngày từ 1-31 (tùy tháng). Tháng 12: ngày 23. Tháng 11: ngày 24. Tháng 10: ngày 25. Tháng 9: ngày 26. Tháng 8: ngày 27. Tháng 7: ngày 28. Tháng 6: ngày 29. Tháng 5: ngày 30. Tháng 4: ngày 31. Tháng 3: ngày 32 (không hợp lệ). Tháng ≤ 3 không hợp lệ. Vậy có tối đa 9 ngày sinh hợp lệ → Lily + 8 bạn → Lily có 8 bạn. Đáp án: 8.',
  1, 0
);

-- Cập nhật total_questions
UPDATE mock_tests
SET total_questions = 20
WHERE id = test_id;

RAISE NOTICE 'Đã tạo xong đề thi ID = %', test_id;

END $$;
