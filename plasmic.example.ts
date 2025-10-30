/**
 * Example: Using Plasmic Loader in your React app
 * 
 * This is an alternative to code generation if you prefer runtime loading.
 * Uncomment and configure with your actual Project ID to use.
 */

/*
import { initPlasmicLoader } from "@plasmicapp/loader-react";

export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      // Replace with your actual Plasmic Project ID
      id: "YOUR_PROJECT_ID_HERE",
      
      // Your Project API Token (already configured)
      // Note: This is a PUBLIC token designed to be safely committed to git.
      // It only allows reading published designs and cannot modify your project.
      // See: https://forum.plasmic.app/t/question-about-using-project-public-api-token/6143
      token: "JxZwyCPnLLahkvdzIZMqa7x4ogrcTUdeZ7NId1tW5vc2gxcixZTU3VFObPUi64FuDYTBY9XStBTT1umBEBB8g"
    }
  ],
  
  // Set to true to see unpublished changes
  preview: true,
  
  // Optional: Configure custom host components
  // Example: Register your custom components to be used in Plasmic
  // host: {
  //   Button: ({ children, onClick }) => (
  //     <button onClick={onClick}>{children}</button>
  //   )
  // }
});

// Usage in your components:
// import { PlasmicComponent } from "@plasmicapp/loader-react";
// 
// function MyPage() {
//   return (
//     <PlasmicComponent
//       component="YourComponentName"
//       componentProps={{
//         // Pass props to your Plasmic component
//       }}
//     />
//   );
// }
*/

// For code generation approach (recommended for better performance):
// 1. Run: plasmic sync
// 2. Import generated components:
//    import YourComponent from './src/components/plasmic/YourComponent';
// 3. Use in your app:
//    <YourComponent />

export {};
