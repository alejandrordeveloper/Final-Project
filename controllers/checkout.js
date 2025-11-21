const express = require('express');
const checkRouter = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Product = require('../models/product');
const { PAGE_URL } = require('../config');

// Expect body: { items: [{ id: '<productId>', quantity: 2 }, ... ] }
checkRouter.post('/', async (req, res) => {
  let aborted = false;
  const onAbort = ()=>{ aborted = true; console.warn('Client aborted the request (req.aborted)'); };
  req.on && req.on('aborted', onAbort);

  try {
    const items = Array.isArray(req.body && req.body.items) ? req.body.items : [];

    // Simple mode: client sent full product info (name + unit_amount in cents + quantity)
    // NOTE: if client includes product IDs we always prefer the secure lookup mode
    const clientProvidedFull = items.length > 0 && items.every(i => i.name && (typeof i.unit_amount === 'number' || !isNaN(Number(i.unit_amount))) && i.quantity) && items.every(i => !i.id);

    let line_items = [];

    if (clientProvidedFull) {
      // WARNING: this mode trusts client prices — ok for quick testing but not for production
      line_items = items.map(i => ({
        price_data: {
          currency: 'usd',
          product_data: { name: String(i.name) },
          unit_amount: Number(i.unit_amount)
        },
        quantity: Math.max(1, parseInt(i.quantity, 10) || 1)
      }));
    } else {
      // Secure mode: client sends product ids and quantities; lookup in DB
      if (!items || items.length === 0) return res.status(400).json({ error: 'No items provided. Send items as [{id,quantity}] or [{name,unit_amount,quantity}]' });

      const ids = items.map(i => i.id).filter(Boolean);
      const products = await Product.find({ _id: { $in: ids } });
      const prodMap = {};
      products.forEach(p => { prodMap[String(p._id)] = p; });

      for (const it of items) {
        const id = String(it.id);
        const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
        const prod = prodMap[id];
        if (!prod) return res.status(400).json({ error: `Producto no encontrado: ${id}` });

        if (typeof prod.stock === 'number' && prod.stock < qty) {
          return res.status(400).json({ error: `Stock insuficiente para ${prod.name}` });
        }

        if (typeof prod.price !== 'number') return res.status(400).json({ error: `Producto sin precio: ${prod.name}` });

        let images = undefined;
        if (prod.image) {
          try {
            const raw = String(prod.image || '');
            const isDataUrl = /^data:/i.test(raw);
            const isAbsolute = /^(https?:)?\/\//i.test(raw);
            const candidate = isAbsolute ? raw : `${PAGE_URL.replace(/\/$/, '')}${raw.startsWith('/') ? '' : '/'}${raw}`;
            // Stripe restricts image URLs length and doesn't accept data: URIs — skip if too long or data URL
            if (isDataUrl || candidate.length > 2048) {
              console.warn(`Skipping product image for Stripe (data URL or too long) product=${prod.name} len=${candidate.length} dataUrl=${isDataUrl}`);
              images = undefined;
            } else {
              images = [ candidate ];
            }
          } catch(e){ images = undefined }
        }

        line_items.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: prod.name,
              description: prod.description || undefined,
              ...(images ? { images } : {})
            },
            unit_amount: prod.price
          },
          quantity: qty
        });
      }
    }

    const stripeStart = Date.now();
    console.log('Creating Stripe session, line_items count=', line_items.length);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'VE', 'CO'] },
      success_url: `${PAGE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${PAGE_URL}/cancel`,
    });
    const stripeEnd = Date.now();
    console.log(`Stripe session created in ${stripeEnd - stripeStart}ms`);
    if (aborted) {
      console.warn('Not sending response because client disconnected after Stripe returned.');
      return;
    }

    return res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe/create-session error:', error && error.message ? error.message : error);
    if (aborted) {
      console.warn('Client had aborted the request; skipping response.');
      return;
    }
    const status = (error && error.statusCode) ? error.statusCode : 500;
    res.status(status).json({ error: 'Error al crear la sesión de pago' });
  }
  finally {
    req.off && req.off('aborted', onAbort);
  }
});





module.exports = checkRouter;
