#!/usr/bin/env bash
set -euo pipefail

npm run build
npm run lint
npm run format
npm test -- --runInBand

