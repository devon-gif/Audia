-- Migration: Add preferred_length column to subscriptions table
-- This allows users to set their preferred summary length for Auto-Distill

-- Add the preferred_length column with default value of '5m'
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS preferred_length VARCHAR(10) DEFAULT '5m';

-- Add a comment explaining the column
COMMENT ON COLUMN subscriptions.preferred_length IS 'Preferred summary length for Auto-Distill: 3m, 5m, or 10m';

-- Create an index for faster lookups (optional, but good for performance)
CREATE INDEX IF NOT EXISTS idx_subscriptions_preferred_length 
ON subscriptions(preferred_length);

-- Update existing subscriptions to have the default value
UPDATE subscriptions 
SET preferred_length = '5m' 
WHERE preferred_length IS NULL;
