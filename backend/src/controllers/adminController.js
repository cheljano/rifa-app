// ARCHIVO: backend/src/controllers/adminController.js
//======================================================================
const db = require('../models');
const { generatePdfReceipt } = require('../services/pdfService');

// Crear una nueva rifa
exports.createRaffle = async (req, res) => {
    const { name, description, start_date, end_date, total_tickets, prize_image_url } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO raffles (name, description, start_date, end_date, total_tickets, prize_image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, description, start_date, end_date, total_tickets, prize_image_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la rifa', details: error.message });
    }
};

// Actualizar estado de un boleto
exports.updateTicketStatus = async (req, res) => {
    const { ticketId } = req.params;
    const { status } = req.body; // 'paid', 'cancelled'
    try {
        const result = await db.query(
            'UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *',
            [status, ticketId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Boleto no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el boleto', details: error.message });
    }
};

// Liberar un número (anular/cancelar)
exports.cancelTicket = async (req, res) => {
    const { ticketId } = req.params;
    try {
        const result = await db.query('DELETE FROM tickets WHERE id = $1 RETURNING *', [ticketId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Boleto no encontrado para anular' });
        }
        res.status(200).json({ message: 'Boleto anulado y número liberado', ticket: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Error al anular el boleto', details: error.message });
    }
};

// Obtener todos los participantes de una rifa
exports.getRaffleParticipants = async (req, res) => {
    const { raffleId } = req.params;
    try {
        const result = await db.query('SELECT * FROM tickets WHERE raffle_id = $1 ORDER BY ticket_number', [raffleId]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los participantes', details: error.message });
    }
};

// Descargar constancia de reserva (para admin)
exports.downloadAdminReceipt = async (req, res) => {
    const { ticketId } = req.params;
    try {
        const ticketResult = await db.query('SELECT t.*, r.name as raffle_name FROM tickets t JOIN raffles r ON t.raffle_id = r.id WHERE t.id = $1', [ticketId]);
        if (ticketResult.rows.length === 0) {
            return res.status(404).json({ error: 'Boleto no encontrado' });
        }
        const ticket = ticketResult.rows[0];
        const pdfBuffer = await generatePdfReceipt(ticket);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=constancia_${ticket.raffle_name}_${ticket.ticket_number}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        res.status(500).json({ error: 'Error al generar el PDF', details: error.message });
    }
};