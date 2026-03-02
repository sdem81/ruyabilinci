const https = require('https');

const DEPLOY_CHECK_URL = 'https://sdem81-ruyabilinci.vercel.app/api/admin/populate';
const MAX_WAIT_MINUTES = 5;
const CHECK_INTERVAL_MS = 10000; // 10 seconds

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function waitAndPopulate() {
  console.log('🚀 Waiting for Vercel deployment to complete...\n');
  
  const startTime = Date.now();
  const maxWaitMs = MAX_WAIT_MINUTES * 60 * 1000;
  
  while (Date.now() - startTime < maxWaitMs) {
    try {
      process.stdout.write('\r⏳ Checking deployment...');
      
      const result = await fetchUrl(DEPLOY_CHECK_URL);
      
      if (result.status === 200) {
        console.log('\n\n✅ Deployment complete! Triggering population...\n');
        console.log('Response:', result.data);
        
        const response = JSON.parse(result.data);
        if (response.success || response.totalDreams > 0) {
          console.log('\n🎉 SUCCESS!');
          console.log(`   Total dreams: ${response.totalDreams || response.count}`);
          console.log('\n✨ All pages should now work:');
          console.log('   - https://sdem81-ruyabilinci.vercel.app/');
          console.log('   - https://sdem81-ruyabilinci.vercel.app/kategori/giyim');
          console.log('   - https://sdem81-ruyabilinci.vercel.app/kategori/degerli-esyalar');
          return;
        }
      } else if (result.status === 404) {
        process.stdout.write(' (404 - still deploying)');
      } else if (result.status === 500) {
        process.stdout.write(' (500 - deploy in progress)');
      }
      
      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL_MS));
      
    } catch (error) {
      process.stdout.write(` (${error.code || 'error'})`);
      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL_MS));
    }
  }
  
  console.log('\n\n⚠️  Timeout reached. Check manually:');
  console.log('   ' + DEPLOY_CHECK_URL);
}

waitAndPopulate().catch(console.error);
