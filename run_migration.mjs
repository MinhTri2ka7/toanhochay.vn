import pg from 'pg';
const client = new pg.Client({
  connectionString: 'postgresql://postgres.zmmixpcxlezhadbqtiey:toanhochay2025@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

try {
  await client.connect();
  console.log('Connected to database!');
  
  // Add attachments column to lessons
  await client.query(`ALTER TABLE lessons ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb`);
  console.log('✅ Added attachments column to lessons');
  
  // Create user_books table if missing
  await client.query(`CREATE TABLE IF NOT EXISTS user_books (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    book_id TEXT NOT NULL,
    activated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, book_id)
  )`);
  console.log('✅ Created user_books table');
  
  // Verify
  const { rows } = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'attachments'`);
  console.log('Attachments column exists:', rows.length > 0);
  
  const { rows: r2 } = await client.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_books')`);
  console.log('user_books table exists:', r2[0].exists);
  
  await client.end();
  console.log('\n✅ Migration complete!');
} catch(e) {
  console.error('Error:', e.message);
  await client.end().catch(() => {});
  process.exit(1);
}
