// run_migration_011.mjs — Allow guest orders (user_id nullable)
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zmmixpcxlezhadbqtiey.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptbWl4cGN4bGV6aGFkYnF0aWV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzAzOTYyOCwiZXhwIjoyMDkyNjE1NjI4fQ.su0NgD99ssGyN63zX2RPAfqfI2eC143bCU0yOvonKJk'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
})

const steps = [
  // 1. Bỏ NOT NULL trên user_id
  `ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL`,

  // 2. Xoá policy insert cũ (yêu cầu user_id = auth.uid())
  `DROP POLICY IF EXISTS "orders_own_insert" ON orders`,

  // 3. Tạo policy mới: cho phép guest (user_id IS NULL) hoặc user đã đăng nhập
  `CREATE POLICY "orders_insert_allow_guest" ON orders
     FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid())`,

  // 4. Xoá policy read cũ
  `DROP POLICY IF EXISTS "orders_own_read" ON orders`,

  // 5. Policy read mới: user thấy đơn của mình, admin thấy tất cả
  `CREATE POLICY "orders_own_read" ON orders
     FOR SELECT USING (
       user_id = auth.uid()
       OR EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'staff'))
     )`,

  // 6. Xoá policy order_items insert cũ
  `DROP POLICY IF EXISTS "order_items_own_insert" ON order_items`,

  // 7. Policy order_items insert mới: cho phép guest orders
  `CREATE POLICY "order_items_insert_allow_guest" ON order_items
     FOR INSERT WITH CHECK (
       EXISTS (
         SELECT 1 FROM orders o
         WHERE o.id = order_items.order_id
           AND (o.user_id IS NULL OR o.user_id = auth.uid())
       )
     )`,
]

console.log('🚀 Running migration 011: Allow guest orders...\n')

for (const sql of steps) {
  const short = sql.trim().split('\n')[0].substring(0, 60)
  try {
    const { error } = await supabase.rpc('exec_sql', { query: sql })
    if (error) {
      // Try direct query via pg REST
      throw error
    }
    console.log(`✅ ${short}`)
  } catch (err) {
    // supabase-js doesn't expose raw SQL — use fetch to Supabase SQL endpoint
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: sql })
    })
    console.log(`⚠️  ${short} — ${err.message}`)
  }
}

// Dùng pg trực tiếp qua Supabase REST SQL API (management API)
console.log('\n📡 Sending SQL via Supabase Management API...')
const projectRef = 'zmmixpcxlezhadbqtiey'

for (const sql of steps) {
  const short = sql.trim().split('\n')[0].substring(0, 70)
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`
    },
    body: JSON.stringify({ query: sql })
  })
  const text = await res.text()
  if (res.ok) {
    console.log(`✅ ${short}`)
  } else {
    console.log(`❌ ${short}\n   → ${text.substring(0, 120)}`)
  }
}
