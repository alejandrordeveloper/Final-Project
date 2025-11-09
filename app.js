const express = require('express');
require('dotenv').config();
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bcrypt = require('bcrypt');
const { MONGO_URI } = require('./config');


//Controllers
const contactRouter = require('./controllers/contact');
const checkRouter = require('./controllers/checkout');
const cancel = require('./controllers/cancel');
const adminRouter = require('./controllers/admin');
const auth = require('./controllers/auth');
const successCheckout = require('./controllers/success');
const { log } = require('console');
//const ratesRouter = require('./controllers/rates');
//const logoutRouter = require('./views/admin/logout');



(async() => {
  try{
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB');
  }  catch(error) {
    console.log(error);
  }
})();


//middleware
app.use(cors());
// increase payload limits to allow larger JSON bodies (e.g. base64 images)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

//RUTAS FRONTEND
app.use('/', express.static(path.resolve('views', 'home')));
app.use('/styles', express.static(path.resolve('views', 'styles')));
app.use('/assests', express.static(path.resolve('views', 'assests')));
app.use('/login', express.static(path.resolve('views', 'login')));
app.use('/success', express.static(path.resolve('views', 'success')));
app.use('/home_cart', express.static(path.resolve('views', 'home_cart')));
app.use('/checkout', express.static(path.resolve('views', 'checkout')));
// protect admin static files with requireAdmin middleware
app.use('/admin', auth.requireAdmin, express.static(path.resolve('views', 'admin')));
app.use('/shop_view', express.static(path.resolve('views', 'shop_view')))



//RUTAS BACKEND
app.use('/api/contact', contactRouter);
app.use('/api/checkout', checkRouter);
// endpoint que devuelve detalles de la sesión tras checkout (JSON)
app.use(successCheckout);
// rates proxy (currency conversion) - avoids CORS issues by calling upstream from server
//app.use('/api', ratesRouter);
app.use('/api/admin/products', express.json(), adminRouter);
// auth endpoints
app.use('/api/auth', express.json(), auth.router);
// app.use('/api/checkoutsuccess', successCheckout);
app.get('/cancel', (req, res) => {
  res.redirect('/home_cart');
});
app.get('/admin', auth.requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views/admin'));
});
//app.use('/api/logout', logoutRouter);


module.exports = app;

