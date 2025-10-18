# Database Migrations

This folder contains database migration scripts for ChromaFit.

## 📁 File to Run

### ⭐ `run_this_migration.sql` - **USE THIS ONE**
This single file contains ALL migrations you need:
- Adds `realistic_photo_url` to profiles table
- Creates `wardrobe` table with RLS policies
- Creates `styled_outfits` table with RLS policies
- Includes verification checks

## 🚀 How to Run

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your ChromaFit project
3. Navigate to **SQL Editor**
4. Open `run_this_migration.sql`
5. Copy and paste the entire content
6. Click **Run** or press `Ctrl+Enter`
7. Check the output for verification results

## ✅ Expected Output

After running the migration, you should see:
```
==========================================
ChromaFit Migration Verification
==========================================

✅ profiles.realistic_photo_url - EXISTS
✅ wardrobe table - EXISTS (12 columns)
✅ styled_outfits table - EXISTS (9 columns)

==========================================
🎉 All migrations completed successfully!
   You can now use:
   - Profile realistic photos
   - Wardrobe feature
   - AI Styling feature
==========================================
```

##  Troubleshooting

### Error: "column already exists"
✅ This is fine! The script checks for existing columns and skips them.

### Error: "table already exists"
✅ This is fine! The script uses `CREATE TABLE IF NOT EXISTS`.

### Error: "permission denied"
❌ Make sure you're running the script as the project owner in Supabase.

---

## 📝 Notes

- This migration is **idempotent** (safe to run multiple times)
- All migrations include verification checks
- Existing data is preserved
- No downtime required
- Run this once per Supabase project
