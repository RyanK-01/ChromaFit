-- ============================================
-- ChromaFit All-in-One Database Migration
-- Run this SINGLE script in Supabase SQL Editor
-- ============================================
-- This migration adds all missing features:
-- 1. realistic_photo_url column to profiles
-- 2. wardrobe table for clothing items
-- 3. styled_outfits table for AI styling
-- ============================================

-- ============================================
-- MIGRATION 1: Add realistic_photo_url to profiles
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'realistic_photo_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN realistic_photo_url text;
    RAISE NOTICE '✅ Added realistic_photo_url column to profiles table';
  ELSE
    RAISE NOTICE 'ℹ️  Column realistic_photo_url already exists';
  END IF;
END $$;

-- ============================================
-- MIGRATION 2: Create wardrobe table
-- ============================================
CREATE TABLE IF NOT EXISTS public.wardrobe (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text not null check (category in ('top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessories', 'other')),
  original_photo_url text not null,
  ai_generated_url text,
  brand text,
  size text,
  color text,
  material text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for wardrobe
ALTER TABLE public.wardrobe ENABLE ROW LEVEL SECURITY;

-- Drop existing wardrobe policies (if any)
DROP POLICY IF EXISTS "Users can view their own wardrobe" ON public.wardrobe;
DROP POLICY IF EXISTS "Users can insert their own wardrobe items" ON public.wardrobe;
DROP POLICY IF EXISTS "Users can update their own wardrobe items" ON public.wardrobe;
DROP POLICY IF EXISTS "Users can delete their own wardrobe items" ON public.wardrobe;

-- Create RLS policies for wardrobe
CREATE POLICY "Users can view their own wardrobe"
ON public.wardrobe FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wardrobe items"
ON public.wardrobe FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wardrobe items"
ON public.wardrobe FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wardrobe items"
ON public.wardrobe FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for wardrobe
CREATE INDEX IF NOT EXISTS idx_wardrobe_user_id ON public.wardrobe(user_id);
CREATE INDEX IF NOT EXISTS idx_wardrobe_category ON public.wardrobe(category);
CREATE INDEX IF NOT EXISTS idx_wardrobe_created_at ON public.wardrobe(created_at DESC);

-- ============================================
-- MIGRATION 3: Create styled_outfits table
-- ============================================
CREATE TABLE IF NOT EXISTS public.styled_outfits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  environment_type text not null,
  outfit_description text,
  selected_garment_ids uuid[] default '{}',
  styled_image_url text not null,
  ai_prompt text,
  user_rating integer check (user_rating >= 1 and user_rating <= 5),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for styled_outfits
ALTER TABLE public.styled_outfits ENABLE ROW LEVEL SECURITY;

-- Drop existing styled_outfits policies (if any)
DROP POLICY IF EXISTS "Users can view their own styled outfits" ON public.styled_outfits;
DROP POLICY IF EXISTS "Users can insert their own styled outfits" ON public.styled_outfits;
DROP POLICY IF EXISTS "Users can update their own styled outfits" ON public.styled_outfits;
DROP POLICY IF EXISTS "Users can delete their own styled outfits" ON public.styled_outfits;

-- Create RLS policies for styled_outfits
CREATE POLICY "Users can view their own styled outfits"
ON public.styled_outfits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own styled outfits"
ON public.styled_outfits FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own styled outfits"
ON public.styled_outfits FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own styled outfits"
ON public.styled_outfits FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for styled_outfits
CREATE INDEX IF NOT EXISTS idx_styled_outfits_user_id ON public.styled_outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_styled_outfits_environment ON public.styled_outfits(environment_type);
CREATE INDEX IF NOT EXISTS idx_styled_outfits_created_at ON public.styled_outfits(created_at DESC);

-- ============================================
-- VERIFICATION: Check all migrations completed
-- ============================================
DO $$
DECLARE
  v_profiles_realistic BOOLEAN;
  v_wardrobe_exists BOOLEAN;
  v_styled_outfits_exists BOOLEAN;
  v_wardrobe_columns INTEGER;
  v_styled_outfits_columns INTEGER;
BEGIN
  -- Check profiles.realistic_photo_url
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'realistic_photo_url'
  ) INTO v_profiles_realistic;
  
  -- Check wardrobe table
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'wardrobe'
  ) INTO v_wardrobe_exists;
  
  -- Check styled_outfits table
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'styled_outfits'
  ) INTO v_styled_outfits_exists;
  
  -- Count columns
  SELECT COUNT(*) INTO v_wardrobe_columns
  FROM information_schema.columns 
  WHERE table_schema = 'public' AND table_name = 'wardrobe';
  
  SELECT COUNT(*) INTO v_styled_outfits_columns
  FROM information_schema.columns 
  WHERE table_schema = 'public' AND table_name = 'styled_outfits';
  
  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'ChromaFit Migration Verification';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
  
  IF v_profiles_realistic THEN
    RAISE NOTICE '✅ profiles.realistic_photo_url - EXISTS';
  ELSE
    RAISE NOTICE '❌ profiles.realistic_photo_url - MISSING';
  END IF;
  
  IF v_wardrobe_exists THEN
    RAISE NOTICE '✅ wardrobe table - EXISTS (% columns)', v_wardrobe_columns;
  ELSE
    RAISE NOTICE '❌ wardrobe table - MISSING';
  END IF;
  
  IF v_styled_outfits_exists THEN
    RAISE NOTICE '✅ styled_outfits table - EXISTS (% columns)', v_styled_outfits_columns;
  ELSE
    RAISE NOTICE '❌ styled_outfits table - MISSING';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '==========================================';
  
  IF v_profiles_realistic AND v_wardrobe_exists AND v_styled_outfits_exists THEN
    RAISE NOTICE '🎉 All migrations completed successfully!';
    RAISE NOTICE '   You can now use:';
    RAISE NOTICE '   - Profile realistic photos';
    RAISE NOTICE '   - Wardrobe feature';
    RAISE NOTICE '   - AI Styling feature';
  ELSE
    RAISE NOTICE '⚠️  Some migrations failed. Check logs above.';
  END IF;
  
  RAISE NOTICE '==========================================';
  RAISE NOTICE '';
END $$;
