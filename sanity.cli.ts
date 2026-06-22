/**
* This configuration file lets you run `$ sanity [command]` in this folder
* Go to https://www.sanity.io/docs/cli to learn more.
**/
import { defineCliConfig } from 'sanity/cli'

// Fallback logic so both Next.js and Sanity Vite environments can read the values
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET

export default defineCliConfig({ 
  api: { 
    projectId, 
    dataset 
  },
  // Saves your cloud app mapping so you aren't prompted for it on future updates
  deployment: {
    appId: 'yomntryu9cc5zo2e7odm374w',
  }
})
