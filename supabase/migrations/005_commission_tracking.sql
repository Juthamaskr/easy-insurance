-- Migration: Add commission tracking
-- This adds commission rate to plans and creates commission tracking table

-- Add commission_rate to insurance_plans
ALTER TABLE insurance_plans
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 0;

-- Add commission_amount to leads (calculated when converted)
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(10,2) DEFAULT 0;

-- Create commissions summary view
CREATE OR REPLACE VIEW commission_summary AS
SELECT
  DATE_TRUNC('month', l.created_at) as month,
  COUNT(*) FILTER (WHERE l.status = 'converted') as converted_count,
  SUM(l.commission_amount) FILTER (WHERE l.status = 'converted') as total_commission,
  COUNT(*) as total_leads
FROM leads l
GROUP BY DATE_TRUNC('month', l.created_at)
ORDER BY month DESC;

-- Create function to calculate commission
CREATE OR REPLACE FUNCTION calculate_commission(lead_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  plan_premium DECIMAL;
  plan_commission_rate DECIMAL;
  calculated_commission DECIMAL;
BEGIN
  SELECT
    ip.premium_yearly,
    ip.commission_rate
  INTO plan_premium, plan_commission_rate
  FROM leads l
  JOIN insurance_plans ip ON l.plan_id = ip.id
  WHERE l.id = lead_id;

  calculated_commission := COALESCE(plan_premium * plan_commission_rate / 100, 0);

  UPDATE leads
  SET commission_amount = calculated_commission
  WHERE id = lead_id;

  RETURN calculated_commission;
END;
$$ LANGUAGE plpgsql;

-- Add some sample commission rates
UPDATE insurance_plans SET commission_rate = 15 WHERE type = 'health';
UPDATE insurance_plans SET commission_rate = 25 WHERE type = 'life';
UPDATE insurance_plans SET commission_rate = 10 WHERE type = 'car';
