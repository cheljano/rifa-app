// ARCHIVO: backend/src/routes/admin.js
//======================================================================
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Rutas de administración
router.post('/raffles', adminController.createRaffle);
router.get('/raffles/:raffleId/participants', adminController.getRaffleParticipants);
router.patch('/tickets/:ticketId/status', adminController.updateTicketStatus);
router.delete('/tickets/:ticketId', adminController.cancelTicket);
router.get('/tickets/:ticketId/receipt', adminController.downloadAdminReceipt);

module.exports = router;