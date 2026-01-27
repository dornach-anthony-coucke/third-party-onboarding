import type { PublisherConfig } from '@third-party-onboarding-manager/messaging-core-nest';

/**
 * AWS-specific publisher configuration.
 * Used when you know you're using AWS and want type safety.
 */
export interface AwsPublisherConfig extends PublisherConfig {
  metadata: {
    transportType: 'sqs' | 'sns';
  };
}

// Re-export the base interface for convenience
export type { PublisherConfig };
