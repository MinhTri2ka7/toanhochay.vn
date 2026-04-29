-- Add option E to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS option_e TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS option_e_image TEXT DEFAULT '';
