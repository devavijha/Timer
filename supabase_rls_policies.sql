-- Supabase RLS Policies for User Profiles
-- Run these SQL commands in your Supabase SQL Editor

-- First, ensure RLS is enabled on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to insert their own profile
CREATE POLICY "Users can create their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy to allow users to read their own profile
CREATE POLICY "Users can read their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Optional: Policy to allow users to delete their own profile
CREATE POLICY "Users can delete their own profile" ON user_profiles
    FOR DELETE USING (auth.uid() = id);

-- Check if the table has the correct structure
-- Run this to see the current table structure:
-- \d user_profiles

-- If the user_profiles table doesn't exist, create it with this structure:
/*
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    preferences JSONB DEFAULT '{"notifications": true, "theme": "light", "language": "en"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
*/
