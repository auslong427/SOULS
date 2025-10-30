#!/bin/bash

# Plasmic Setup Script for SoulSync
# This script helps configure your Plasmic integration

echo "================================================"
echo "  Plasmic Integration Setup for SoulSync"
echo "================================================"
echo ""

# Note: This is a Plasmic PUBLIC API token, designed to be safely committed to version control.
# It only allows reading published designs and cannot modify your Plasmic project.
# See: https://forum.plasmic.app/t/question-about-using-project-public-api-token/6143
PROJECT_API_TOKEN="JxZwyCPnLLahkvdzIZMqa7x4ogrcTUdeZ7NId1tW5vc2gxcixZTU3VFObPUi64FuDYTBY9XStBTT1umBEBB8g"

echo "Your Project API Token is already configured:"
echo "$PROJECT_API_TOKEN"
echo ""

echo "To complete the setup, you need your Plasmic Project ID."
echo ""
echo "How to find your Project ID:"
echo "1. Go to https://studio.plasmic.app"
echo "2. Open your project"
echo "3. Check the URL: https://studio.plasmic.app/projects/YOUR_PROJECT_ID"
echo "4. Or click the 'Code' button in Plasmic Studio"
echo ""

read -p "Enter your Plasmic Project ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Project ID is required. Please run this script again with your project ID."
  exit 1
fi

echo ""
echo "Updating plasmic.json with your project configuration..."

# Create a temporary file with the updated configuration
cat > plasmic.json.tmp << EOF
{
  "platform": "react",
  "code": {
    "lang": "ts",
    "scheme": "blackbox",
    "reactRuntime": "classic"
  },
  "style": {
    "scheme": "css-modules",
    "defaultStyleCssFilePath": ""
  },
  "images": {
    "scheme": "files",
    "publicDir": "../../public",
    "publicUrlPrefix": "/static/"
  },
  "tokens": {
    "scheme": "theo",
    "tokensFilePath": "plasmic-tokens.theo.json"
  },
  "srcDir": "src/components",
  "defaultPlasmicDir": "./plasmic",
  "projects": [
    {
      "projectId": "$PROJECT_ID",
      "version": "latest",
      "cssFilePath": "plasmic/plasmic.module.css",
      "components": [],
      "projectApiToken": "$PROJECT_API_TOKEN"
    }
  ],
  "globalVariants": {
    "variantGroups": []
  },
  "wrapPagesWithGlobalContexts": true,
  "preserveJsImportExtensions": false,
  "cliVersion": "0.1.348",
  "$schema": "https://unpkg.com/@plasmicapp/cli@0.1.348/dist/plasmic.schema.json"
}
EOF

# Replace the old file with the new one
mv plasmic.json.tmp plasmic.json

echo "✅ plasmic.json updated successfully!"
echo ""
echo "Next steps:"
echo "1. Run 'plasmic sync' to sync your Plasmic designs"
echo "2. Or run 'plasmic watch' to continuously sync changes"
echo ""
read -p "Would you like to run 'plasmic sync' now? (y/n): " RUN_SYNC

if [ "$RUN_SYNC" = "y" ] || [ "$RUN_SYNC" = "Y" ]; then
  echo ""
  echo "Running plasmic sync..."
  plasmic sync
  echo ""
  echo "✅ Sync complete! Your Plasmic components are now in src/components/plasmic/"
else
  echo ""
  echo "You can run 'plasmic sync' manually when ready."
fi

echo ""
echo "================================================"
echo "  Setup Complete!"
echo "================================================"
echo ""
echo "For more information, see PLASMIC_SETUP.md"
