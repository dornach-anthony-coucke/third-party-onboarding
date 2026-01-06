export class EmptyMessageBodyError extends Error {
  constructor() {
    super('Sent message has empty body');
  }
}
