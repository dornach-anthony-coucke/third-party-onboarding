export interface AccountCreationRequestRejectionAcknowledgedEventPayload {
  onboardingRequestId: string;
  errors: string[];
}
