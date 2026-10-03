const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Bike = require('../models/Bike');
const User = require('../models/User');

// POST /api/recommendations - Generate recommendations based on preferences
router.post('/', auth, async (req, res) => {
  try {
    const { 
      ridingTypes, 
      budgetMin, 
      budgetMax, 
      brands, 
      features, 
      beginnerFriendly, 
      resaleValue, 
      comfortImportance, 
      mileageImportance, 
      reliabilityImportance 
    } = req.body;

    // 1. Save preferences to user profile in MongoDB
    await User.findByIdAndUpdate(req.user.id, {
      $set: {
        preferences: {
          ridingTypes: ridingTypes || [],
          budgetMin: budgetMin !== undefined ? Number(budgetMin) : 50000,
          budgetMax: budgetMax !== undefined ? Number(budgetMax) : 1000000,
          brands: brands || [],
          features: features || [],
          beginnerFriendly: !!beginnerFriendly,
          resaleValue: resaleValue || 'Any',
          comfortImportance: !!comfortImportance,
          mileageImportance: !!mileageImportance,
          reliabilityImportance: !!reliabilityImportance
        }
      }
    });

    // 2. Fetch all available bikes from MongoDB
    const allBikes = await Bike.find({ availability: { $ne: 'Unavailable' } });

    const targetMin = budgetMin !== undefined ? Number(budgetMin) : 50000;
    const targetMax = budgetMax !== undefined ? Number(budgetMax) : 1000000;

    // 3. Calculate match scores for all bikes
    const scoredResults = allBikes.map(bike => {
      let categoryScore = 0;
      let budgetScore = 0;
      let mileageScore = 0;
      let reliabilityScore = 0;
      let featureScore = 0;
      let brandScore = 0;
      let resaleScore = 0;

      // Explanation reasons array
      const reasons = [];

      // A. Category Match (30 points)
      if (ridingTypes && ridingTypes.length > 0) {
        const matchingCategories = bike.categories.filter(cat => ridingTypes.includes(cat));
        if (matchingCategories.length > 0) {
          categoryScore = 30;
          reasons.push(`Matches riding style: ${matchingCategories.join(', ')}`);
        } else {
          categoryScore = 0;
        }
      } else {
        categoryScore = 30; // neutral default
      }

      // B. Budget Match (25 points)
      if (bike.price >= targetMin && bike.price <= targetMax) {
        budgetScore = 25;
        reasons.push('Matches budget');
      } else if (bike.price < targetMin) {
        const diffRatio = (targetMin - bike.price) / targetMin;
        budgetScore = Math.max(5, Math.round(25 * (1 - diffRatio)));
        reasons.push('Under budget (Affordable option)');
      } else {
        const diffRatio = (bike.price - targetMax) / targetMax;
        budgetScore = Math.max(0, Math.round(25 * (1 - diffRatio)));
      }

      // C. Mileage Match (15 points)
      if (mileageImportance) {
        if (bike.mileage >= 60) {
          mileageScore = 15;
          reasons.push(`Incredible mileage (${bike.mileage} km/l)`);
        } else if (bike.mileage >= 45) {
          mileageScore = 12;
          reasons.push(`High mileage (${bike.mileage} km/l)`);
        } else if (bike.mileage >= 35) {
          mileageScore = 8;
        } else {
          mileageScore = 4;
        }
      } else {
        mileageScore = 15; // neutral default
        if (bike.mileage >= 50) {
          reasons.push(`Good fuel economy (${bike.mileage} km/l)`);
        }
      }

      // D. Reliability Match (10 points)
      // Directly map reliabilityScore (1-10) to points
      reliabilityScore = bike.reliabilityScore;
      if (bike.reliabilityScore >= 8) {
        reasons.push(`Top-tier reliability (${bike.reliabilityScore}/10)`);
      }

      // E. Feature Match (10 points)
      if (features && features.length > 0) {
        const matchingFeatures = bike.features.filter(f => features.includes(f));
        if (matchingFeatures.length > 0) {
          const ratio = matchingFeatures.length / features.length;
          featureScore = Math.round(ratio * 10);
          reasons.push(`Has preferred features: ${matchingFeatures.slice(0, 2).join(', ')}`);
        } else {
          featureScore = 0;
        }
      } else {
        featureScore = 10; // neutral default
      }

      // F. Brand Match (5 points)
      if (brands && brands.length > 0) {
        if (brands.includes(bike.brand)) {
          brandScore = 5;
          reasons.push('Preferred brand');
        } else {
          brandScore = 0;
        }
      } else {
        brandScore = 5; // neutral default
      }

      // G. Resale Value Match (5 points)
      if (resaleValue && resaleValue !== 'Any') {
        if (bike.resaleValue === 'High') {
          resaleScore = 5;
          reasons.push('Excellent resale value');
        } else if (bike.resaleValue === 'Medium') {
          resaleScore = 3;
        } else {
          resaleScore = 1;
        }
      } else {
        resaleScore = 5; // neutral default
      }

      // H. Beginner Friendly & Comfort Penalties
      let beginnerPenalty = 0;
      if (beginnerFriendly && !bike.beginnerFriendly) {
        beginnerPenalty = 15; // penalize non-beginner bikes if beginner selected
      } else if (bike.beginnerFriendly) {
        reasons.push('Beginner friendly');
      }

      let comfortPenalty = 0;
      // Derive Comfort rating: Cruiser/Touring or seatHeight in 780-810mm range
      const isCruiserTouring = bike.categories.includes('Cruiser') || bike.categories.includes('Touring');
      const isComfySeat = bike.seatHeight >= 780 && bike.seatHeight <= 810;
      const comfortRating = (isCruiserTouring || isComfySeat) ? 'High' : 'Low';

      if (comfortImportance && comfortRating === 'Low') {
        comfortPenalty = 10; // penalize low comfort bikes
      } else if (comfortRating === 'High') {
        reasons.push('Ergonomically comfortable');
      }

      if (isCruiserTouring) {
        reasons.push('Suitable for long rides');
      }

      // Calculate final match percentage
      let matchPercentage = Math.round(
        categoryScore + 
        budgetScore + 
        mileageScore + 
        reliabilityScore + 
        featureScore + 
        brandScore + 
        resaleScore - 
        beginnerPenalty - 
        comfortPenalty
      );

      // Clamp match percentage between 0 and 100
      matchPercentage = Math.min(100, Math.max(0, matchPercentage));

      return {
        bike,
        matchPercentage,
        reasons: Array.from(new Set(reasons)) // unique reasons
      };
    });

    // 4. Sort recommendations by match percentage in descending order
    scoredResults.sort((a, b) => b.matchPercentage - a.matchPercentage);

    // 5. Slice to return the top 10 recommended bikes
    const topRecommendations = scoredResults.slice(0, 10);

    res.json(topRecommendations);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
