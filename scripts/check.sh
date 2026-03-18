#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Checking JavaScript syntax..."
while IFS= read -r file; do
  node --check "$file"
done < <(find miniprogram scripts -type f -name '*.js' | sort)

echo "Running smoke tests..."
node scripts/smoke-test.js

echo "All checks passed."
