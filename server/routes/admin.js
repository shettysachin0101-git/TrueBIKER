const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Bike = require('../models/Bike');
const User = require('../models/User');
const { syncToBikesDb } = require('../utils/dbSync');

// Protect all routes in this router with both auth and admin middlewares
router.use(auth);
router.use(admin);

// GET /api/admin/stats - Get administrative metrics and statistics
router.get('/stats', async (req, res) => {
  try {
    const totalBikes = await Bike.countDocuments();
    const totalUsers = await User.countDocuments();

    // Aggregate brand counts
    const brandStats = await Bike.aggregate([
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Aggregate category counts
    const categoryStats = await Bike.aggregate([
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Aggregate popular user preferences
    const usersWithPrefs = await User.find({ 'preferences.ridingTypes': { $exists: true } });
    const ridingTypePrefs = {};
    const brandPrefs = {};
    let totalBudgets = 0;
    let budgetCount = 0;

    usersWithPrefs.forEach(u => {
      if (u.preferences.ridingTypes) {
        u.preferences.ridingTypes.forEach(rt => {
          ridingTypePrefs[rt] = (ridingTypePrefs[rt] || 0) + 1;
        });
      }
      if (u.preferences.brands) {
        u.preferences.brands.forEach(b => {
          brandPrefs[b] = (brandPrefs[b] || 0) + 1;
        });
      }
      if (u.preferences.budgetMax) {
        totalBudgets += u.preferences.budgetMax;
        budgetCount++;
      }
    });

    res.json({
      totalBikes,
      totalUsers,
      brandStats,
      categoryStats,
      preferences: {
        ridingTypes: ridingTypePrefs,
        brands: brandPrefs,
        averageBudgetMax: budgetCount > 0 ? Math.round(totalBudgets / budgetCount) : 0
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /api/admin/users - Get all users (excluding passwords)
router.get('/users', async (req, res) => {
  try {
    const usersList = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(usersList);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/admin/bikes - Add a new bike
router.post('/bikes', async (req, res) => {
  try {
    const { bikeName } = req.body;

    // Check if duplicate name exists
    const existing = await Bike.findOne({ bikeName });
    if (existing) {
      return res.status(400).json({ msg: 'A motorcycle with this name already exists' });
    }

    const newBike = new Bike(req.body);
    await newBike.save();
    
    // Sync changes to bikes.db
    await syncToBikesDb();
    
    res.status(201).json(newBike);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error: ' + err.message);
  }
});

// PUT /api/admin/bikes/:id - Edit an existing bike
router.put('/bikes/:id', async (req, res) => {
  try {
    let bike = await Bike.findById(req.params.id);
    if (!bike) {
      return res.status(404).json({ msg: 'Bike not found' });
    }

    // Check if name is changed and is duplicate
    if (req.body.bikeName && req.body.bikeName !== bike.bikeName) {
      const duplicate = await Bike.findOne({ bikeName: req.body.bikeName });
      if (duplicate) {
        return res.status(400).json({ msg: 'A motorcycle with this name already exists' });
      }
    }

    bike = await Bike.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    // Sync changes to bikes.db
    await syncToBikesDb();

    res.json(bike);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error: ' + err.message);
  }
});

// DELETE /api/admin/bikes/:id - Delete a bike
router.delete('/bikes/:id', async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) {
      return res.status(404).json({ msg: 'Bike not found' });
    }

    await Bike.findByIdAndDelete(req.params.id);
    
    // Sync changes to bikes.db
    await syncToBikesDb();
    
    res.json({ msg: 'Motorcycle deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
