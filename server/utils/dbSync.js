const fs = require('fs');
const path = require('path');
const Bike = require('../models/Bike');

/**
 * Synchronizes the Mongoose Bike collection with the local NeDB file-based backup.
 */
const syncToBikesDb = async () => {
  try {
    const bikes = await Bike.find({}).sort({ price: 1 });
    const lines = bikes.map(bike => {
      const doc = bike.toObject();
      // Ensure 'name' is populated for legacy compatibility
      doc.name = doc.bikeName;
      // Convert ObjectId to string
      doc._id = doc._id.toString();
      return JSON.stringify(doc);
    });

    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const filePath = path.join(dataDir, 'bikes.db');
    fs.writeFileSync(filePath, lines.join('\n') + '\n', 'utf8');
    console.log(`✅ Database synchronized: Wrote ${bikes.length} bikes to ${filePath}`);
  } catch (err) {
    console.error('❌ Error synchronizing database:', err.message);
  }
};

module.exports = {
  syncToBikesDb
};
