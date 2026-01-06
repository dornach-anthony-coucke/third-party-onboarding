#!/bin/bash
set -e

echo "=== Creating SNS topics ==="

# Internal events topic for third-party-onboarding-manager
awslocal sns create-topic \
  --name "$ONBOARDING_MANAGER_INTERNAL_EVENTS_TOPIC"