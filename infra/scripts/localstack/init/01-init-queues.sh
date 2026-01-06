#!/bin/bash
set -e

echo "=== Creating SQS queues ==="

# Internal commands inbox for third-party-onboarding-manager
awslocal sqs create-queue \
  --queue-name "$ONBOARDING_MANAGER_INTERNAL_COMMANDS_QUEUE"

# Internal events queue consumed by the orchestrator (subscribed to TPOM internal events topic)
awslocal sqs create-queue \
  --queue-name "$ONBOARDING_MANAGER_ORCHESTRATOR_INTERNAL_EVENTS_QUEUE"

# Public events queues consumed by the orchestrator (subscribed to upstream public events topics)
awslocal sqs create-queue \
  --queue-name "$ONBOARDING_MANAGER_ORCHESTRATOR_COMPANY_REGISTRY_PUBLIC_EVENTS_QUEUE"

awslocal sqs create-queue \
  --queue-name "$ONBOARDING_MANAGER_ORCHESTRATOR_ACCOUNT_REGISTRY_PUBLIC_EVENTS_QUEUE"

# Public commands inboxes (owned by the target BCs)
awslocal sqs create-queue \
  --queue-name "$COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE"

awslocal sqs create-queue \
  --queue-name "$ACCOUNT_REGISTRY_PUBLIC_COMMANDS_QUEUE"