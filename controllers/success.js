const successCheckout = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// API para obtener detalles de la sesión de checkout (devuelve JSON)
successCheckout.get('/api/checkoutsuccess', async (req, res) => {
    const sessionId = req.query.session_id;
    if (!sessionId) return res.status(400).json({ error: 'Falta session_id en la query' });

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);

        const payload = {
            session_id: session.id,
            totalAmount: session.amount_total || 0,
            customer_email: session.customer_details ? session.customer_details.email : null,
            items: lineItems.data.map(item => ({
                description: item.description,
                quantity: item.quantity,
                amount_total: item.amount_total
            }))
        };

        // Por ahora devolvemos JSON para que la página estática lo consuma vía fetch
        res.json(payload);
    } catch (error) {
        console.error('Error al obtener detalles de la sesión:', error);
        res.status(500).json({ error: 'No se pudo obtener la sesión de Stripe' });
    }
});

module.exports = successCheckout;

//ACA SE GUARDA LA INFO EN LA BASE DE DATOS