const express = require('express');
const router = express.Router();
const Bike = require('../models/Bike');
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/bikes/favorites/all - Get all saved/favorited bikes for the current user
router.get('/favorites/all', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedBikes');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user.savedBikes || []);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /api/bikes - Get all bikes with pagination, search, and advanced filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const query = {};

    // 1. Text Search (Matches bikeName or brand)
    if (req.query.search) {
      query.bikeName = { $regex: req.query.search, $options: 'i' };
    }

    // 2. Exact brand filter
    if (req.query.brand) {
      const brands = req.query.brand.split(',');
      query.brand = { $in: brands };
    }

    // 3. Category matching (in categories array)
    if (req.query.category) {
      const categories = req.query.category.split(',');
      query.categories = { $in: categories };
    }

    // 4. Budget/Price range
    if (req.query.priceMin || req.query.priceMax) {
      query.price = {};
      if (req.query.priceMin) query.price.$gte = parseFloat(req.query.priceMin);
      if (req.query.priceMax) query.price.$lte = parseFloat(req.query.priceMax);
    }

    // 5. Engine Displacement range
    if (req.query.engineCCMin || req.query.engineCCMax) {
      query.engineCC = {};
      if (req.query.engineCCMin) query.engineCC.$gte = parseFloat(req.query.engineCCMin);
      if (req.query.engineCCMax) query.engineCC.$lte = parseFloat(req.query.engineCCMax);
    }

    // 6. Mileage (fuel economy) threshold
    if (req.query.mileageMin) {
      query.mileage = { $gte: parseFloat(req.query.mileageMin) };
    }

    // 7. Fuel Type
    if (req.query.fuelType) {
      query.fuelType = req.query.fuelType;
    }

    // 8. Transmission
    if (req.query.transmission) {
      query.transmission = req.query.transmission;
    }

    // 9. Reliability rating
    if (req.query.reliabilityMin) {
      query.reliabilityScore = { $gte: parseInt(req.query.reliabilityMin) };
    }

    // 10. Beginner friendliness
    if (req.query.beginnerFriendly === 'true') {
      query.beginnerFriendly = true;
    }

    // 11. Resale Value
    if (req.query.resaleValue && req.query.resaleValue !== 'Any') {
      query.resaleValue = req.query.resaleValue;
    }

    // Execute paginated queries utilizing database indexes
    const total = await Bike.countDocuments(query);
    const bikes = await Bike.find(query)
      .sort({ price: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      bikes,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /api/bikes/brands - Get a list of all unique brands
router.get('/brands', async (req, res) => {
  try {
    const brands = await Bike.distinct('brand');
    res.json(brands);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /api/bikes/categories - Get a list of all unique categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Bike.distinct('categories');
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST /api/bikes/:id/favorite - Save/Favorite a bike
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) {
      return res.status(404).json({ msg: 'Motorcycle not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if already favorited
    if (user.savedBikes.includes(req.params.id)) {
      return res.status(400).json({ msg: 'Motorcycle already in favorites' });
    }

    user.savedBikes.push(req.params.id);
    await user.save();

    res.json({ msg: 'Motorcycle added to favorites', savedBikes: user.savedBikes });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE /api/bikes/:id/favorite - Unfavorite/Remove a bike
router.delete('/:id/favorite', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.savedBikes = user.savedBikes.filter(bikeId => bikeId.toString() !== req.params.id);
    await user.save();

    res.json({ msg: 'Motorcycle removed from favorites', savedBikes: user.savedBikes });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /api/bikes/:id - Get a single bike by ID
router.get('/:id', async (req, res) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) {
      return res.status(404).json({ msg: 'Bike not found' });
    }
    res.json(bike);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Bike not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
