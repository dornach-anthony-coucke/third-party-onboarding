export class EmptyMessageContentError extends Error {
  constructor() {
    super('Sent message has empty content');
  }
}
