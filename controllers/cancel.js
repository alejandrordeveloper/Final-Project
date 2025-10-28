const cancel = require('express').Router();

// Ruta para la página de cancelación
cancel.get('/cancel', (req, res) => {
    res.redirect('/');
});

module.exports = cancel;