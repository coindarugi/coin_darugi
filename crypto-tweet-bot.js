// Dynamic imports with async/await to handle ESM loading properly
let axios;
let TwitterApi;

async function initializeModules() {
  try {
    // Dynamically import axios
    axios = (await import('axios')).default;
    
    // Dynamically import twitter-api-v2
    const twitterModule = await import('twitter-api-v2');
    TwitterApi = twitterModule.TwitterApi;
    
    console.log('Modules loaded successfully');
  } catch (error) {
    console.error('Error loading modules:', error.message);
    process.exit(1);
  }
}

// Main execution
async function main() {
  // Initialize modules first
  await initializeModules();
  
  // Your bot logic here
  console.log('Crypto Tweet Bot initialized');
}

// Run the main function
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { axios, TwitterApi, initializeModules };
