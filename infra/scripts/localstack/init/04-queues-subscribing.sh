#!/bin/bash
set -e

echo "=== Subscribing SQS queues to SNS topics ==="

ACCOUNT_ID="${AWS_ACCOUNT_ID:-000000000000}"
REGION="${AWS_DEFAULT_REGION:-eu-west-1}"

# 1) TPOM internal events -> orchestrator internal events queue
awslocal sns subscribe \
  --topic-arn "arn:aws:sns:${REGION}:${ACCOUNT_ID}:${ONBOARDING_MANAGER_INTERNAL_EVENTS_TOPIC}" \
  --protocol sqs \
  --notification-endpoint "arn:aws:sqs:${REGION}:${ACCOUNT_ID}:${ONBOARDING_MANAGER_ORCHESTRATOR_INTERNAL_EVENTS_QUEUE}"
