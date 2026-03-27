#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Checking for unsupported scaffold leftovers..."
leftovers="$(find miniprogram -type f \( -name '*.ts' -o -name '*.scss' \) | sort)"
if [[ -n "$leftovers" ]]; then
  echo "Remove unused TypeScript/SCSS source leftovers before running checks:"
  echo "$leftovers"
  exit 1
fi

echo "Checking JavaScript syntax..."
while IFS= read -r file; do
  node --check "$file"
done < <(find miniprogram scripts -type f -name '*.js' | sort)

while IFS= read -r file; do
  node --check "$file"
done < <(find worker -type f \( -name '*.js' -o -name '*.mjs' \) | sort)

echo "Running smoke tests..."
node scripts/smoke-test.js
node scripts/worker-smoke-test.js

echo "All checks passed."
