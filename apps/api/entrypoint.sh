#!/bin/bash

if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

until curl -s -o /dev/null -w "%{http_code}" $PERMIT_DPD_URI | grep -q "200"; do
    echo "Waiting for Permit PDP to be ready..."
    sleep 2
done

bun run start
