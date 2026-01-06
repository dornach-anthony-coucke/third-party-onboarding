export interface OnboardingRequestValidationRejectedEventPayload {
  onboardingRequestId: string;
  companyRequestValidationErrors: string[];
  accountRequestValidationErrors: string[];
}
