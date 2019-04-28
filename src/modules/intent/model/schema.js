const { Schema } = require('mongoose');

module.exports = new Schema({
  tweedId: { // Tweet Id
    type: Number,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  interval: {
    type: Number,
    required: true
  },
  enabled: {
    type: Boolean,
    default: true,
    required: true
  }
});