export interface CompanyCreationRequestRejectionAcknowledgedEventPayload {
  onboardingRequestId: string;
  errors: string[];
}
