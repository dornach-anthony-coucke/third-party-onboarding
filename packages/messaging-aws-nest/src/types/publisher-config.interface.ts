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
   * This should be the actual destination name (queue name, topic name, exchange name, etc.).
   * 
   * When using registerPublishersAsync, resolve this from ConfigService in the useFactory:
   * 
   * @example
   * // AWS SQS/SNS
   * MessagingAwsNestModule.registerPublishersAsync({
   *   useFactory: (configService: ConfigService) => [{
   *     key: 'company-registry',
   *     destination: configService.getOrThrow('COMPANY_REGISTRY_QUEUE'),
   *     metadata: { transportType: 'sqs' }
   *   }],
   *   inject: [ConfigService]
   * })
   * 
   * @example
   * // RabbitMQ (future)
   * MessagingRabbitMQNestModule.registerPublishersAsync({
   *   useFactory: (configService: ConfigService) => [{
   *     key: 'company-registry',
   *     destination: configService.getOrThrow('COMPANY_REGISTRY_EXCHANGE'),
   *     metadata: { routingKey: 'company.commands' }
   *   }],
   *   inject: [ConfigService]
   * })
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
