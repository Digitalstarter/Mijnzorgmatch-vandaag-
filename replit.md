# MijnZorgMatch.nl

## Overview
MijnZorgMatch.nl is een matchingplatform voor de Nederlandse zorg sector dat twee gebruikersgroepen met elkaar verbindt:
- **ZZP'ers (Zorgprofessionals)**: Zoeken naar opdrachten en advertenties van bureaus
- **Zorgorganisaties / Bureaus**: Plaatsen advertenties en zoeken professionals

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle
- **UI**: Tailwind CSS + shadcn/ui
- **Auth**: Replit Auth (OpenID Connect)
- **Real-time**: WebSocket (planned for chat)

## Project Structure
```
client/
  src/
    components/     # Reusable UI components
    pages/         # Page components
    hooks/         # Custom React hooks
    lib/           # Utilities and helpers
server/
  routes.ts      # API endpoints
  storage.ts     # Database operations
  db.ts          # Database connection
  replitAuth.ts  # Authentication setup
shared/
  schema.ts      # Database schema and types
```

## User Roles & Features

### ZZP'er (Zorgprofessional)
- Create and manage professional profile
- Browse vacancies from organisations
- Browse help requests from parents/caregivers
- Apply to opportunities
- Chat with matches

### Zorgorganisatie (Care Organisation)
- Post and manage vacancies
- View applications from ZZP'ers
- Chat with candidates
- Dashboard with analytics

### Ouder/Mantelzorger (Parent/Caregiver)
- Browse ZZP'er profiles
- Post and manage help requests
- View applications from professionals
- Chat with matches

## Database Schema
- **users**: User accounts with Replit Auth
- **zzp_profiles**: Professional profiles for ZZP'ers
- **vacancies**: Job postings from organisations
- **help_requests**: Care requests from parents/caregivers
- **applications**: Responses to vacancies/requests/profiles
- **messages**: Chat messages between users

## Design System
- Color palette: Healthcare-focused blues and neutral tones
- Typography: Inter font family
- Components: shadcn/ui with custom healthcare styling
- Dark mode: Fully supported
- Responsive: Mobile-first approach

## Current Status
✅ Schema and data models defined
✅ Authentication with role selection
✅ Role-based dashboards
✅ Profile creation forms
✅ Vacancy and help request forms
✅ Landing page with marketing content
⏳ Backend API implementation (in progress)
⏳ WebSocket chat system (planned)

## Development Commands
- `npm run dev` - Start development server
- `npm run db:push` - Push schema changes to database
- `npm run build` - Build for production

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured by Replit)
- `SESSION_SECRET` - Session encryption key (auto-configured by Replit)
- `REPL_ID` - Replit application ID (auto-configured by Replit)
- `PORT` - Server port (defaults to 5000)
- `VITE_STRIPE_PUBLIC_KEY` - Stripe public key (optional, for payments)
- `STRIPE_SECRET_KEY` - Stripe secret key (optional, for payments)

## Setup Status (October 29, 2025)
✅ Database provisioned and schema pushed
✅ Server running on port 5000
✅ Frontend configured for Replit proxy
✅ Email/password authentication working
✅ Credits page made Stripe-optional
✅ Deployment configuration set up (autoscale)
⏳ Stripe integration (optional - use blueprint:javascript_stripe when needed)

## Notes
- All content is in Dutch (NL)
- Focus on professional yet approachable design
- Emphasis on trust and safety in healthcare context
- SEO optimized with Dutch meta tags
- Payments are optional - app works without Stripe configuration
- To enable payments, add Stripe integration using Replit's integration system
