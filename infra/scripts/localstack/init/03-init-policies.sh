#!/bin/bash
set -euo pipefail

echo "=== Setting SQS policies to allow SNS -> SQS ==="

ACCOUNT_ID="${AWS_ACCOUNT_ID}"
REGION="${AWS_DEFAULT_REGION}"


echo "REGION=$REGION"
echo "ACCOUNT_ID=$ACCOUNT_ID"
echo "TOPIC(InternalEvents)=$ONBOARDING_MANAGER_INTERNAL_EVENTS_TOPIC"
echo "QUEUE(OrchestratorInternalEvents)=$ONBOARDING_MANAGER_ORCHESTRATOR_INTERNAL_EVENTS_QUEUE"

allow_sns_to_sqs() {
  local queue_name="$1"
  local topic_name="$2"

  local queue_url queue_arn topic_arn policy_json policy_json_string attrs_file

  queue_url="$(awslocal sqs get-queue-url --queue-name "$queue_name" --query 'QueueUrl' --output text)"
  queue_arn="$(awslocal sqs get-queue-attributes --queue-url "$queue_url" --attribute-names QueueArn --query 'Attributes.QueueArn' --output text)"
  topic_arn="arn:aws:sns:${REGION}:${ACCOUNT_ID}:${topic_name}"

  echo " - Allowing ${topic_arn} -> ${queue_arn}"

  # Policy JSON (objet) sur une ligne
  policy_json="$(printf '{"Version":"2012-10-17","Statement":[{"Sid":"AllowSnsSendMessage","Effect":"Allow","Principal":"*","Action":"SQS:SendMessage","Resource":"%s","Condition":{"ArnEquals":{"aws:SourceArn":"%s"}}}]}' \
    "$queue_arn" "$topic_arn")"

  # Convertit l'objet JSON en *string JSON* correctement échappée: "{\"Version\":...}"
  policy_json_string="$(python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "$policy_json")"

  # attrs_file doit contenir: { "Policy": "<string>" }
  attrs_file="/tmp/${queue_name}-attrs.json"
  cat > "$attrs_file" <<EOF
{
  "Policy": ${policy_json_string}
}
EOF

  awslocal sqs set-queue-attributes \
    --queue-url "$queue_url" \
    --attributes file://"$attrs_file"
}

allow_sns_to_sqs \
  "$ONBOARDING_MANAGER_ORCHESTRATOR_INTERNAL_EVENTS_QUEUE" \
  "$ONBOARDING_MANAGER_INTERNAL_EVENTS_TOPIC"

echo "=== Done ==="