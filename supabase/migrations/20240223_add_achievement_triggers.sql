-- Function to notify about badge earned
CREATE OR REPLACE FUNCTION notify_badge_earned()
RETURNS TRIGGER AS $$
BEGIN
  -- Call edge function to send notification
  PERFORM net.http_post(
    url := current_setting('app.edge_function_url') || '/send-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', current_setting('app.edge_function_key')
    ),
    body := jsonb_build_object(
      'type', 'badge_earned',
      'data', jsonb_build_object(
        'user_id', NEW.user_id,
        'badge_id', NEW.badge_id
      )
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify about level up
CREATE OR REPLACE FUNCTION notify_level_up()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if level increased
  IF NEW.level > OLD.level THEN
    -- Call edge function to send notification
    PERFORM net.http_post(
      url := current_setting('app.edge_function_url') || '/send-notifications',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', current_setting('app.edge_function_key')
      ),
      body := jsonb_build_object(
        'type', 'level_up',
        'data', jsonb_build_object(
          'user_id', NEW.user_id,
          'level', NEW.level,
          'experience', NEW.experience
        )
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for badge earned
DROP TRIGGER IF EXISTS badge_earned_trigger ON user_badges;
CREATE TRIGGER badge_earned_trigger
  AFTER INSERT ON user_badges
  FOR EACH ROW
  EXECUTE FUNCTION notify_badge_earned();

-- Create trigger for level up
DROP TRIGGER IF EXISTS level_up_trigger ON user_levels;
CREATE TRIGGER level_up_trigger
  AFTER UPDATE ON user_levels
  FOR EACH ROW
  EXECUTE FUNCTION notify_level_up();
