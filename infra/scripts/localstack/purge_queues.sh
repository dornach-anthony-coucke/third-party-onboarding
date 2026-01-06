#!/bin/bash
set -e
echo "=== Purging queues ==="

for queue in ${awslocal sqs list-queues --query 'QueueUrls[]' --output test}; do
    awslocal sqs purge-queue --queue-url "$q"
done