const { Schema } = require('mongoose');

module.exports = new Schema({
  intent: { 
    type: 'ObjectId', 
    ref: 'Intent',
    required: true
  }
}, { 
  timestamps: { 
    createdAt: 'timestamp' 
  } 
});