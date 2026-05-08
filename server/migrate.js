/**
 * Migration script: Create user_documents table if not exists
 * Run with: node server/migrate.js
 */
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

// Check if table exists
const { error: checkError } = await supabase
  .from('user_documents')
  .select('id')
  .limit(1)

if (!checkError) {
  console.log('✅ Table user_documents already exists!')
  process.exit(0)
}

console.log('Table user_documents not found. Creating...')

// Create via RPC if available, otherwise show SQL
// Supabase service_role cannot DDL via REST API — need Management API or CLI
// Use the Management API with the service role JWT as a workaround
const DB_URL = process.env.SUPABASE_URL.replace('https://', '').replace('.supabase.co', '')
const mgmtResponse = await fetch(`https://api.supabase.com/v1/projects/${DB_URL}/database/query`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Management API uses Supabase access token, not service role
    // This won't work without a personal access token
  },
  body: JSON.stringify({
    query: `CREATE TABLE IF NOT EXISTS public.user_documents (
      id bigserial PRIMARY KEY,
      user_id text NOT NULL,
      document_id integer NOT NULL,
      activated_at timestamptz DEFAULT now(),
      CONSTRAINT user_documents_unique UNIQUE(user_id, document_id)
    );`
  })
})

if (!mgmtResponse.ok) {
  console.log('\n⚠️  Cannot create table automatically.')
  console.log('\n📋 Please run this SQL in Supabase Dashboard → SQL Editor:')
  console.log('\nhttps://supabase.com/dashboard/project/zmmixpcxlezhadbqtiey/sql/new')
  console.log(`
CREATE TABLE IF NOT EXISTS public.user_documents (
  id bigserial PRIMARY KEY,
  user_id text NOT NULL,
  document_id integer NOT NULL,
  activated_at timestamptz DEFAULT now(),
  CONSTRAINT user_documents_unique UNIQUE(user_id, document_id)
);
  `)
  process.exit(1)
}

console.log('✅ Table created successfully!')
