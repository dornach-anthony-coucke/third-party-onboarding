export interface AcknowledgeAccountCreationRequestRejectionCommandPayload {
  onboardingRequestId: string;
  errors: string[];
}
