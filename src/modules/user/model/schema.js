const { Schema } = require('mongoose');

module.exports = new Schema({
  tId: { // Twitter Id
    type: Number,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  creds: {
    token: {
      type: String,
      required: true
    },
    secret: {
      type: String,
      required: true
    }
  }
});