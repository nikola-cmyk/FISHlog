# eFISHent Fishlog 🎣

**Track. Analyze. Catch More.**

A modern fishing data collection and analysis app built with React, TypeScript, Shadcn-UI, and Supabase. Track your fishing trips, analyze patterns, and discover the best times to fish.

## 🌟 Features

### Current Features (All Free!)
- ✅ **User Authentication** - Secure sign-up, login, and password reset
- ✅ **Trip Logging** - Record detailed fishing trip data including:
  - Date, time, and location
  - Weather conditions (temperature, wind, pressure)
  - Moon phase
  - Catch details (species, quantity, size, weight)
  - Water conditions and notes
- ✅ **Trip History** - View and search all your logged trips
- ✅ **Location Management** - Save and manage your favorite fishing spots
- ✅ **Best Times Prediction** - AI-powered analysis to predict optimal fishing times
- ✅ **Dashboard Analytics** - Visual insights into your fishing patterns
- ✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile

### Coming Soon (Future Monetization Ready)
- 🔒 Premium analytics and advanced predictions
- 🔒 Weather forecasting integration
- 🔒 Social features (share catches, compete with friends)
- 🔒 Export data to PDF/CSV
- 🔒 Unlimited trip storage (free tier will have limits)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm installed
- A Supabase account (free tier is perfect to start)

### Installation

1. **Clone or download this project**

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Supabase** (See detailed instructions in `SUPABASE_SETUP.md`)
   - Create a free Supabase project at https://supabase.com
   - Copy your project URL and anon key
   - Update `.env` file with your credentials
   - Run the SQL script to create database tables

4. **Start development server**
   ```bash
   pnpm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Sign up for a new account
   - Start logging your fishing trips!

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ui/           # Shadcn-UI components
│   ├── Navbar.tsx    # Navigation bar with auth
│   └── ProtectedRoute.tsx  # Route protection wrapper
├── contexts/         # React contexts
│   └── AuthContext.tsx     # Authentication state management
├── lib/             # Utility libraries
│   ├── supabase-client.ts  # Supabase configuration
│   └── utils.ts            # Helper functions
├── pages/           # Application pages
│   ├── Login.tsx           # Login page
│   ├── Signup.tsx          # Sign-up page
│   ├── ResetPassword.tsx   # Password reset
│   ├── Dashboard.tsx       # Main dashboard
│   ├── LogTrip.tsx         # Trip logging form
│   ├── History.tsx         # Trip history view
│   ├── Locations.tsx       # Location management
│   └── BestTimes.tsx       # Predictions view
└── App.tsx          # Main app component with routing
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-key (optional, for future use)
```

### Database Schema

The app uses three main tables:
- `locations` - Fishing spot information
- `fishing_trips` - Trip logs with catch data
- `predictions` - AI-generated best fishing times

All tables have Row Level Security (RLS) enabled to ensure users only see their own data.

## 🎨 Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Components**: Shadcn-UI (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: React Context + TanStack Query
- **Routing**: React Router v6
- **Payment Processing**: Stripe (ready but disabled)

## 📊 Current Status: Free for All Users

Right now, **all features are completely free** for all users! There are no limits, no paywalls, and no credit card required.

### Why Free Now?

This allows you to:
1. Build a user base and gather feedback
2. Collect real usage data to inform feature development
3. Test and refine the app before monetizing
4. Establish trust and credibility with early adopters

### Future Monetization Strategy

When you're ready, you can easily activate paid plans:

**Free Tier** (Always available)
- 25 trips per month
- Basic analytics
- 3 saved locations

**Pro Tier** ($4.99/month)
- Unlimited trips
- Advanced analytics
- Unlimited locations
- Weather forecasting
- Priority support

**Premium Tier** ($9.99/month)
- Everything in Pro
- Social features
- Export to PDF/CSV
- API access
- Custom branding

## 🔐 Security Features

- ✅ Secure authentication with Supabase Auth
- ✅ Row Level Security (RLS) on all database tables
- ✅ Email verification for new accounts
- ✅ Password reset functionality
- ✅ JWT-based session management
- ✅ Environment variables for sensitive data

## 🚢 Deployment

### Deploy to Vercel (Recommended - Free)

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your repository
5. Add environment variables in Vercel dashboard
6. Deploy!

### Deploy to Netlify (Alternative - Free)

1. Push your code to GitHub
2. Go to https://netlify.com
3. Click "Add new site" > "Import an existing project"
4. Select your repository
5. Build command: `pnpm run build`
6. Publish directory: `dist`
7. Add environment variables
8. Deploy!

## 📝 Development Commands

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm run dev

# Run linter
pnpm run lint

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## 🐛 Troubleshooting

### Authentication Issues
- Verify `.env` file has correct Supabase credentials
- Check email spam folder for confirmation emails
- Ensure Supabase project is active

### Database Connection Issues
- Verify SQL script ran successfully in Supabase
- Check RLS policies are enabled
- Ensure user is authenticated before accessing data

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
- Clear Vite cache: `rm -rf .vite`
- Check for TypeScript errors: `pnpm run lint`

## 📚 Documentation

- **Supabase Setup**: See `SUPABASE_SETUP.md` for detailed database setup
- **Shadcn-UI Docs**: https://ui.shadcn.com
- **Supabase Docs**: https://supabase.com/docs
- **React Router**: https://reactrouter.com

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

MIT License - feel free to use this for your own projects!

## 🙏 Acknowledgments

- Built with [Shadcn-UI](https://ui.shadcn.com)
- Powered by [Supabase](https://supabase.com)
- Created on [MGX Platform](https://mgx.dev)

---

**Ready to catch more fish?** 🎣 Start tracking your trips today!