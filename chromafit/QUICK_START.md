# ChromaFit Quick Start Guide

## 🚀 Get ChromaFit Running in 5 Minutes

### Step 1: Prerequisites
- Node.js 18+ installed
- A Supabase account (free at supabase.com)

### Step 2: Setup Supabase
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for it to be ready (1-2 minutes)
3. Go to Settings → API and copy:
   - Project URL
   - anon/public key
   - service_role key

### Step 3: Configure Environment
Create a file called `.env.local` in the `chromafit` folder:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 4: Install and Run
```bash
cd chromafit
npm install
npm run dev
```

### Step 5: Setup Database (Optional)
For full functionality, run the SQL from `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor.

## 🎯 What You'll See

- **Landing Page**: Beautiful homepage with feature overview
- **Authentication**: Sign up/login forms (basic functionality)
- **Dashboard**: Main app interface (some features may need database setup)

## 🔧 Current Status

✅ **Working:**
- Next.js app with Tailwind CSS
- Basic landing page
- Project structure and components
- Mock API endpoints

⚠️ **Needs Database Setup:**
- User authentication
- Avatar creation
- Wardrobe management
- Try-on features

## 🚀 Next Steps

1. **Test the basic app**: `npm run dev` and visit `http://localhost:3000`
2. **Set up Supabase**: Add your credentials to `.env.local`
3. **Deploy database**: Run the migration SQL in Supabase
4. **Full functionality**: All features will work with proper database setup

## 📁 Project Structure

```
chromafit/
├── src/
│   ├── app/           # Next.js pages
│   ├── components/    # React components
│   ├── hooks/         # Custom hooks
│   └── lib/           # Utilities
├── supabase/          # Database schema & functions
└── docs/              # Documentation
```

## 🆘 Need Help?

- Check the browser console for errors
- Verify your `.env.local` file has correct Supabase credentials
- Make sure your Supabase project is active
- See `SETUP.md` for detailed instructions

**Happy coding!** 🎉
