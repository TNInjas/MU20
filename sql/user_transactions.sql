-- Create user_transactions table
-- This table stores user bank transactions filtered by inflow and outflow (cashflow ledger)
-- user_id + timestamp as composite primary key
-- user_id refers to auth.users(id)
-- category: the category of the transaction
-- amount: negative means outflow, positive means inflow

CREATE TABLE IF NOT EXISTS user_transactions (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  
  -- Composite primary key
  PRIMARY KEY (user_id, timestamp)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_transactions_user_id ON user_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_transactions_timestamp ON user_transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_transactions_category ON user_transactions(category);

-- Sample data (replace with actual user_id from auth.users)
-- Note: Update the user_id below with an actual user ID from your auth.users table
-- To get a user_id, run: SELECT id FROM auth.users LIMIT 1;

-- Sample transactions (you'll need to replace 'USER_ID_HERE' with actual user ID)
INSERT INTO user_transactions (user_id, timestamp, category, amount) VALUES
-- Inflow transactions (positive amounts)
('USER_ID_HERE', NOW() - INTERVAL '30 days', 'Salary', 5000.00),
('USER_ID_HERE', NOW() - INTERVAL '25 days', 'Freelance', 1200.00),
('USER_ID_HERE', NOW() - INTERVAL '20 days', 'Investment Returns', 150.50),
('USER_ID_HERE', NOW() - INTERVAL '15 days', 'Salary', 5000.00),
('USER_ID_HERE', NOW() - INTERVAL '10 days', 'Refund', 89.99),
('USER_ID_HERE', NOW() - INTERVAL '5 days', 'Gift', 200.00),
('USER_ID_HERE', NOW() - INTERVAL '2 days', 'Freelance', 800.00),

-- Outflow transactions (negative amounts)
('USER_ID_HERE', NOW() - INTERVAL '29 days', 'Groceries', -150.75),
('USER_ID_HERE', NOW() - INTERVAL '28 days', 'Transportation', -45.00),
('USER_ID_HERE', NOW() - INTERVAL '27 days', 'Rent', -1200.00),
('USER_ID_HERE', NOW() - INTERVAL '26 days', 'Entertainment', -75.50),
('USER_ID_HERE', NOW() - INTERVAL '24 days', 'Utilities', -120.00),
('USER_ID_HERE', NOW() - INTERVAL '23 days', 'Shopping', -299.99),
('USER_ID_HERE', NOW() - INTERVAL '22 days', 'Groceries', -180.25),
('USER_ID_HERE', NOW() - INTERVAL '21 days', 'Restaurant', -65.00),
('USER_ID_HERE', NOW() - INTERVAL '19 days', 'Transportation', -50.00),
('USER_ID_HERE', NOW() - INTERVAL '18 days', 'Shopping', -150.00),
('USER_ID_HERE', NOW() - INTERVAL '17 days', 'Utilities', -115.50),
('USER_ID_HERE', NOW() - INTERVAL '16 days', 'Entertainment', -45.00),
('USER_ID_HERE', NOW() - INTERVAL '14 days', 'Groceries', -165.00),
('USER_ID_HERE', NOW() - INTERVAL '13 days', 'Rent', -1200.00),
('USER_ID_HERE', NOW() - INTERVAL '12 days', 'Transportation', -35.00),
('USER_ID_HERE', NOW() - INTERVAL '11 days', 'Restaurant', -85.50),
('USER_ID_HERE', NOW() - INTERVAL '9 days', 'Shopping', -220.00),
('USER_ID_HERE', NOW() - INTERVAL '8 days', 'Groceries', -145.75),
('USER_ID_HERE', NOW() - INTERVAL '7 days', 'Entertainment', -120.00),
('USER_ID_HERE', NOW() - INTERVAL '6 days', 'Utilities', -125.00),
('USER_ID_HERE', NOW() - INTERVAL '4 days', 'Transportation', -40.00),
('USER_ID_HERE', NOW() - INTERVAL '3 days', 'Restaurant', -95.00),
('USER_ID_HERE', NOW() - INTERVAL '1 day', 'Groceries', -170.50),
('USER_ID_HERE', NOW() - INTERVAL '12 hours', 'Shopping', -180.00);

-- To insert sample data for a specific user, first get their ID:
-- SELECT id FROM auth.users WHERE email = 'your-email@example.com';
-- Then replace 'USER_ID_HERE' in the INSERT statements above with that ID.
