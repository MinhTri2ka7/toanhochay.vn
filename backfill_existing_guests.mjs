import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const db = {
  async selectAll(table, { where = {} } = {}) {
    let query = supabase.from(table).select('*')
    for (const [col, val] of Object.entries(where)) {
      query = query.eq(col, val)
    }
    const { data, error } = await query
    if (error) throw error
    return data || []
  },
  async upsert(table, row, { onConflict } = {}) {
    const opts = onConflict ? { onConflict } : {}
    const { data, error } = await supabase.from(table).upsert(row, opts).select()
    if (error) throw error
    return data?.[0]
  }
}

async function main() {
  console.log('🔍 Fetching paid guest orders...')
  const { data: guestOrders, error: ordersErr } = await supabase
    .from('orders')
    .select('id, name, email, phone, total_amount')
    .eq('status', 'paid')
    .is('user_id', null)

  if (ordersErr) throw ordersErr
  console.log(`📦 Found ${guestOrders.length} paid guest orders`)

  let linkedCount = 0

  for (const order of guestOrders) {
    const emailSanitized = order.email?.toLowerCase().trim()
    const phoneSanitized = order.phone?.replace(/\s/g, '')

    if (!emailSanitized && !phoneSanitized) {
      console.log(`Order #${order.id} has no email or phone. Skipping.`)
      continue
    }

    const conditions = []
    if (emailSanitized) conditions.push(`email.eq.${emailSanitized}`)
    if (phoneSanitized) conditions.push(`phone.eq.${phoneSanitized}`)

    const { data: matchedUsers, error: userErr } = await supabase
      .from('users')
      .select('id, name, email, phone')
      .or(conditions.join(','))

    if (userErr) {
      console.error(`Error searching user for order #${order.id}:`, userErr.message)
      continue
    }

    if (!matchedUsers || matchedUsers.length === 0) {
      console.log(`No registered user matches guest order #${order.id} (${order.name}, email: ${order.email}, phone: ${order.phone})`)
      continue
    }

    const matchedUser = matchedUsers[0]
    console.log(`\nLinking order #${order.id} to user ${matchedUser.name} (${matchedUser.id})`)

    // Update order user_id
    const { error: updateErr } = await supabase
      .from('orders')
      .update({ user_id: matchedUser.id })
      .eq('id', order.id)

    if (updateErr) {
      console.error(`❌ Error updating order #${order.id}:`, updateErr.message)
      continue
    }

    linkedCount++

    // Fetch order items to activate
    const { data: orderItems, error: itemsErr } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)

    if (itemsErr) {
      console.error(`Error fetching items for order #${order.id}:`, itemsErr.message)
      continue
    }

    for (const item of orderItems || []) {
      console.log(`  Activating ${item.product_type}: ${item.product_id} (${item.product_name})`)
      if (item.product_type === 'course') {
        try {
          await db.upsert('user_courses', { user_id: matchedUser.id, course_id: item.product_id }, { onConflict: 'user_id, course_id' })
          console.log(`    ✅ Activated course`)
        } catch (e) { console.error('    ❌ Course activation error:', e.message) }
      } else if (item.product_type === 'combo') {
        try {
          const comboItems = await db.selectAll('combo_items', { where: { combo_id: item.product_id } })
          for (const ci of comboItems) {
            await db.upsert('user_courses', { user_id: matchedUser.id, course_id: ci.course_id }, { onConflict: 'user_id, course_id' })
          }
          console.log(`    ✅ Activated combo`)
        } catch (e) { console.error('    ❌ Combo activation error:', e.message) }
      } else if (item.product_type === 'book') {
        try {
          await db.upsert('user_books', { user_id: matchedUser.id, book_id: item.product_id, activated_at: new Date().toISOString() }, { onConflict: 'user_id, book_id' })
          console.log(`    ✅ Activated book`)
        } catch (e) { console.error('    ❌ Book activation error:', e.message) }
      } else if (item.product_type === 'document') {
        try {
          await db.upsert('user_documents', { user_id: matchedUser.id, document_id: parseInt(item.product_id) }, { onConflict: 'user_id, document_id' })
          console.log(`    ✅ Activated document`)
        } catch (e) { console.error('    ❌ Document activation error:', e.message) }
      }
    }
  }

  console.log(`\n=== Done! Linked ${linkedCount} guest orders. ===`)
}

main().catch(console.error)
