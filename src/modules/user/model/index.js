const { model } = require('mongoose');
const Schema = require('./schema');

module.exports = model('User', Schema);