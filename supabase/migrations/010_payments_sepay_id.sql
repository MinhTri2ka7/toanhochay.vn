-- ============================================
-- MIGRATION 010: Add sepay_transaction_id to payments for dedup
-- ============================================

-- Add unique SePay transaction ID column for deduplication
ALTER TABLE payments ADD COLUMN IF NOT EXISTS sepay_transaction_id INTEGER;

-- Create unique index to prevent duplicate webhook processing
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_sepay_txn_id ON payments(sepay_transaction_id) WHERE sepay_transaction_id IS NOT NULL;
