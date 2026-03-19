-- Migration: Add customer notes and follow-up tracking
-- This adds notes field for agents to track customer interactions

-- Add notes field to leads (agent notes, separate from customer message)
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

-- Add follow_up_date for reminder system
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMPTZ;

-- Add last_contacted_at for tracking
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;

-- Create customer_notes table for detailed history
CREATE TABLE IF NOT EXISTS customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  note_type TEXT DEFAULT 'general', -- 'general', 'call', 'meeting', 'email', 'followup'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on customer_notes
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Admins and agents can view all notes
CREATE POLICY "Staff can view notes" ON customer_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'agent')
    )
  );

-- Policy: Admins and agents can create notes
CREATE POLICY "Staff can create notes" ON customer_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'agent')
    )
  );

-- Policy: Users can update their own notes
CREATE POLICY "Users can update own notes" ON customer_notes
  FOR UPDATE USING (user_id = auth.uid());

-- Policy: Users can delete their own notes
CREATE POLICY "Users can delete own notes" ON customer_notes
  FOR DELETE USING (user_id = auth.uid());

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_customer_notes_lead ON customer_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_follow_up ON leads(follow_up_date);
