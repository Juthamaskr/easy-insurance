-- Migration: Allow admins to manage insurance plans and companies
-- This adds policies for admins to CRUD insurance_plans and insurance_companies

-- =====================================================
-- Insurance Plans Policies
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active plans" ON insurance_plans;
DROP POLICY IF EXISTS "Admins can view all plans" ON insurance_plans;
DROP POLICY IF EXISTS "Admins can insert plans" ON insurance_plans;
DROP POLICY IF EXISTS "Admins can update plans" ON insurance_plans;
DROP POLICY IF EXISTS "Admins can delete plans" ON insurance_plans;

-- Enable RLS on insurance_plans
ALTER TABLE insurance_plans ENABLE ROW LEVEL SECURITY;

-- Anyone can view active plans (for public comparison page)
CREATE POLICY "Anyone can view active plans" ON insurance_plans
  FOR SELECT USING (is_active = true);

-- Admins can view ALL plans (including inactive)
CREATE POLICY "Admins can view all plans" ON insurance_plans
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can insert new plans
CREATE POLICY "Admins can insert plans" ON insurance_plans
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can update plans
CREATE POLICY "Admins can update plans" ON insurance_plans
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can delete plans
CREATE POLICY "Admins can delete plans" ON insurance_plans
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- Insurance Companies Policies
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view companies" ON insurance_companies;
DROP POLICY IF EXISTS "Admins can insert companies" ON insurance_companies;
DROP POLICY IF EXISTS "Admins can update companies" ON insurance_companies;
DROP POLICY IF EXISTS "Admins can delete companies" ON insurance_companies;

-- Enable RLS on insurance_companies
ALTER TABLE insurance_companies ENABLE ROW LEVEL SECURITY;

-- Anyone can view companies (for display in plans)
CREATE POLICY "Anyone can view companies" ON insurance_companies
  FOR SELECT USING (true);

-- Admins can insert new companies
CREATE POLICY "Admins can insert companies" ON insurance_companies
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can update companies
CREATE POLICY "Admins can update companies" ON insurance_companies
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can delete companies
CREATE POLICY "Admins can delete companies" ON insurance_companies
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
