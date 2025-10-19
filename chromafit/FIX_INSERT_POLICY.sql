-- ============================================
-- FIX: Wardrobe INSERT Policy
-- The issue: INSERT policy needs WITH CHECK, not USING
-- ============================================

-- Drop the incorrect INSERT policy
DROP POLICY IF EXISTS "Users can insert their own wardrobe items" ON public.wardrobe;

-- Create the CORRECT INSERT policy with WITH CHECK
CREATE POLICY "Users can insert their own wardrobe items"
ON public.wardrobe
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Verify it's correct
SELECT 
  'INSERT Policy Fixed' as status,
  policyname,
  cmd as operation,
  with_check as check_clause
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename = 'wardrobe'
  AND cmd = 'INSERT';

SELECT '✅ INSERT policy now uses WITH CHECK instead of USING' as message;
SELECT '✅ You should be able to upload to wardrobe now!' as message;
