-- Easy Insurance Database Schema
-- Run this in Supabase SQL Editor or via migrations

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'agent', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance companies
CREATE TABLE IF NOT EXISTS insurance_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_en TEXT,
  logo_url TEXT,
  website TEXT,
  phone TEXT,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance plans
CREATE TABLE IF NOT EXISTS insurance_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES insurance_companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('health', 'life', 'car')),

  -- Pricing
  premium_yearly DECIMAL(10,2) NOT NULL,
  premium_monthly DECIMAL(10,2),
  sum_insured DECIMAL(12,2) NOT NULL,

  -- Coverage (JSONB for flexibility)
  coverage JSONB DEFAULT '{}',

  -- Details
  description TEXT,
  benefits TEXT[] DEFAULT '{}',
  exclusions TEXT[] DEFAULT '{}',
  waiting_period_days INTEGER,
  documents_required TEXT[] DEFAULT '{}',

  -- Age restrictions
  min_age INTEGER,
  max_age INTEGER,

  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved plans
CREATE TABLE IF NOT EXISTS saved_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES insurance_plans(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plan_id)
);

-- Comparison history
CREATE TABLE IF NOT EXISTS comparison_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  plan_ids UUID[] NOT NULL,
  share_code TEXT UNIQUE,
  insurance_type TEXT CHECK (insurance_type IN ('health', 'life', 'car')),
  filters JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads (interested customers)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES insurance_plans(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_plans_type ON insurance_plans(type);
CREATE INDEX IF NOT EXISTS idx_plans_company ON insurance_plans(company_id);
CREATE INDEX IF NOT EXISTS idx_plans_active ON insurance_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_comparison_share ON comparison_history(share_code);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Saved plans policies
CREATE POLICY "Users can view own saved plans" ON saved_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved plans" ON saved_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved plans" ON saved_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Comparison history policies
CREATE POLICY "Users can view own comparison history" ON comparison_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own comparison history" ON comparison_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view shared comparisons" ON comparison_history
  FOR SELECT USING (share_code IS NOT NULL);

-- Insurance plans are public read
ALTER TABLE insurance_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active plans" ON insurance_plans
  FOR SELECT USING (is_active = true);

-- Insurance companies are public read
ALTER TABLE insurance_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view companies" ON insurance_companies
  FOR SELECT USING (true);

-- Leads policies
CREATE POLICY "Anyone can insert leads" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all leads" ON leads
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_insurance_plans_updated_at
  BEFORE UPDATE ON insurance_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
