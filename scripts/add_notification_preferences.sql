-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  email_job_applications BOOLEAN DEFAULT true,
  email_cover_requests BOOLEAN DEFAULT true,
  email_messages BOOLEAN DEFAULT true,
  email_job_matches BOOLEAN DEFAULT true,
  email_referrals BOOLEAN DEFAULT true,
  email_marketing BOOLEAN DEFAULT false,
  push_job_applications BOOLEAN DEFAULT true,
  push_cover_requests BOOLEAN DEFAULT true,
  push_messages BOOLEAN DEFAULT true,
  sms_urgent_covers BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
