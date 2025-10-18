# ChromaFit Setup Guide

This guide will help you set up and run ChromaFit on your local machine.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier is fine)

## Step 1: Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Sign up/login and create a new project
   - Wait for the project to be ready (usually 1-2 minutes)

2. **Get Your Project Credentials**
   - In your Supabase dashboard, go to Settings → API
   - Copy your Project URL and anon/public key
   - Also copy your service_role key (keep this secret!)

3. **Create Environment File**
   - In the `chromafit` folder, create a file called `.env.local`
   - Add the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 2: Database Setup

1. **Install Supabase CLI** (optional but recommended)
   ```bash
   npm install -g supabase
   ```

2. **Deploy Database Schema**
   - In your Supabase dashboard, go to SQL Editor
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run the SQL to create all tables, policies, and storage buckets

   **OR** if you have Supabase CLI:
   ```bash
   supabase db push
   ```

## Step 3: Install Dependencies

```bash
cd chromafit
npm install
```

## Step 4: Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Step 5: Test the Application

1. **Sign Up**: Create a new account
2. **Onboarding**: Upload a photo to create your 3D avatar
3. **Add Garments**: Go to Wardrobe and add some clothing items
4. **Try-On**: Test the virtual try-on feature
5. **Explore**: Check out the style comparison features

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Make sure all dependencies are installed: `npm install`
   - Check that your `.env.local` file has the correct Supabase credentials

2. **Database Errors**
   - Verify your Supabase project is active
   - Check that the database schema was deployed correctly
   - Ensure RLS policies are enabled

3. **Authentication Issues**
   - Verify your Supabase URL and keys are correct
   - Check that email confirmation is disabled in Supabase Auth settings (for development)

4. **File Upload Issues**
   - Ensure storage buckets are created and have proper policies
   - Check that your Supabase project has storage enabled

### Development Tips

- **Hot Reload**: The app supports hot reloading, so changes will appear automatically
- **Database Changes**: Use the Supabase dashboard to view and modify data
- **Logs**: Check the browser console and terminal for error messages
- **Mock Data**: All AI features use mock data, so they'll work without real AI services

## Project Structure

```
chromafit/
├── src/
│   ├── app/                 # Next.js pages
│   ├── components/          # React components
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities
│   └── types/              # TypeScript types
├── supabase/
│   ├── functions/          # Edge Functions (mock AI)
│   └── migrations/         # Database schema
└── docs/                   # Documentation
```

## Next Steps

Once you have the app running:

1. **Customize**: Modify the UI, add new features, or change the styling
2. **Real AI**: Replace mock APIs with real AI services
3. **Deploy**: Use Vercel, Netlify, or your preferred platform
4. **Scale**: Add more features like social sharing, advanced analytics, etc.

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify your Supabase configuration
3. Make sure all dependencies are installed
4. Check the documentation in the `docs/` folder

Happy coding! 🚀
