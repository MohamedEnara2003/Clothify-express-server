
const express = require('express');

require('dotenv').config();
const cors = require('cors');

const path = require('path');
const cookieParser = require('cookie-parser');


const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const dashboardRouter = require('./routes/dashboard');
const uploadImageRouter = require('./routes/upload_image');
const stripeRouter = require('./routes/stripe');


const app = express();


const mongoose = require('mongoose');
const port = process.env.PORT || 3000;

const connectToDB =  async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB Atlas');
    app.listen(port , () => {
    console.log(`Server is running on port ${port}`);
    });
    } catch (error) {
    console.error('Failed to connect to MongoDB Atlas:', error);
    }
}
connectToDB();


// Middlewares

// CORS Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Routes
app.use(usersRouter);
app.use('/products',productsRouter);
app.use('/carts',cartsRouter);
app.use('/dashboard',dashboardRouter);
app.use(uploadImageRouter);
app.use(stripeRouter);


// Not Found MW
app.use((req, res, next) =>{
  res.status(404).json('No Found')
});


// Error MW
app.use((error , req , res , next) => {
  const status = error.status || 500;
  res.status(status).json({Error : error});
})


module.exports = app;
