const serverless = require('serverless-http');
const app = require('../app');
const connectToDatabase = require('../utils/db');

let isConnected = false;

app.use(async (req, res, next) => {
  if (!isConnected) {
    await connectToDatabase();
    isConnected = true;
  }
  next();
});

module.exports = serverless(app);
