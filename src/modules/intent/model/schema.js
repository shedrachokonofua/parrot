const { Schema } = require('mongoose');

module.exports = new Schema({
  userId: {
    type: 'ObjectId', 
    ref: 'User',
    required: true
  },
  tweetId: { // Tweet Id
    type: String,
    required: true
  },
  startHour: { 
    type: Number,
    required: true,
    min: 0,
    max: 23
  },
  interval: { // In hours
    type: Number,
    required: true
  },
  enabled: {
    type: Boolean,
    default: true,
    required: true
  },
  nextTrigger: {
    type: Date,
    required: true
  }
} { 
  timestamps: { 
    createdAt: 'timestamp' 
  } 
});