export interface RawQueueMessage {
  id: string;
  body: string;
  ackToken: string;
  attributes?: Record<string, string>;
}
