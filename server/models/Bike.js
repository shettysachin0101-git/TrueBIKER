const mongoose = require('mongoose');

const bikeSchema = new mongoose.Schema({
  bikeName: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  brand: { 
    type: String, 
    required: true, 
    trim: true 
  },
  engineCC: { 
    type: Number, 
    required: true 
  },
  mileage: { 
    type: Number, 
    required: true 
  },
  topSpeed: { 
    type: Number, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  fuelType: { 
    type: String, 
    required: true,
    enum: ['Petrol', 'Electric', 'Hybrid']
  },
  transmission: { 
    type: String, 
    required: true,
    enum: ['Manual', 'Automatic']
  },
  weight: { 
    type: Number, 
    required: true 
  },
  seatHeight: { 
    type: Number, 
    required: true 
  },
  reliabilityScore: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 10 
  },
  beginnerFriendly: { 
    type: Boolean, 
    required: true 
  },
  resaleValue: { 
    type: String, 
    required: true,
    enum: ['High', 'Medium', 'Low']
  },
  categories: { 
    type: [String], 
    required: true 
  },
  features: { 
    type: [String], 
    required: true 
  },
  pros: { 
    type: [String], 
    required: true 
  },
  cons: { 
    type: [String], 
    required: true 
  },
  imageUrl: { 
    type: String 
  },
  officialWebsite: { 
    type: String, 
    required: true 
  },
  launchYear: { 
    type: Number, 
    required: true 
  },
  availability: { 
    type: String, 
    default: 'Available',
    enum: ['Available', 'Unavailable', 'Coming Soon']
  }
}, { timestamps: true });

// Create indexes for database search and filter performance
bikeSchema.index({ brand: 1 });
bikeSchema.index({ price: 1 });
bikeSchema.index({ engineCC: 1 });
bikeSchema.index({ categories: 1 });

module.exports = mongoose.model('Bike', bikeSchema);
