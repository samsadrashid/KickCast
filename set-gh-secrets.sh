#!/bin/bash
set -e

REPO="samsadrashid/KickCast"

VERCEL_TOKEN=$(python3 -c "import json; d=json.load(open('/Users/ony/Library/Application Support/com.vercel.cli/auth.json')); print(d['token'])")

gh secret set VERCEL_TOKEN       --repo "$REPO" --body "$VERCEL_TOKEN"
gh secret set VERCEL_ORG_ID      --repo "$REPO" --body "team_anU5oYBRSF5U5obZ4XdHnA2W"
gh secret set VITE_SUPABASE_URL  --repo "$REPO" --body "https://koxmyiquyoxalpkefcsf.supabase.co"
gh secret set VITE_SUPABASE_ANON_KEY --repo "$REPO" --body "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtveG15aXF1eW94YWxwa2VmY3NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzgwMTksImV4cCI6MjA5Njc1NDAxOX0.5wq56C1UMX_BeSaWICC3qmhqhHqj7WSTAXMRKPL8ZL0"

echo "All 4 secrets set on $REPO"
