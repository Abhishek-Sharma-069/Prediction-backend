#!/usr/bin/env bash
# Test backend prediction API (backend calls ML service)
# Usage: ./curl-predict.sh [BASE_URL]
# Example: ./curl-predict.sh https://your-backend.onrender.com
BASE="${1:-http://localhost:3000}"
curl -s -X POST "${BASE}/api/ml/predict" \
  -H "Content-Type: application/json" \
  -d '{"rows":[{"TOTRF":0,"RD":0,"RH":50,"DBT":25,"MWS":10,"MSLP":1013}],"probabilities":true}'
echo ""
