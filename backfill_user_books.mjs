/**
 * Backfill user_books & user_documents từ các đơn hàng đã thanh toán (paid)
 * Chạy một lần: node backfill_user_books.mjs
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

async function main() {
  console.log('🔍 Lấy tất cả đơn hàng đã thanh toán (paid) có user_id...')

  const { data: orders, error: ordersErr } = await supabase
    .from('orders')
    .select('id, user_id')
    .eq('status', 'paid')
    .not('user_id', 'is', null)

  if (ordersErr) throw ordersErr
  console.log(`📦 Tìm thấy ${orders.length} đơn hàng paid`)

  let bookActivated = 0
  let docActivated = 0
  let skipped = 0

  for (const order of orders) {
    const { data: items, error: itemsErr } = await supabase
      .from('order_items')
      .select('product_type, product_id')
      .eq('order_id', order.id)

    if (itemsErr) { console.error('Lỗi lấy items đơn', order.id, itemsErr); continue }

    for (const item of items) {
      if (item.product_type === 'book') {
        const { error } = await supabase
          .from('user_books')
          .upsert(
            { user_id: order.user_id, book_id: item.product_id, activated_at: new Date().toISOString() },
            { onConflict: 'user_id, book_id' }
          )
        if (error) {
          console.error(`  ❌ Lỗi kích hoạt sách ${item.product_id} cho user ${order.user_id}:`, error.message)
        } else {
          bookActivated++
          console.log(`  ✅ Sách ${item.product_id} → user ${order.user_id}`)
        }
      } else if (item.product_type === 'document') {
        const { error } = await supabase
          .from('user_documents')
          .upsert(
            { user_id: order.user_id, document_id: parseInt(item.product_id) },
            { onConflict: 'user_id, document_id' }
          )
        if (error) {
          console.error(`  ❌ Lỗi kích hoạt tài liệu ${item.product_id} cho user ${order.user_id}:`, error.message)
        } else {
          docActivated++
          console.log(`  ✅ Tài liệu ${item.product_id} → user ${order.user_id}`)
        }
      } else {
        skipped++
      }
    }
  }

  console.log('\n=== KẾT QUẢ ===')
  console.log(`✅ Sách đã kích hoạt: ${bookActivated}`)
  console.log(`✅ Tài liệu đã kích hoạt: ${docActivated}`)
  console.log(`⏭  Bỏ qua (khóa học/combo): ${skipped}`)
  console.log('🎉 Hoàn tất!')
}

main().catch(err => {
  console.error('❌ Lỗi:', err)
  process.exit(1)
})
