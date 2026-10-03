const https = require('https');

const imageIds = [
  '1558981403-c5f9899a28bc', // Hero Splendor Plus
  '1515777315835-281b94c9589f', // Hero HF Deluxe
  '1508847154043-be12a62861c1', // Hero Glamour Xtec
  '1606907547341-1187ab69d3b4', // Hero Xpulse 200 4V
  '1591637333184-19aa84b3e01f', // Hero Karizma XMR
  '1558981806-ec527fa84c39', // Hero Mavrick 440
  '1635073909783-a4ef30f89839', // Honda Shine 125
  '1625126396752-12ef38f19597', // Honda Unicorn
  '1569256389641-6f90ffd15b6c', // Honda CB300R
  '1611038596645-ec0522197ef4', // Yamaha MT-15 V2
  '1568605117036-5fe5e7bab0b7', // Yamaha R15 V4
  '1614162692292-7ac56d7f7f1e', // KTM Duke 390
  '1534088568595-a066f410bcda', // KTM 390 Adventure
  '1593784991823-c9cf78a6358c', // RE Hunter 350
  '1609630875171-b1321377ee65', // RE Himalayan 450
  '1558981852-416d680a5e43', // RE Interceptor 650
  '1615887023516-9b6bcd559e87'  // Suzuki Gixxer SF 250
];

function checkImageCdn(id) {
  return new Promise((resolve) => {
    const url = `https://images.unsplash.com/photo-${id}?w=10`; // small width to check status quickly
    https.get(url, (res) => {
      console.log(`${res.statusCode === 200 ? '✅' : '❌'} ${id}: Status ${res.statusCode}`);
      resolve();
    }).on('error', (err) => {
      console.log(`❌ ${id}: Error ${err.message}`);
      resolve();
    });
  });
}

async function run() {
  console.log('Testing Unsplash CDN Image URLs...');
  for (const id of imageIds) {
    await checkImageCdn(id);
  }
}

run();
