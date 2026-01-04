# Fishing Data Collection App - Development Plan (SaaS Version)

## Design Guidelines

### Design References (Primary Inspiration)
- **Fishbrain.com**: Clean data-focused interface, blue water themes
- **Modern Dashboard UI**: Data visualization, card-based layouts
- **Style**: Clean Modern + Aquatic Theme + Data-Focused

### Color Palette
- Primary: #0A4D68 (Deep Ocean Blue - primary actions)
- Secondary: #088395 (Teal - secondary elements)
- Accent: #05BFDB (Bright Cyan - highlights and CTAs)
- Background: #F8FFFE (Off-white - main background)
- Cards: #FFFFFF (White - card backgrounds)
- Text: #1A1A1A (Dark Gray), #666666 (Medium Gray - secondary)
- Success: #2ECC71 (Green - good catches)
- Warning: #F39C12 (Orange - moderate)

### Typography
- Heading1: Montserrat font-weight 700 (36px)
- Heading2: Montserrat font-weight 600 (28px)
- Heading3: Montserrat font-weight 600 (20px)
- Body/Normal: Inter font-weight 400 (14px)
- Body/Emphasize: Inter font-weight 600 (14px)
- Navigation: Inter font-weight 600 (16px)

---

## Development Tasks

### Phase 1: Backend Integration (Current)
- [x] Setup shadcn-ui template
- [x] Generate hero images
- [x] Create dashboard with stats
- [x] Implement localStorage data management
- [ ] **NEW: Supabase Authentication Setup**
  - Install @supabase/supabase-js
  - Create supabase client configuration
  - Implement auth context provider
  - Create Login/Signup pages
  - Add protected route wrapper
- [ ] **NEW: Database Migration**
  - Replace localStorage with Supabase queries
  - Update all CRUD operations
  - Add user-specific data filtering
- [ ] **NEW: Stripe Integration (Disabled by default)**
  - Install @stripe/stripe-js
  - Create subscription plans configuration
  - Add pricing page (hidden until enabled)
  - Implement webhook handlers
  - Add subscription status checks

### Phase 2: Authentication Pages
- [ ] Login page with email/password
- [ ] Signup page with email/password
- [ ] Password reset flow
- [ ] User profile page
- [ ] Logout functionality

### Phase 3: Protected Features
- [ ] Auth wrapper for all main pages
- [ ] Redirect to login if not authenticated
- [ ] User-specific data isolation
- [ ] Session management

### Phase 4: Payment Ready (Disabled)
- [ ] Pricing page structure
- [ ] Subscription tier definitions
- [ ] Feature flags for premium features
- [ ] Stripe checkout integration (commented out)
- [ ] Subscription management page

### Completed Tasks
- [x] Dashboard with hero section and stats
- [x] Log Trip form with all fields
- [x] History page with trip listing
- [x] Locations management
- [x] Logo and branding integration
- [x] Montserrat Bold font for title
- [x] Subtitle "Track. Analyze. Catch More."