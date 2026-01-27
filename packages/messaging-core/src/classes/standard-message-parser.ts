import type { MessageEnvelope } from '../types/message-envelope.interface.js';
import type { MessageType } from '../types/message-type.type.js';
import type { RawQueueMessage } from '../types/raw-queue-message.interface.js';

/**
 * Standard parser for converting raw queue messages to MessageEnvelope
 * Provides consistent parsing logic across all consumers
 */
export class StandardMessageParser {
  /**
   * Parse a raw queue message into a MessageEnvelope
   * @param rawMessage - The raw message from the queue
   * @param messageType - The type of message (COMMAND, EVENT, etc.)
   * @param boundedContext - Optional bounded context for COMMAND messages
   * @returns Parsed MessageEnvelope
   * @throws Error if required message attributes are missing
   */
  static parse<T extends MessageType>(
    rawMessage: RawQueueMessage,
    messageType: T,
    boundedContext?: string,
  ): MessageEnvelope<T, unknown> {
    const messageAttributes = rawMessage.attributes;
    
    if (!messageAttributes?.type) {
      throw new Error('Unprocessable message: type attribute is missing');
    }

    const envelope: MessageEnvelope<T, unknown> = {
      id: rawMessage.id,
      type: messageAttributes.type,
      payload: rawMessage.body,
      destinationBoundedContext: boundedContext as any,
      version: messageAttributes.version ? Number(messageAttributes.version) : undefined,
    };

    return envelope;
  }

  /**
   * Parse a command message with bounded context validation
   * @param rawMessage - The raw message from the queue
   * @param boundedContext - The bounded context this command is for
   * @returns Parsed MessageEnvelope for COMMAND
   * @throws Error if bounded context is not provided or message attributes are missing
   */
  static parseCommand(
    rawMessage: RawQueueMessage,
    boundedContext: string,
  ): MessageEnvelope<'COMMAND', unknown> {
    if (!boundedContext) {
      throw new Error('Bounded context is required for COMMAND messages');
    }
    return this.parse(rawMessage, 'COMMAND', boundedContext);
  }

  /**
   * Parse an event message (no bounded context needed)
   * @param rawMessage - The raw message from the queue
   * @returns Parsed MessageEnvelope for EVENT
   */
  static parseEvent(rawMessage: RawQueueMessage): MessageEnvelope<'EVENT', unknown> {
    return this.parse(rawMessage, 'EVENT');
  }
}
