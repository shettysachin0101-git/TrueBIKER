const https = require('https');

const categories = {
  scooter: 'scooter',
  cruiser: 'cruiser-motorcycle',
  sports: 'sports-motorcycle',
  adventure: 'adventure-motorcycle',
  commuter: 'commuter-motorcycle'
};

function fetchPage(urlStr) {
  return new Promise((resolve) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };
    https.get(urlStr, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      resolve('');
    });
  });
}

function checkCdn(id) {
  return new Promise((resolve) => {
    https.get(`https://images.unsplash.com/photo-${id}?w=10`, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function getPhotosForCategory(keyword) {
  const url = `https://unsplash.com/s/photos/${keyword}`;
  const html = await fetchPage(url);
  
  // Regex to match "images.unsplash.com/photo-1234567890-abcdef..."
  const regex = /images\.unsplash\.com\/photo-([a-zA-Z0-9\-_]+)/g;
  const matches = new Set();
  let match;
  while ((match = regex.exec(html)) !== null) {
    const rawId = match[1];
    // Unsplash photo ID is the part before any query params or other separators.
    // Usually it is alphanumeric. Let's split on any non-alphanumeric char.
    const cleanId = rawId.split(/[?&'"\s\/\-_]/)[0];
    if (cleanId && cleanId.length >= 8 && /^[a-zA-Z0-9]+$/.test(cleanId)) {
      matches.add(cleanId);
    }
  }
  
  const ids = Array.from(matches);
  console.log(`Found ${ids.length} unique image IDs in HTML for "${keyword}"...`);
  
  const validIds = [];
  for (const id of ids) {
    const ok = await checkCdn(id);
    if (ok) {
      validIds.push(id);
      if (validIds.length >= 10) break; // get 10 per category
    }
    await new Promise(r => setTimeout(r, 100));
  }
  
  return validIds;
}

async function run() {
  const results = {};
  for (const [key, term] of Object.entries(categories)) {
    console.log(`Searching for category: ${key} (${term})...`);
    const ids = await getPhotosForCategory(term);
    results[key] = ids;
    console.log(`Category "${key}" has ${ids.length} valid IDs:`, ids);
    console.log('------------------------------------------------');
  }
  console.log('Final verified Unsplash IDs:');
  console.log(JSON.stringify(results, null, 2));
}

run();
