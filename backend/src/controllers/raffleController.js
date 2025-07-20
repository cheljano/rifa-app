// ARCHIVO: backend/src/controllers/raffleController.js
//======================================================================
const db = require('../models');
const { generatePdfReceipt } = require('../services/pdfService');

// Obtener todas las rifas activas
exports.getActiveRaffles = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM raffles WHERE end_date > NOW() ORDER BY end_date ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las rifas', details: error.message });
    }
};

// Obtener detalles de una rifa específica y sus números ocupados
exports.getRaffleDetails = async (req, res) => {
    const { raffleId } = req.params;
    try {
        const raffleRes = await db.query('SELECT * FROM raffles WHERE id = $1', [raffleId]);
        if (raffleRes.rows.length === 0) {
            return res.status(404).json({ error: 'Rifa no encontrada' });
        }
        const ticketsRes = await db.query('SELECT ticket_number, status FROM tickets WHERE raffle_id = $1', [raffleId]);
        
        const raffle = raffleRes.rows[0];
        const taken_tickets = ticketsRes.rows;

        res.status(200).json({ ...raffle, taken_tickets });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener detalles de la rifa', details: error.message });
    }
};

// Participar en una rifa
exports.enterRaffle = async (req, res) => {
    const { raffleId } = req.params;
    const { ticket_number, name, lastname, email, phone } = req.body;

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        // Verificar si el número ya está tomado
        const existingTicket = await client.query(
            'SELECT * FROM tickets WHERE raffle_id = $1 AND ticket_number = $2',
            [raffleId, ticket_number]
        );

        if (existingTicket.rows.length > 0) {
            return res.status(409).json({ error: `El número ${ticket_number} ya está ocupado.` });
        }

        // Insertar el nuevo boleto
        const result = await client.query(
            'INSERT INTO tickets (raffle_id, ticket_number, participant_name, participant_lastname, participant_email, participant_phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [raffleId, ticket_number, name, lastname, email, phone]
        );
        
        await client.query('COMMIT');
        res.status(201).json(result.rows[0]);

    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: 'Error al registrar la participación', details: error.message });
    } finally {
        client.release();
    }
};

// Descargar constancia de reserva (público)
exports.downloadReceipt = async (req, res) => {
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