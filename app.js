const express = require('express');
const app = express();

require('dotenv').config();
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');


// Routes Required
const usersRouter = require('./routes/users');
const rolesRouter = require('./routes/role');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const orderRouter = require('./routes/orders');
const dashboardRouter = require('./routes/dashboard');
const uploadImageRouter = require('./routes/upload_image');
const visitorsRouter = require('./routes/visitors');
const collectionsRouter = require('./routes/collection');


// Proxy to Real Ip Address
app.set('trust proxy', true);

// Middlewares
const allowedOrigins = [
  'http://localhost:4200',
  'https://clothify-ruby.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // allow
    } else {
      callback(new Error('Not allowed by CORS')); // deny
    }
  },
  credentials: true
}));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use(usersRouter);
app.use('/roles', rolesRouter);
app.use('/products', productsRouter);
app.use('/collections', collectionsRouter);
app.use('/carts', cartsRouter);
app.use('/orders', orderRouter);
app.use('/dashboard', dashboardRouter);
app.use('/visitors', visitorsRouter);
app.use(uploadImageRouter);

// Not Found MW
app.use((req, res, next) => {
  res.status(404).json('Not Found');
});

// Error MW
app.use((error, req, res, next) => {
  const status = error.status || 500;
  res.status(status).json({ Error: error.message || error });
});

// ⚠️ مهم: متعملش app.listen()
// في Vercel انت محتاج تصدر app بس
module.exports = app;
