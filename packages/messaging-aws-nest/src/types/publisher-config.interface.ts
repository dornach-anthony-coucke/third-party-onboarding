/**
 * Transport-agnostic configuration for registering a publisher.
 * 
 * The configuration is intentionally generic to support different messaging paradigms:
 * - AWS SQS: Direct queue messaging (point-to-point)
 * - AWS SNS: Topic-based messaging (pub/sub)
 * - RabbitMQ: Exchange-based routing (requires exchange + routing key)
 * - Kafka: Topic with partitions
 * - NATS: Subject-based messaging
 * 
 * The infrastructure module (e.g., messaging-aws-nest, messaging-rabbitmq-nest)
 * is responsible for interpreting this configuration correctly for its transport.
 */
export interface PublisherConfig {
  /**
   * The key to register the publisher under (usually a bounded context name).
   * This key will be used to lookup the publisher from the PublisherRegistry.
   * 
   * @example 'company-registry', 'account-registry'
   */
  key: string;

  /**
   * The destination where messages will be published.
   * 
   * Use the provided token constants for queue/topic names, which are injected
   * as providers that retrieve configuration from ConfigService:
   * 
   * AWS SQS/SNS:
   * - Use token constants like ONBOARDING_MANAGER_INTERNAL_COMMANDS_QUEUE_NAME
   * - Example: destination: COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE_NAME
   * 
   * RabbitMQ:
   * - Use token constants for exchange names (when implemented)
   * - Example: destination: COMPANY_REGISTRY_EXCHANGE_NAME
   * 
   * Kafka:
   * - Use token constants for topic names (when implemented)
   * - Example: destination: COMPANY_REGISTRY_TOPIC_NAME
   * 
   * NATS:
   * - Use token constants for subject names (when implemented)
   * - Example: destination: COMPANY_REGISTRY_SUBJECT_NAME
   * 
   * For backward compatibility, you can also pass a string directly,
   * which will be used as-is without ConfigService lookup.
   */
  destination: string;

  /**
   * Optional metadata for transport-specific configuration.
   * The infrastructure module can use this for additional setup.
   * 
   * Examples:
   * 
   * AWS:
   * { transportType: 'sqs' } or { transportType: 'sns' }
   * 
   * RabbitMQ:
   * { 
   *   routingKey: 'company.commands',
   *   exchangeType: 'topic'
   * }
   * 
   * Kafka:
   * {
   *   partitionKey: 'companyId',
   *   compressionType: 'gzip'
   * }
   * 
   * NATS:
   * {
   *   streamName: 'COMMANDS',
   *   durable: true
   * }
   */
  metadata?: Record<string, unknown>;
}

/**
 * AWS-specific publisher configuration.
 * Used when you know you're using AWS and want type safety.
 */
export interface AwsPublisherConfig extends PublisherConfig {
  metadata: {
    transportType: 'sqs' | 'sns';
  };
}

/**
 * RabbitMQ-specific publisher configuration.
 * Used when you know you're using RabbitMQ and want type safety.
 */
export interface RabbitMQPublisherConfig extends PublisherConfig {
  metadata: {
    routingKey: string;
    exchangeType?: 'direct' | 'topic' | 'fanout' | 'headers';
  };
}
