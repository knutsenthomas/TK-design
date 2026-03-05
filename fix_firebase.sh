#!/bin/bash
# 1. Update firebase.json to serve static files normally and ONLY route /api to the Cloud Function
cat << 'JSON_EOF' > firebase.json
{
  "functions": {
    "source": ".",
    "runtime": "nodejs20"
  },
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**",
      "server.js",
      "package.json",
      "package-lock.json",
      "vercel.json",
      "API_SETUP.md",
      "README.md",
      "fix_firebase.sh"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
JSON_EOF

# 2. Redeploy hosting
firebase deploy --only hosting
