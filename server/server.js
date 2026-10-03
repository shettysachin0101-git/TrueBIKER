require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const mongoose = require('mongoose');
const mongoMemoryServer = require('./mongoMemoryServer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static images
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Routes
const authRoutes = require('./routes/auth');
const bikeRoutes = require('./routes/bikes');
const recommendationRoutes = require('./routes/recommendations');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/bikes', bikeRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/admin', adminRoutes);

// Auto Database Updater (Cron Job Stub) - Runs every Sunday at midnight
cron.schedule('0 0 * * 0', () => {
  console.log('Running Auto Bike Database Updater cron job...');
});

const PORT = process.env.PORT || 5000;

// Initialize Database and Start Server
const startApp = async () => {
  try {
    // Start local memory server if necessary
    await mongoMemoryServer.start();

    // Connect to MongoDB via Mongoose
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/motorbike_researcher';
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Database connected successfully.');

    // Auto-seed database if empty
    const Bike = require('./models/Bike');
    const count = await Bike.countDocuments();
    if (count === 0) {
      console.log('⚠️ Database is empty. Seeding initial motorcycle records...');
      const seedDatabase = require('./seedDatabase');
      await seedDatabase();
    } else {
      console.log(`📡 Database currently contains ${count} motorcycle records.`);
    }

    // Run initial synchronization to server/data/bikes.db
    const { syncToBikesDb } = require('./utils/dbSync');
    await syncToBikesDb();

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Error during application startup:', err);
    process.exit(1);
  }
};

startApp();
