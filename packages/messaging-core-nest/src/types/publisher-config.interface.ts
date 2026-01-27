/**
 * Transport-agnostic configuration for registering a publisher.
 * 
 * The configuration is intentionally generic to support different messaging transports.
 * Each transport module (messaging-aws-nest, messaging-kafka-nest, etc.) is responsible
 * for interpreting this configuration correctly for its transport.
 * 
 * Two modes of configuration are supported:
 * 1. **Simple (declarative)**: Provide `destinationEnvironmentKey` - the transport module will resolve the value from ConfigService
 * 2. **Advanced (pre-resolved)**: Provide `destination` with the actual value (e.g., for remote config, tests, hardcoded values)
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
   * The destination where messages will be published (actual resolved value).
   * 
   * Use this for advanced scenarios where you need full control over the value source
   * (e.g., remote config, database, hardcoded values, tests).
   * 
   * **Note**: Either `destination` OR `destinationEnvironmentKey` must be provided, not both.
   * 
   * @example 'my-queue-name', 'my-topic-name'
   */
  destination?: string;

  /**
   * The environment variable key containing the destination value.
   * 
   * Use this for the simple, declarative approach. The transport module will resolve
   * the value from ConfigService at initialization time.
   * 
   * **Note**: Either `destination` OR `destinationEnvironmentKey` must be provided, not both.
   * 
   * @example 'COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE'
   */
  destinationEnvironmentKey?: string;

  /**
   * Optional metadata for transport-specific configuration.
   * The transport module can use this for additional setup.
   */
  metadata?: Record<string, unknown>;
}
