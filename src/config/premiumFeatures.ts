/**
 * Premium Features Configuration
 * Defines what features are available in free vs premium tiers
 */

export interface PremiumFeature {
  icon: string;
  title: string;
  description: string;
  freeLimit?: number | string;
  premiumLimit?: number | string;
}

export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    icon: '🐾',
    title: 'Unlimited Pets',
    description: 'Track as many pets as you have',
    freeLimit: '2 pets',
    premiumLimit: 'Unlimited',
  },
  {
    icon: '📋',
    title: 'Health Records',
    description: 'Store complete medical history for each pet',
    freeLimit: '10 records',
    premiumLimit: 'Unlimited',
  },
  {
    icon: '⏰',
    title: 'Smart Reminders',
    description: 'Never miss vaccinations, medications, or appointments',
    freeLimit: '3 reminders',
    premiumLimit: 'Unlimited',
  },
  {
    icon: '💾',
    title: 'Cloud Backup',
    description: 'Sync and backup your pet data across devices',
  },
  {
    icon: '📊',
    title: 'Health Analytics',
    description: 'Track weight trends, activity, and health patterns',
  },
  {
    icon: '👥',
    title: 'Family Sharing',
    description: 'Share pet care duties with family members',
  },
];

export const FREE_TIER_LIMITS = {
  petsPerAccount: 2,
  healthRecordsPerPet: 10,
  remindersPerPet: 3,
  historyDays: 30,
  exportEnabled: false,
  adsEnabled: true,
  analyticsEnabled: false,
  familySharingEnabled: false,
};

export const PREMIUM_TIER_LIMITS = {
  petsPerAccount: Infinity,
  healthRecordsPerPet: Infinity,
  remindersPerPet: Infinity,
  historyDays: 365,
  exportEnabled: true,
  adsEnabled: false,
  analyticsEnabled: true,
  familySharingEnabled: true,
};

export function getFeatureLimit(feature: keyof typeof FREE_TIER_LIMITS, isPremium: boolean) {
  return isPremium ? PREMIUM_TIER_LIMITS[feature] : FREE_TIER_LIMITS[feature];
}

export function canAccessFeature(feature: string, isPremium: boolean): boolean {
  if (isPremium) return true;

  // Free tier restrictions
  const restrictedFeatures = [
    'export',
    'analytics',
    'sync',
    'backup',
    'family',
    'sharing',
    'unlimited',
  ];

  return !restrictedFeatures.some(r => feature.toLowerCase().includes(r));
}
