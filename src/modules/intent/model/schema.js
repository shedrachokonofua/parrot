const { Schema } = require('mongoose');

module.exports = new Schema({
  userId: {
    type: 'ObjectId', 
    ref: 'User',
    required: true
  },
  tweetId: { // Tweet Id
    type: Number,
    required: true
  },
  startTime: { // HH:00
    type: String,
    required: true
  },
  interval: { // In hours
    type: Number,
    required: true
  },
  enabled: {
    type: Boolean,
    default: true,
    required: true
  }
} { 
  timestamps: { 
    createdAt: 'timestamp' 
  } 
});