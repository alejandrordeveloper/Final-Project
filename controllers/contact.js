const contactRouter = require('express').Router();


// Ruta POST para el formulario
contactRouter.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;

  console.log('Nuevo mensaje recibido:');
  console.log('Nombre:', name);
  console.log('Email:', email);
  console.log('Mensaje:', message);

  // Aquí podrías guardar en MongoDB o enviar un correo
  res.status(200).send('Mensaje recibido. ¡Gracias por contactarnos!');
});

module.exports = contactRouter;