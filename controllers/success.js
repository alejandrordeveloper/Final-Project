const successCheckout = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Ruta para la página de éxito
successCheckout.get('/api/checkoutsuccess', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
        const lineItems = await stripe.checkout.sessions.listLineItems(req.query.session_id);

        res.render('success', {
            session_id: session.id,
            totalAmount: session.amount_total,
            customer_email: session.customer_details.email,
            items: lineItems.data.map(item => ({
                description: item.description,
                quantity: item.quantity,
                amount_total: item.amount_total
            }))
        });
    } catch (error) {
        console.error('Error al obtener detalles de la sesión:', error);
        res.status(500).send('No se pudo cargar la página de éxito');
    }
});

module.exports = successCheckout;

//ACA SE GUARDA LA INFO EN LA BASE DE DATOS