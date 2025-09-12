const app = require('../app');
const connectToDatabase = require('../utils/db');

module.exports = async (req, res) => {
  await connectToDatabase();
  app(req, res);
};