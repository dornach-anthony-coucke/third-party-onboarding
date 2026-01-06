export class ListenerNotFoundError extends Error {
  constructor(messageType: string) {
    super(`Listener for message type ${messageType} has not been found`);
  }
}
