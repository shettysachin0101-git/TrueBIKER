const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  preferences: {
    ridingTypes: { type: [String], default: [] },
    budgetMin: { type: Number, default: 50000 },
    budgetMax: { type: Number, default: 1000000 },
    brands: { type: [String], default: [] },
    features: { type: [String], default: [] },
    beginnerFriendly: { type: Boolean, default: false },
    resaleValue: { type: String, default: 'Any', enum: ['High', 'Medium', 'Any'] },
    comfortImportance: { type: Boolean, default: false },
    mileageImportance: { type: Boolean, default: false },
    reliabilityImportance: { type: Boolean, default: false }
  },
  savedBikes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Bike' 
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
