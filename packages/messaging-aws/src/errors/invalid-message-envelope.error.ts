export class InvalidMessageEnvelopeError extends Error {
  constructor() {
    super('Sent message is not valid envelope');
  }
}
