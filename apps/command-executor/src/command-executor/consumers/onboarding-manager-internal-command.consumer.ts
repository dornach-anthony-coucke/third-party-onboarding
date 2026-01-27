import { Inject, Injectable } from '@nestjs/common';
import { AwsMessagingConfig, createQueueUrl } from '@third-party-onboarding-manager/messaging-aws';
import {
  AbstractQueueConsumer,
  MessageEnvelope,
  MessageRouter,
  RawQueueMessage,
  StandardMessageParser,
  type QueueClient,
} from '@third-party-onboarding-manager/messaging-core';
import {
  AWS_SQS_CLIENT_PROVIDER,
  AWS_TRANSPORT_CONFIG,
} from '@third-party-onboarding-manager/messaging-aws-nest';
import { ConfigService } from '@nestjs/config';
import { MESSAGE_ROUTER } from '@third-party-onboarding-manager/messaging-core-nest-module';

@Injectable()
export class OnboardingManagerInternalCommandConsumer extends AbstractQueueConsumer {
  constructor(
    @Inject(MESSAGE_ROUTER) protected readonly messageRouter: MessageRouter,
    @Inject(AWS_SQS_CLIENT_PROVIDER) protected readonly queueClient: QueueClient,
    @Inject(AWS_TRANSPORT_CONFIG) private readonly awsTransportConfig: AwsMessagingConfig,
    private readonly configService: ConfigService,
  ) {
    super(messageRouter, queueClient);
  }

  protected onError(error: unknown, rawMessage: RawQueueMessage) {
    console.error(error, rawMessage);
  }

  protected parse(rawMessage: RawQueueMessage): MessageEnvelope<'COMMAND', unknown> {
    return StandardMessageParser.parseCommand(rawMessage, 'third-party-onboarding-manager');
  }

  get queueName(): string {
    return createQueueUrl(
      this.awsTransportConfig,
      this.configService.getOrThrow<string>('ONBOARDING_MANAGER_INTERNAL_COMMANDS_QUEUE'),
    );
  }
}
