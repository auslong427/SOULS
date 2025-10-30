# Plasmic Integration Setup

This guide will help you complete the Plasmic integration for your SoulSync app.

## What You Have

✅ Plasmic CLI installed
✅ Project dependencies installed
✅ Plasmic configuration initialized (plasmic.json)
✅ Project API Token: `JxZwyCPnLLahkvdzIZMqa7x4ogrcTUdeZ7NId1tW5vc2gxcixZTU3VFObPUi64FuDYTBY9XStBTT1umBEBB8g`

## What You Need

To complete the Plasmic integration, you need your **Plasmic Project ID**.

### How to Find Your Project ID

1. Go to [Plasmic Studio](https://studio.plasmic.app)
2. Open your project
3. Look at the URL in your browser - it will be in this format:
   ```
   https://studio.plasmic.app/projects/YOUR_PROJECT_ID
   ```
4. Copy the `YOUR_PROJECT_ID` part

Alternatively, click the "Code" button in the Plasmic Studio toolbar to see both your Project ID and API Token.

## Complete the Setup

Once you have your Project ID, follow these steps:

### 1. Update plasmic.json

Edit the `plasmic.json` file and add your project configuration to the `projects` array:

```json
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
      "projectId": "YOUR_PROJECT_ID_HERE",
      "version": "latest",
      "cssFilePath": "plasmic/plasmic.module.css",
      "components": [],
      "projectApiToken": "JxZwyCPnLLahkvdzIZMqa7x4ogrcTUdeZ7NId1tW5vc2gxcixZTU3VFObPUi64FuDYTBY9XStBTT1umBEBB8g"
    }
  ],
  "globalVariants": {
    "variantGroups": []
  },
  "wrapPagesWithGlobalContexts": true,
  "preserveJsImportExtensions": false,
  "cliVersion": "0.1.348"
}
```

Replace `YOUR_PROJECT_ID_HERE` with your actual project ID.

### 2. Sync Your Project

Run the sync command to pull your Plasmic designs into this codebase:

```bash
plasmic sync
```

Or to watch for changes continuously:

```bash
plasmic watch
```

### 3. Use Plasmic Components in Your App

After syncing, you can import and use Plasmic components in your React app:

```typescript
import YourPlasmicComponent from './src/components/plasmic/YourPlasmicComponent';

function App() {
  return <YourPlasmicComponent />;
}
```

## Alternative: Loader API (Runtime)

If you prefer runtime loading instead of codegen, you can use the Plasmic Loader:

1. Install the loader package:
   ```bash
   npm install @plasmicapp/loader-react
   ```

2. Initialize in your app:
   ```typescript
   import { initPlasmicLoader } from "@plasmicapp/loader-react";
   
   export const PLASMIC = initPlasmicLoader({
     projects: [
       {
         id: "YOUR_PROJECT_ID_HERE",
         token: "JxZwyCPnLLahkvdzIZMqa7x4ogrcTUdeZ7NId1tW5vc2gxcixZTU3VFObPUi64FuDYTBY9XStBTT1umBEBB8g"
       }
     ],
     preview: true
   });
   ```

## Troubleshooting

- **Can't find project ID**: Make sure you're logged into Plasmic Studio and check the URL
- **Sync fails**: Verify both the project ID and API token are correct
- **Components not showing**: Make sure you've published your components in Plasmic Studio

## Resources

- [Plasmic Documentation](https://docs.plasmic.app/)
- [React Quickstart](https://docs.plasmic.app/learn/react-quickstart/)
- [CLI Usage](https://docs.plasmic.app/learn/cli/)
- [plasmic.json Configuration](https://docs.plasmic.app/learn/plasmic-json/)

## Support

If you need help, visit the [Plasmic Forum](https://forum.plasmic.app/) or check the [documentation](https://docs.plasmic.app/).
