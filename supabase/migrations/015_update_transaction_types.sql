-- Update transaction types to include escrow operations
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;

ALTER TABLE transactions 
ADD CONSTRAINT transactions_type_check 
CHECK (type IN (
    'deposit', 
    'withdrawal', 
    'milestone_payment', 
    'milestone_received', 
    'escrow_lock', 
    'escrow_refund'
));
