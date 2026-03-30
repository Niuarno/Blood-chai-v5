-- BloodChai Initial Schema Migration
-- Run this entire script in the Supabase SQL Editor

-- 1. Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if re-running (Be careful in production!)
-- DROP TABLE IF EXISTS reports CASCADE;
-- DROP TABLE IF EXISTS emergency_requests CASCADE;
-- DROP TABLE IF EXISTS notices CASCADE;
-- DROP TABLE IF EXISTS reward_rules CASCADE;
-- DROP TABLE IF EXISTS payment_settings CASCADE;
-- DROP TABLE IF EXISTS blood_banks CASCADE;
-- DROP TABLE IF EXISTS donation_history CASCADE;
-- DROP TABLE IF EXISTS blood_requests CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- 3. Profiles Table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('donor', 'recipient', 'admin')),
  blood_group TEXT,
  division TEXT,
  district TEXT,
  upazila TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  active BOOLEAN DEFAULT true,
  points INTEGER DEFAULT 0,
  last_donation_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: Users can read all active donors, and their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
-- Note: Admins bypass RLS using the service_role key

-- 4. Blood Requests Table
CREATE TABLE blood_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES profiles(id) ON DELETE RESTRICT, -- who is being requested
  recipient_id UUID REFERENCES profiles(id) ON DELETE RESTRICT, -- who is asking
  hospital_address TEXT NOT NULL,
  mobile TEXT NOT NULL,
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'critical')),
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Donors and recipients can view their own requests" ON blood_requests FOR SELECT USING (auth.uid() = donor_id OR auth.uid() = recipient_id);
CREATE POLICY "Recipients can create requests" ON blood_requests FOR INSERT WITH CHECK (auth.uid() = recipient_id);
CREATE POLICY "Involved parties can update request status" ON blood_requests FOR UPDATE USING (auth.uid() = donor_id OR auth.uid() = recipient_id);

-- 5. Donation History Table
CREATE TABLE donation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  request_id UUID REFERENCES blood_requests(id) ON DELETE SET NULL,
  donated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE donation_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own history" ON donation_history FOR SELECT USING (auth.uid() = donor_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can insert their own history" ON donation_history FOR INSERT WITH CHECK (auth.uid() = donor_id OR auth.uid() = recipient_id);

-- Trigger to automatically update donor's last_donation_at, inactive status, and give points
CREATE OR REPLACE FUNCTION on_donation_history_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark donor inactive for 90 days and add 500 points
  UPDATE profiles 
  SET last_donation_at = NEW.donated_at,
      active = false,
      points = points + 500
  WHERE id = NEW.donor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_donor_after_donation
AFTER INSERT ON donation_history
FOR EACH ROW EXECUTE FUNCTION on_donation_history_insert();

-- 6. Emergency Requests Table
CREATE TABLE emergency_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- allows anon if we implement it, currently auth required
  blood_group TEXT NOT NULL,
  hospital TEXT NOT NULL,
  mobile TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE emergency_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Emergency requests are public" ON emergency_requests FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create emergency requests" ON emergency_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- Updates require service role (admin)

-- 7. Reports Table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  donor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  request_id UUID REFERENCES blood_requests(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can view reports" ON reports FOR SELECT USING (false); -- bypassed by service_role
CREATE POLICY "Authenticated users can create reports" ON reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 8. Blood Banks Directory
CREATE TABLE blood_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  division TEXT NOT NULL,
  district TEXT NOT NULL,
  upazila TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT
);

ALTER TABLE blood_banks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Blood banks are public viewable" ON blood_banks FOR SELECT USING (true);

-- 9. Notices Table
CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('public', 'donor')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notices are public viewable" ON notices FOR SELECT USING (true);

-- 10. Rewards Rulebook
CREATE TABLE reward_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE reward_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rewards are public viewable" ON reward_rules FOR SELECT USING (true);

-- 11. Payment Settings
CREATE TABLE payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method TEXT NOT NULL UNIQUE CHECK (method IN ('bkash', 'nagad', 'bank')),
  number TEXT NOT NULL,
  instructions TEXT NOT NULL
);

ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Payment settings are public viewable" ON payment_settings FOR SELECT USING (true);

-- 12. Storage Bucket for Avatars (Optional, creates if not exists)
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible."
on storage.objects for select
to public
using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
on storage.objects for insert
to public
with check ( bucket_id = 'avatars' );
