import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// Test if lessons table exists
async function check() {
  const { data, error } = await supabase.from('lessons').select('id').limit(1)
  if (error) {
    console.log('❌ Table "lessons" does NOT exist:', error.message)
    console.log('\n⚠️  You MUST run the SQL migration in Supabase SQL Editor!')
    console.log('   Go to: https://supabase.com/dashboard/project/zmmixpcxlezhadbqtiey/sql/new')
    console.log('   And paste the SQL from: supabase/migrations/006_lessons_system.sql')
  } else {
    console.log('✓ Table "lessons" exists, rows:', data.length)
  }

  // Also check questions scoring columns
  const { data: q, error: qe } = await supabase.from('questions').select('points_correct').limit(1)
  if (qe) console.log('❌ questions.points_correct missing:', qe.message)
  else console.log('✓ questions.points_correct exists')

  // Test insert a lesson
  if (!error) {
    console.log('\nTesting lesson insert...')
    const { data: testInsert, error: insertErr } = await supabase.from('lessons').insert({
      course_id: 'c1',
      title: 'TEST - Bài học thử nghiệm',
      description: 'Test lesson',
      video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      sort_order: 999,
      status: 'active',
    }).select()
    if (insertErr) {
      console.log('❌ Insert FAILED:', insertErr.message)
      console.log('   Details:', JSON.stringify(insertErr))
    } else {
      console.log('✓ Insert OK, id:', testInsert[0]?.id)
      // Clean up test
      if (testInsert[0]?.id) {
        await supabase.from('lessons').delete().eq('id', testInsert[0].id)
        console.log('✓ Test lesson cleaned up')
      }
    }
  }
}

check()
