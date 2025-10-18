# 🔍 Troubleshooting: Can't Upload to Wardrobe

## ✅ Verified Fixes Applied

### 1. Pixel Requirement: FIXED ✅
**Location**: `src/components/AddGarmentDialog.tsx` lines 63-77

**Current Logic**:
- Images < 256x256: ❌ Rejected
- Images 256-511px: ⚠️ Warning shown, but **UPLOAD ALLOWED**
- Images ≥ 512x512: ✅ No warning

### 2. RLS Policy: FIXED ✅
**What we ran**: 
```sql
DROP POLICY IF EXISTS "Users can insert their own wardrobe items" ON public.wardrobe;
CREATE POLICY "Users can insert their own wardrobe items"
ON public.wardrobe FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**Result**: "Success. No rows returned" ✅

---

## ❓ What's the Current Error?

Please tell me **EXACTLY** what happens when you try to upload:

### Scenario A: Error Before Selecting Image
- [ ] Can't even click "Add New Item" button?
- [ ] Dialog doesn't open?

### Scenario B: Error When Selecting Image
- [ ] Select image but no preview shows?
- [ ] See error: "Image must be at least 256x256 pixels"?
- [ ] See warning: "⚠️ Image is smaller than recommended"?

### Scenario C: Error When Submitting
- [ ] Image preview shows fine
- [ ] Fill in details (name, category, etc.)
- [ ] Click submit
- [ ] Then what error do you see?

### Scenario D: Different Error
- [ ] Something else? What's the exact error message?

---

## 🧪 Let's Test Step by Step

### Test 1: Check Image Size
**What size is your test image?**
1. Right-click your image → Properties
2. Details tab → Dimensions
3. Tell me: Is it larger than 256x256?

### Test 2: Check Browser Console
1. Open browser (F12)
2. Go to Console tab
3. Try uploading
4. What errors appear? Copy them here

### Test 3: Check Network Tab
1. Open browser (F12)
2. Go to Network tab
3. Try uploading
4. Look for red/failed requests
5. Click the failed request
6. What does Response say?

---

## 🎯 Quick Debug Commands

**Open browser console (F12) and run**:

```javascript
// Check if you're logged in
localStorage.getItem('supabase.auth.token')

// Check current user
const { createClient } = await import('@/lib/supabase/client')
const supabase = createClient()
const { data } = await supabase.auth.getUser()
console.log('User:', data.user?.id)
```

---

## 📊 Most Likely Issues

### Issue 1: Server not restarted
**Symptom**: Changes not taking effect
**Solution**: 
- Stop server (Ctrl+C)
- Run: `npm run dev` again
- Wait for "Ready in XXXms"

### Issue 2: Cached code
**Symptom**: Old code still running
**Solution**: 
- Hard refresh browser (Ctrl+Shift+R)
- Or clear cache

### Issue 3: Wrong pixel check
**Symptom**: Still blocks 256-511px images
**Check**: Look at line 71 - does it say "Quality may be affected, but upload is allowed"?

### Issue 4: Different RLS error
**Symptom**: Not INSERT error, but something else
**Check**: What's the exact error code?

---

## 🚀 Next Steps

Please tell me:
1. **What's the exact error message?** (screenshot or copy-paste)
2. **What image size are you testing?** (e.g., 400x400)
3. **At what step does it fail?** (selecting image? submitting form?)
4. **What's in the browser console?** (any red errors?)

With this info, I can pinpoint the exact issue! 🔍
