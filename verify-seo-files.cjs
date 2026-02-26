const https = require('https');
const http = require('http');

function testURL(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          body: data.substring(0, 200) // First 200 chars
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function verifyFiles() {
  console.log('\n🔍 Verifying SEO Files on HalfMovies.com\n');
  console.log('=' .repeat(60));
  
  const files = [
    { url: 'https://halfmovies.com/robots.txt', name: 'robots.txt' },
    { url: 'https://halfmovies.com/sitemap.xml', name: 'sitemap.xml' }
  ];
  
  const results = [];
  
  for (const file of files) {
    try {
      console.log(`\n📄 Testing: ${file.name}`);
      console.log(`   URL: ${file.url}`);
      
      const result = await testURL(file.url);
      results.push({ ...file, ...result });
      
      if (result.status === 200) {
        console.log(`   ✅ Status: HTTP ${result.status} ${result.statusText}`);
        console.log(`   ✅ Content-Type: ${result.headers['content-type'] || 'N/A'}`);
        console.log(`   ✅ File is LIVE and accessible`);
        
        // Show first few lines
        const preview = result.body.split('\n').slice(0, 3).join('\n');
        if (preview) {
          console.log(`   Preview: ${preview.substring(0, 80)}...`);
        }
      } else {
        console.log(`   ❌ Status: HTTP ${result.status} ${result.statusText}`);
        console.log(`   ❌ File NOT FOUND or BLOCKED`);
        console.log(`   ⚠️  Action: Upload ${file.name} to /public_html/`);
      }
    } catch (error) {
      results.push({ ...file, error: error.message });
      console.log(`   ❌ Error: ${error.message}`);
      console.log(`   ⚠️  Action: Check manually in browser`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');
  
  const success = results.filter(r => r.status === 200).length;
  const failed = results.filter(r => r.status !== 200 || r.error).length;
  
  results.forEach(r => {
    if (r.status === 200) {
      console.log(`✅ ${r.name}: HTTP ${r.status} - LIVE`);
    } else if (r.error) {
      console.log(`❌ ${r.name}: ERROR - ${r.error}`);
    } else {
      console.log(`❌ ${r.name}: HTTP ${r.status} - NOT FOUND`);
    }
  });
  
  console.log(`\n✅ Success: ${success}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 All files are live and accessible!');
  } else {
    console.log('\n⚠️  Some files need to be uploaded to /public_html/');
  }
  
  console.log('\n');
}

// Run verification
verifyFiles().catch(console.error);

