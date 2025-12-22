# PetPal

Your Pet Care Companion - A comprehensive mobile app for managing pet care, appointments, reminders, and health records.

## Features

- **Pet Profiles**: Create detailed profiles for all your pets (dogs, cats, birds, fish, rabbits, hamsters, and more)
- **Appointment Management**: Schedule and track vet appointments, vaccinations, grooming sessions
- **Smart Reminders**: Set recurring reminders for feeding, walks, medications, and grooming
- **Health Records**: Track vaccinations, medications, and health history (Premium)
- **Push Notifications**: Never miss an important pet care task
- **Cloud Sync**: Your data syncs across devices with Supabase backend
- **Premium Features**: Unlock advanced features with in-app subscription

## Screenshots

The app features a modern dark theme with teal (#14B8A6) accent colors.

## Getting Started

```bash
# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Start the development server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

## Tech Stack

- **Framework**: React Native with Expo SDK 52
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **Styling**: React Native StyleSheet (dark theme)
- **State Management**: Zustand with AsyncStorage persistence
- **Backend**: Supabase (PostgreSQL with Row Level Security)
- **Payments**: RevenueCat (in-app subscriptions)
- **Notifications**: Expo Notifications

## Project Structure

```
├── app/                    # Expo Router screens
│   ├── (tabs)/             # Tab navigation (home, pets, appointments, settings)
│   ├── pet/                # Pet CRUD screens
│   ├── appointment/        # Appointment screens
│   ├── reminder/           # Reminder screens
│   ├── settings/           # Settings sub-pages
│   ├── subscription.tsx    # RevenueCat paywall
│   └── _layout.tsx         # Root layout with auth
├── src/
│   ├── components/         # Reusable UI components
│   ├── services/           # API services (Supabase, notifications, RevenueCat)
│   ├── stores/             # Zustand state stores
│   ├── hooks/              # Custom React hooks
│   └── theme/              # Design system tokens
├── assets/images/          # App icons and splash screen
├── supabase/migrations/    # Database schema
└── package.json
```

## Environment Variables

Create a `.env` file with:

```bash
# Supabase (required)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_APP_ID=petpal

# RevenueCat (required for subscriptions)
EXPO_PUBLIC_REVENUECAT_API_KEY=your_revenuecat_key
```

## Setup Guides

### Supabase Backend
The database schema is in `supabase/migrations/001_create_petpal_schema.sql`. It includes:
- Multi-tenant architecture with `app_id` isolation
- Row Level Security (RLS) on all tables
- Tables: pets, appointments, pet_reminders, health_records, user_settings, profiles

### RevenueCat Subscriptions
See `REVENUECAT_SETUP.md` for detailed instructions on:
- Creating RevenueCat account and project
- Setting up App Store / Google Play products
- Configuring entitlements and offerings
- Designing the paywall

## Pre-Launch Checklist

- [x] Core features implemented
- [x] Supabase backend configured
- [x] Push notifications setup
- [x] Privacy Policy & Terms of Service
- [x] App icons and splash screen
- [ ] RevenueCat API key configured
- [ ] App Store / Google Play products created
- [ ] Paywall designed in RevenueCat dashboard
- [ ] End-to-end testing on devices
- [ ] App Store assets (screenshots, description)

## License

Private - All rights reserved.

---

Built with AppForge AI
