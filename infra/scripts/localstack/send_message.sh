#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${ENV_FILE:-.env}"
if [ -f "$ENV_FILE" ]; then
  set -a; . "$ENV_FILE"; set +a
fi

TOPIC="${COMPANY_REGISTRY_PUBLIC_EVENT_TOPIC:-company-registry--public-events}"

TOPIC_ARN=$(docker exec -i third-party-onboarding-manager-message-bus awslocal sns list-topics \
  --query "Topics[?ends_with(TopicArn, ':$TOPIC')].TopicArn" --output text)

docker exec -it third-party-onboarding-manager-message-bus awslocal sns publish \
  --topic-arn "$TOPIC_ARN" \
  --message '{"id":"test","type":"TestEvent","payload":{"name":"toto"}}'