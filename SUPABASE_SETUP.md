# Supabase Setup Guide for PetPal

## Overview

This app uses Supabase for backend services including:
- User authentication (email/password, OAuth)
- Real-time database (PostgreSQL)
- File storage
- Row-level security

## Setup Steps

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Enter your project details:
   - **Name**: PetPal
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose closest to your users
5. Wait for the project to be created (2-3 minutes)

### 2. Get Your Credentials

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Configure the App

1. Open `src/services/supabase.ts`
2. Replace the placeholder values:

```typescript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 4. Configure Authentication

#### Email/Password Auth (Default)
1. Go to **Authentication** > **Providers**
2. Email is enabled by default
3. (Optional) Disable "Confirm email" in **Auth Settings** for faster testing

#### OAuth Providers (Optional)
To enable Google, Apple, or GitHub login:

1. Go to **Authentication** > **Providers**
2. Click on the provider you want to enable
3. Follow the setup instructions for each:

**Google:**
- Create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com)
- Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`

**Apple:**
- Register your app at [Apple Developer](https://developer.apple.com)
- Configure Sign in with Apple service

### 5. Set Up Database Tables (Optional)

If your app needs custom data tables:

1. Go to **SQL Editor** in Supabase dashboard
2. Create your tables:

```sql
-- Example: User profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 6. Configure Deep Links (For Password Reset)

For password reset emails to work on mobile:

1. Update `app.json`:
```json
{
  "expo": {
    "scheme": "petpal",
    "ios": {
      "associatedDomains": ["applinks:your-project.supabase.co"]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "petpal",
              "host": "reset-password"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

2. In Supabase, go to **Authentication** > **URL Configuration**
3. Set **Site URL** to your app's deep link: `petpal://`
4. Add redirect URL: `petpal://reset-password`

## Usage Examples

### Check Auth State

```typescript
import { useAuthStore } from './src/stores/authStore';

function MyComponent() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <Loading />;
  if (!user) return <LoginPrompt />;

  return <UserDashboard user={user} />;
}
```

### Protected Routes

```typescript
// In _layout.tsx
import { Redirect } from 'expo-router';
import { useAuthStore } from './src/stores/authStore';

export default function ProtectedLayout() {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) return <SplashScreen />;
  if (!user) return <Redirect href="/login" />;

  return <Stack />;
}
```

### Database Operations

```typescript
import db from './src/services/database';

// Fetch all items
const { data, error } = await db.fetchAll('items', {
  orderBy: { column: 'created_at', ascending: false },
  limit: 20,
});

// Create item
const { data: newItem } = await db.create('items', {
  name: 'New Item',
  user_id: user.id,
});

// Update item
await db.update('items', itemId, { name: 'Updated Name' });

// Delete item
await db.remove('items', itemId);

// Real-time subscription
const unsubscribe = db.subscribeToTable('items', (payload) => {
  console.log('Change:', payload.eventType, payload.new);
});
```

## Troubleshooting

### "Invalid API key"
- Double-check your SUPABASE_URL and SUPABASE_ANON_KEY
- Make sure you're using the "anon public" key, not the service role key

### "Email not confirmed"
- Check spam folder
- Or disable email confirmation in Supabase Auth Settings for testing

### OAuth not working
- Verify redirect URIs match exactly
- Check OAuth provider credentials
- Ensure provider is enabled in Supabase dashboard

## Security Notes

- The anon key is safe to expose in client-side code
- All data security is enforced by Row Level Security (RLS) policies
- Never expose your service_role key in client code
- Always enable RLS on tables that contain user data

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase + Expo Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
