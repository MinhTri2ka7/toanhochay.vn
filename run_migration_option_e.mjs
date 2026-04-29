import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function run() {
  console.log('Checking if option_e column exists...')
  const { data, error } = await supabase.from('questions').select('option_e').limit(1)
  if (!error) {
    console.log('✅ option_e column already exists!')
  } else {
    console.log('⚠️  Column does not exist. Please run this SQL in Supabase Dashboard:')
    console.log('')
    console.log('ALTER TABLE questions ADD COLUMN IF NOT EXISTS option_e TEXT;')
    console.log("ALTER TABLE questions ADD COLUMN IF NOT EXISTS option_e_image TEXT DEFAULT '';")
    console.log('')
    console.log('Go to: https://supabase.com/dashboard/project/zmmixpcxlezhadbqtiey/sql/new')
  }
}

run()
