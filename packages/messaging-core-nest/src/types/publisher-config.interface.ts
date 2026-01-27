/**
 * Transport-agnostic configuration for registering a publisher.
 * 
 * The configuration is intentionally generic to support different messaging transports.
 * Each transport module (messaging-aws-nest, messaging-kafka-nest, etc.) is responsible
 * for interpreting this configuration correctly for its transport.
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
   * When using registerPublishersAsync, resolve this from ConfigService in the useFactory.
   */
  destination: string;

  /**
   * Optional metadata for transport-specific configuration.
   * The transport module can use this for additional setup.
   */
  metadata?: Record<string, unknown>;
}
