-- ============================================
-- MIGRATION 011: Allow guest (anonymous) orders
-- user_id can be NULL for document purchases without login
-- ============================================

-- 1. Bỏ NOT NULL constraint trên user_id
ALTER TABLE orders
  ALTER COLUMN user_id DROP NOT NULL;

-- 2. Bỏ FOREIGN KEY cũ (nếu có) và thêm lại dạng nullable
-- (Supabase thường không cần bước này nếu chỉ DROP NOT NULL,
--  nhưng giữ lại để rõ ràng)

-- 3. Xoá policy cũ "orders_own_insert" vì nó check user_id = auth.uid()
--    sẽ block guest inserts
DROP POLICY IF EXISTS "orders_own_insert" ON orders;

-- 4. Tạo policy mới: cho phép insert khi user_id = auth.uid() HOẶC user_id IS NULL (guest)
CREATE POLICY "orders_insert_allow_guest" ON orders
  FOR INSERT WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
  );

-- 5. Cập nhật policy read: user thấy đơn của mình, guest order (user_id IS NULL) chỉ admin thấy
DROP POLICY IF EXISTS "orders_own_read" ON orders;

CREATE POLICY "orders_own_read" ON orders
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'staff'))
  );

-- 6. order_items cũng cần policy cho guest orders
DROP POLICY IF EXISTS "order_items_own_insert" ON order_items;

CREATE POLICY "order_items_insert_allow_guest" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
        AND (o.user_id IS NULL OR o.user_id = auth.uid())
    )
  );
