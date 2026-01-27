import type { MessagePublisher } from '../types/message-publisher.interface.js';

export class PublisherRegistry {
  private publishers = new Map<string, MessagePublisher>();

  /**
   * Register a publisher for a specific key (e.g., bounded context name)
   * @param key - The identifier for this publisher (usually a bounded context name)
   * @param publisher - The MessagePublisher instance to register
   */
  register(key: string, publisher: MessagePublisher): void {
    if (this.publishers.has(key)) {
      throw new Error(`Publisher already registered for key: ${key}`);
    }
    this.publishers.set(key, publisher);
  }

  /**
   * Get a publisher by key
   * @param key - The identifier for the publisher to retrieve
   * @returns The MessagePublisher instance
   * @throws Error if no publisher is found for the given key
   */
  get(key: string): MessagePublisher {
    const publisher = this.publishers.get(key);
    if (!publisher) {
      throw new Error(`No publisher found for key: ${key}`);
    }
    return publisher;
  }

  /**
   * Check if a publisher exists for a given key
   * @param key - The identifier to check
   * @returns true if a publisher is registered for this key
   */
  has(key: string): boolean {
    return this.publishers.has(key);
  }

  /**
   * Get all registered keys
   * @returns Array of all registered keys
   */
  keys(): string[] {
    return Array.from(this.publishers.keys());
  }

  /**
   * Unregister a publisher
   * @param key - The identifier of the publisher to unregister
   * @returns true if the publisher was found and removed
   */
  unregister(key: string): boolean {
    return this.publishers.delete(key);
  }

  /**
   * Clear all registered publishers
   */
  clear(): void {
    this.publishers.clear();
  }
}
