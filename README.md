# Pilates Connect - Australia's Premier Pilates Marketplace

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/jaypearce23-1334s-projects/v0-pilates-marketplace-saa-s)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/HxLdLIEch8a)

## Overview

Pilates Connect is a comprehensive SaaS marketplace connecting Pilates instructors with studios across Australia. The platform streamlines hiring, cover requests, and instructor discovery with powerful search filters, real-time availability tracking, and integrated payment processing.

### Key Features

- **For Studios:**
  - Post permanent and casual job openings
  - Request urgent cover for classes
  - Browse qualified instructors with advanced filters
  - Applicant tracking system
  - Direct messaging with instructors
  - Subscription plans (Free, Professional $49/mo, Enterprise $149/mo)

- **For Instructors:**
  - Create detailed professional profiles
  - Apply to unlimited jobs (always free)
  - Post availability for cover opportunities
  - Track applications and earnings
  - Direct messaging with studios
  - Referral rewards program

- **Platform Features:**
  - Supabase authentication and database
  - Stripe payment processing
  - Email notification system
  - Referral program with tracking
  - Mobile-responsive design
  - SEO optimized
  - Google Analytics integration
  - Admin dashboard for platform management

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Payments:** Stripe
- **Analytics:** Google Analytics 4, Vercel Analytics
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account (for payments)

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/your-username/pilates-connect.git
cd pilates-connect
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables (see Environment Variables section below)

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google Analytics (Optional)
NEXT_PUBLIC_GA_ID=your_ga_tracking_id

# Email Service (Optional - for production)
RESEND_API_KEY=your_resend_api_key
\`\`\`

### Database Setup

1. Run the SQL setup script in your Supabase SQL editor:
\`\`\`bash
# Located in: scripts/RUN_THIS_COMPLETE_SETUP.sql
\`\`\`

2. This will create all necessary tables, RLS policies, and indexes

## Project Structure

\`\`\`
pilates-connect/
├── app/                      # Next.js app directory
│   ├── (auth)/              # Authentication pages
│   ├── admin/               # Admin dashboard
│   ├── instructor/          # Instructor pages
│   ├── studio/              # Studio pages
│   ├── jobs/                # Job listings
│   ├── find-instructors/    # Instructor search
│   ├── referrals/           # Referral program
│   └── pricing/             # Pricing page
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   └── ...                  # Custom components
├── lib/                     # Utility functions
│   ├── supabase/           # Supabase clients
│   ├── analytics.ts        # Analytics tracking
│   ├── email.ts            # Email templates
│   └── products.ts         # Stripe products
├── scripts/                 # Database scripts
└── public/                  # Static assets
\`\`\`

## Deployment

Your project is live at:

**[https://vercel.com/jaypearce23-1334s-projects/v0-pilates-marketplace-saa-s](https://vercel.com/jaypearce23-1334s-projects/v0-pilates-marketplace-saa-s)**

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Development Workflow

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version

Continue building: **[https://v0.app/chat/projects/HxLdLIEch8a](https://v0.app/chat/projects/HxLdLIEch8a)**

## Key Pages

- `/` - Homepage with hero and features
- `/jobs` - Browse job listings
- `/find-instructors` - Search for instructors
- `/pricing` - Subscription plans
- `/referrals` - Referral program information
- `/instructor/dashboard` - Instructor dashboard
- `/studio/dashboard` - Studio dashboard
- `/admin/dashboard` - Platform admin dashboard

## Features in Detail

### Authentication
- Email/password authentication via Supabase
- Separate flows for instructors and studios
- Protected routes with middleware
- Session management

### Job Posting & Applications
- Studios post permanent or casual positions
- Instructors apply with one click
- Application tracking and status updates
- Email notifications for new applications

### Cover Request System
- Studios request urgent cover for classes
- Instructors view and accept cover opportunities
- Real-time availability matching
- Automated notifications

### Search & Filters
- Location-based search
- Filter by certifications (Reformer, Mat, Cadillac, etc.)
- Experience level filtering
- Availability filtering
- Specialization filtering

### Payment Processing
- Stripe embedded checkout
- Subscription management
- Multiple pricing tiers
- Secure payment handling

### Referral Program
- Unique referral links for each user
- Track referrals and earnings
- Tiered reward system
- Automated reward notifications

## Contributing

This is a private project. For questions or support, contact the development team.

## License

Proprietary - All rights reserved

## Support

For technical support or questions:
- Email: support@pilatesconnect.com.au
- Documentation: See LAUNCH_CHECKLIST.md for detailed setup

---

Built with ❤️ using [v0.app](https://v0.app) by Vercel
