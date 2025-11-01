-- Create user_goals table
-- This table stores user financial goals with target amounts and current progress

CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount DECIMAL(15, 2) NOT NULL CHECK (target_amount > 0),
  current_amount DECIMAL(15, 2) DEFAULT 0 CHECK (current_amount >= 0),
  
  -- Ensure current amount doesn't exceed target (though this can be flexible)
  CONSTRAINT current_not_exceed_target CHECK (current_amount <= target_amount * 1.1)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);

