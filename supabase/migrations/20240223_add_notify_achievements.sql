-- Add notify_achievements column to telegram_settings table
ALTER TABLE telegram_settings ADD COLUMN notify_achievements BOOLEAN DEFAULT false;

-- Update existing rows to have notify_achievements set to false
UPDATE telegram_settings SET notify_achievements = false WHERE notify_achievements IS NULL;
