// ARCHIVO: backend/src/services/pdfService.js
//======================================================================
const PDFDocument = require('pdfkit');

function generatePdfReceipt(ticket) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A5', margin: 50 });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });
        doc.on('error', reject);

        // Contenido del PDF
        doc.fontSize(20).text('Constancia de Reserva de Boleto', { align: 'center' });
        doc.moveDown();

        doc.fontSize(14).text(`Rifa: ${ticket.raffle_name}`);
        doc.fontSize(16).font('Helvetica-Bold').text(`Número Elegido: ${ticket.ticket_number}`, {
            align: 'center'
        });
        doc.moveDown();

        doc.fontSize(12).font('Helvetica').text(`Participante: ${ticket.participant_name} ${ticket.participant_lastname}`);
        doc.text(`Email: ${ticket.participant_email}`);
        doc.text(`Teléfono: ${ticket.participant_phone}`);
        doc.moveDown();

        doc.text(`Fecha de reserva: ${new Date(ticket.reserved_at).toLocaleString()}`);
        doc.text(`Estado: ${ticket.status === 'paid' ? 'Pagado' : 'Reservado'}`);
        doc.moveDown(2);

        doc.fontSize(10).text('Guarda esta constancia. ¡Mucha suerte!', { align: 'center' });

        doc.end();
    });
}

module.exports = { generatePdfReceipt };