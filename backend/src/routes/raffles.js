// ARCHIVO: backend/src/routes/raffles.js
//======================================================================
const express = require('express');
const router = express.Router();
const raffleController = require('../controllers/raffleController');

// Rutas públicas
router.get('/', raffleController.getActiveRaffles);
router.get('/:raffleId', raffleController.getRaffleDetails);
router.post('/:raffleId/enter', raffleController.enterRaffle);
router.get('/tickets/:ticketId/receipt', raffleController.downloadReceipt);

module.exports = router;