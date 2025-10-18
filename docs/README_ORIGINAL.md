# ChromaFit - 3D Avatar Virtual Try-On Platform

ChromaFit is a web application that creates 3D avatars from user photos, enables virtual try-ons with wardrobe items, calculates explainable Fit Scores, and compares style similarity across users. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **3D Avatar Creation**: Upload a photo to generate a personalized 3D avatar with body measurements
- **Virtual Try-On**: Try on garments from your wardrobe or product URLs with realistic 3D visualization
- **AI-Powered Fit Analysis**: Get detailed fit scores and explanations for each try-on
- **Wardrobe Management**: Organize and manage your virtual wardrobe with categories and measurements
- **Style Comparison**: Discover similar styles from other users with AI-powered similarity matching
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router and TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **react-three-fiber** for 3D graphics
- **TanStack Query** for data fetching and caching
- **Lucide React** for icons

### Backend
- **Supabase** for authentication, database, and storage
- **PostgreSQL** with Row Level Security (RLS)
- **Supabase Edge Functions** (Deno) for AI processing
- **Vector embeddings** for style similarity

### AI/ML (Mock Implementation)
- Body measurement extraction from photos
- Garment category detection and measurement analysis
- Virtual try-on generation with fit scoring
- Style similarity calculation using embeddings

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Git

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd chromafit
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Database Setup

Deploy the database schema:

```bash
npx supabase db push
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main application pages
│   ├── onboarding/        # Avatar creation flow
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── Avatar3D.tsx      # 3D avatar viewer
│   ├── AvatarUpload.tsx  # Photo upload component
│   ├── GarmentCard.tsx   # Garment display card
│   ├── AddGarmentDialog.tsx # Add garment modal
│   ├── FitScoreDisplay.tsx  # Fit analysis component
│   └── OutfitCard.tsx    # Outfit display card
├── hooks/                # Custom React hooks
│   ├── useAuth.ts        # Authentication hook
│   ├── useAvatarModel.ts # Avatar data hook
│   ├── useTryOn.ts       # Try-on functionality
│   └── useStyleSimilarity.ts # Style comparison
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase client setup
│   └── similarity.ts     # Similarity calculations
├── types/                # TypeScript type definitions
└── providers/            # React context providers

supabase/
├── migrations/           # Database migrations
└── functions/           # Edge Functions
    ├── body-extract/    # Body measurement extraction
    ├── garment-extract/ # Garment analysis
    ├── tryon-generate/  # Virtual try-on generation
    └── embedding-outfit/ # Outfit embedding generation
```

## 🎯 Core Features Implementation

### 1. Avatar Creation
- Upload photo via drag-and-drop or file picker
- Automatic body measurement extraction
- 3D avatar generation with SMPL parameters
- Real-time 3D preview with Three.js

### 2. Wardrobe Management
- Add garments via photo upload or product URL
- Automatic category detection and measurement extraction
- Organize by categories with search and filtering
- View detailed garment information

### 3. Virtual Try-On
- 3D avatar with garment overlay
- AI-powered fit analysis with detailed explanations
- Fit score calculation (0-100%)
- Save and share try-on results

### 4. Style Discovery
- Browse community outfits
- AI-powered style similarity matching
- Sort by similarity or recency
- Detailed outfit information and user profiles

## 🔧 API Endpoints

### Mock AI Services

All AI endpoints are currently mocked with deterministic outputs:

- `POST /api/body-extract` - Extract body measurements from photo
- `POST /api/garment-extract` - Analyze garment properties
- `POST /api/tryon-generate` - Generate virtual try-on result

### Database Tables

- `profiles` - User profiles with avatar data
- `garments` - User wardrobe items
- `tryons` - Virtual try-on results
- `outfits` - User outfit collections

## 🎨 UI Components

Built with shadcn/ui components:
- Cards, buttons, inputs, dialogs
- Progress bars, badges, avatars
- Responsive grid layouts
- Loading states and error handling

## 🔒 Security

- Row Level Security (RLS) on all database tables
- User authentication with Supabase Auth
- Protected routes with middleware
- Secure file uploads to Supabase Storage

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## 🔮 Future Enhancements

### Real AI Integration
Replace mock services with:
- **Computer Vision**: Real body measurement extraction
- **3D Modeling**: Advanced avatar generation
- **Virtual Try-On**: AI-powered garment fitting
- **Style Analysis**: Advanced fashion recommendation

### Additional Features
- Social features (following, sharing)
- Advanced outfit planning
- Integration with fashion retailers
- Mobile app development
- AR try-on capabilities

## 📚 Documentation

- [API Contracts](docs/API_CONTRACTS.md) - Detailed API documentation
- [Database Schema](docs/SCHEMA.md) - Database structure and relationships
- [Component Library](docs/COMPONENTS.md) - UI component documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the React framework
- [Supabase](https://supabase.com/) for backend services
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Three.js](https://threejs.org/) for 3D graphics
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📞 Support

For questions or support, please open an issue on GitHub or contact the development team.

---

Built with ❤️ for the future of virtual fashion.