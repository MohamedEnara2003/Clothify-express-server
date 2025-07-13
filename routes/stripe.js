
const express = require('express');
const router = express.Router();

const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res , next) =>  {
    try {
    const products = req.body.products;

    if(products.length === 0) {
    return res.status(400).json({ error: 'No products provided' });
    }

    const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: products.map(item => ({
        price_data: {
        currency: 'usd',
        product_data: {
        name: item.name,
        },
        unit_amount: item.price * 100, // Convert to cents
        },
        quantity: item.quantity,
    })),
    success_url: 'http://localhost:4200/success',
    cancel_url: 'http://localhost:4200/cancel',
    });

    res.json({ url: session.url });
    
    } catch (error) {
    next(error);
    }
})


module.exports = router; 