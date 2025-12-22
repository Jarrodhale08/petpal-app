# RevenueCat Setup for PetPal

## Quick Start

1. **Get your API Key**
   - Create account at [revenuecat.com](https://www.revenuecat.com)
   - Create a new project for PetPal
   - Copy your public API key from Project Settings > API Keys

2. **Set Environment Variable**
   - Create a `.env` file in the project root (if not exists)
   - Add: `EXPO_PUBLIC_REVENUECAT_API_KEY=your_api_key_here`

## App Store Setup

### iOS (App Store Connect)
1. Go to App Store Connect > Your App > In-App Purchases
2. Create subscription products:
   - Monthly: `petpal_monthly` - $2.99/month
   - Yearly: `petpal_yearly` - $19.99/year
   - Lifetime: `petpal_lifetime` - One-time

### Android (Google Play Console)
1. Go to Play Console > Your App > Monetize > Subscriptions
2. Create matching subscription products

## RevenueCat Dashboard Setup

1. **Import Products**
   - Go to Products in RevenueCat
   - Import from App Store Connect / Google Play

2. **Create Entitlement**
   - Name: `petpal_pro`
   - Attach all subscription products

3. **Create Offering**
   - Create "default" offering
   - Add packages: Monthly, Yearly, Lifetime

4. **Design Paywall**
   - Go to Paywalls
   - Use visual editor to design
   - Attach to default offering

## Initialize in Your App

The `useRevenueCatInit` hook is already created. Add to your `_layout.tsx`:

```typescript
import { useRevenueCatInit } from './src/hooks/useRevenueCatInit';

export default function RootLayout() {
  const { isReady, error } = useRevenueCatInit();

  if (!isReady) {
    return <SplashScreen />;
  }

  return <Stack />;
}
```

## Testing

- iOS: Use sandbox testers (App Store Connect > Users > Sandbox)
- Android: Use license testers (Play Console > Setup > License testing)

## Files Generated

- `src/services/revenueCat.service.ts` - Core RevenueCat service
- `src/stores/subscriptionStore.ts` - Subscription state management
- `src/hooks/useRevenueCatInit.ts` - Initialization hook
- `src/config/premiumFeatures.ts` - Premium feature definitions
- `app/subscription.tsx` - Paywall screen
- `app/customer-center.tsx` - Subscription management
