const app = require('../app');
const connectToDatabase = require('../utils/db');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    await connectToDatabase();
    isConnected = true;
  }
  app(req, res);
};