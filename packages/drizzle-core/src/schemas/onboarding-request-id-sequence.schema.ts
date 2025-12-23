import { pgSequence } from 'drizzle-orm/pg-core';

export const onboardingRequestIdSequence = pgSequence('onboarding_request_id');
