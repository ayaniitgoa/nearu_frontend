# SkillBridge Frontend

Frontend application built with Next.js 14, JavaScript/JSX, TailwindCSS, and Supabase.

## Features

- 🏙️ City selection with suggestions
- 🔍 Search and filter coaching classes
- 📱 Mobile-first responsive design
- ⭐ Review and rating system
- 📝 Enquiry submission
- 👤 Coaching owner dashboard
- 🔐 Supabase authentication
- 🎨 Modern UI with shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── page.jsx           # Landing page
│   ├── home/              # Listings page
│   ├── coaching/[id]/    # Coaching detail page
│   ├── dashboard/         # Owner dashboard
│   └── admin/             # Admin panel
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   └── ReviewForm.jsx     # Review form component
├── lib/                   # Utilities and configs
│   ├── supabase.js        # Supabase client
│   ├── utils.js           # Utility functions
│   └── constants.js       # Constants (cities, categories)
├── services/              # API service functions
│   ├── coachService.js    # Coach CRUD operations
│   ├── enquiryService.js  # Enquiry operations
│   └── reviewService.js   # Review operations
├── store/                 # Zustand state management
│   ├── cityStore.js       # City selection store
│   └── authStore.js       # Authentication store
└── types/                 # (Not used - pure JavaScript)
```

## Pages

- `/` - Landing page with city selection
- `/home` - Listings page with filters and search
- `/coaching/[id]` - Coaching detail page with reviews and enquiry
- `/dashboard` - Owner dashboard (requires auth)
- `/login?type=institution` - Login page for institutions (uses the main login page with institution type)
- `/dashboard/add` - Add new listing
- `/dashboard/manage` - Manage listings
- `/dashboard/enquiries` - View enquiries
- `/admin` - Admin panel for approving listings

## Database Setup

See `../backend/DATABASE_SCHEMA.md` for database schema and setup instructions.

## Deployment

The project is configured for Vercel deployment:

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript/JSX
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Database**: Supabase
- **Icons**: Lucide React

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

