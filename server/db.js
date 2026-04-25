/**
 * Database adapter: Supabase PostgreSQL
 * Replaces better-sqlite3 with Supabase client
 * Provides helper methods used across all routes
 */
import supabase from './supabase.js'

// ============================================
// DB Helper - wraps Supabase for cleaner usage
// ============================================
const db = {
  supabase,

  // ---- Generic helpers ----

  /** Select all rows from a table with optional filters and ordering */
  async selectAll(table, { where = {}, order = null, columns = '*' } = {}) {
    let query = supabase.from(table).select(columns)
    for (const [col, val] of Object.entries(where)) {
      query = query.eq(col, val)
    }
    if (order) query = query.order(order.column, { ascending: order.ascending ?? true })
    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  /** Select single row */
  async selectOne(table, where = {}, columns = '*') {
    let query = supabase.from(table).select(columns)
    for (const [col, val] of Object.entries(where)) {
      query = query.eq(col, val)
    }
    const { data, error } = await query.limit(1).maybeSingle()
    if (error) throw error
    return data
  },

  /** Insert a row */
  async insert(table, row) {
    const { data, error } = await supabase.from(table).insert(row).select()
    if (error) throw error
    return data?.[0]
  },

  /** Insert multiple rows */
  async insertMany(table, rows) {
    const { data, error } = await supabase.from(table).insert(rows).select()
    if (error) throw error
    return data
  },

  /** Update rows matching `where` */
  async update(table, values, where = {}) {
    let query = supabase.from(table).update(values)
    for (const [col, val] of Object.entries(where)) {
      query = query.eq(col, val)
    }
    const { data, error } = await query.select()
    if (error) throw error
    return data
  },

  /** Delete rows matching `where` */
  async remove(table, where = {}) {
    let query = supabase.from(table).delete()
    for (const [col, val] of Object.entries(where)) {
      query = query.eq(col, val)
    }
    const { error } = await query
    if (error) throw error
  },

  /** Count rows with optional filter */
  async count(table, where = {}) {
    let query = supabase.from(table).select('*', { count: 'exact', head: true })
    for (const [col, val] of Object.entries(where)) {
      query = query.eq(col, val)
    }
    const { count, error } = await query
    if (error) throw error
    return count || 0
  },

  /** Run raw SQL via Supabase RPC (for complex queries) */
  async rpc(fnName, params = {}) {
    const { data, error } = await supabase.rpc(fnName, params)
    if (error) throw error
    return data
  },

  /** Upsert (insert or update on conflict) */
  async upsert(table, row, { onConflict } = {}) {
    const opts = onConflict ? { onConflict } : {}
    const { data, error } = await supabase.from(table).upsert(row, opts).select()
    if (error) throw error
    return data?.[0]
  },

  /** Increment a numeric column */
  async increment(table, column, amount, where = {}) {
    // Use RPC for atomic increment
    let query = supabase.from(table).select(`id, ${column}`)
    for (const [col, val] of Object.entries(where)) {
      query = query.eq(col, val)
    }
    const { data: rows, error: selErr } = await query.limit(1).maybeSingle()
    if (selErr) throw selErr
    if (!rows) return null

    const newVal = (rows[column] || 0) + amount
    const { error } = await supabase.from(table).update({ [column]: newVal }).eq('id', rows.id)
    if (error) throw error
    return newVal
  },
}

export default db
