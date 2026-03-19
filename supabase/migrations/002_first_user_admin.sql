-- Migration: First user becomes admin automatically
-- This updates the handle_new_user function to check if this is the first user

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
  new_role TEXT;
BEGIN
  -- Count existing profiles
  SELECT COUNT(*) INTO user_count FROM profiles;

  -- First user becomes admin, others are customers
  IF user_count = 0 THEN
    new_role := 'admin';
  ELSE
    new_role := 'customer';
  END IF;

  -- Insert new profile
  INSERT INTO profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    new_role
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
