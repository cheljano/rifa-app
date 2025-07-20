// ARCHIVO: backend/src/app.js
//======================================================================
const express = require('express');
const cors = require('cors');
const adminRoutes = require('./routes/admin');
const raffleRoutes = require('./routes/raffles');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de la API
app.use('/api/admin', adminRoutes);
app.use('/api/raffles', raffleRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Backend de Rifas funcionando!');
});

module.exports = app;