/**
 * Configuration for registering a publisher in the PublisherRegistry
 */
export interface PublisherConfig {
  /**
   * The key to register the publisher under (usually a bounded context name)
   * This key will be used to lookup the publisher from the registry
   */
  key: string;

  /**
   * The environment variable name containing the queue or topic name
   * Example: 'COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE'
   */
  queueName: string;

  /**
   * The type of publisher to create
   */
  type: 'sqs' | 'sns';
}
