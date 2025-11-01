-- Create user_investments table
-- This table stores investment allocation percentages for user goals
-- When a goal is created, an investment row is automatically created with equity/debt percentages
-- These percentages are determined by an LLM (Gemini) based on user questionnaire answers and goal details

CREATE TABLE IF NOT EXISTS user_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES user_goals(id) ON DELETE CASCADE,
  percentage_debt DECIMAL(5, 2) NOT NULL CHECK (percentage_debt >= 0 AND percentage_debt <= 100),
  percentage_equity DECIMAL(5, 2) NOT NULL CHECK (percentage_equity >= 0 AND percentage_equity <= 100),
  
  -- Ensure percentages sum to 100
  CONSTRAINT percentages_sum_to_100 CHECK (percentage_debt + percentage_equity = 100),
  
  -- One investment per goal
  UNIQUE(goal_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_investments_user_id ON user_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_investments_goal_id ON user_investments(goal_id);

