const app = require('./app');
const { pool } = require('./models');

const PORT = process.env.PORT || 3000;

const createTables = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS raffles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                start_date TIMESTAMP NOT NULL,
                end_date TIMESTAMP NOT NULL,
                prize_image_url VARCHAR(255),
                total_tickets INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS tickets (
                id SERIAL PRIMARY KEY,
                raffle_id INT REFERENCES raffles(id) ON DELETE CASCADE,
                ticket_number INT NOT NULL,
                participant_name VARCHAR(100) NOT NULL,
                participant_lastname VARCHAR(100) NOT NULL,
                participant_email VARCHAR(100) NOT NULL,
                participant_phone VARCHAR(50) NOT NULL,
                status VARCHAR(20) DEFAULT 'reserved', -- reserved, paid, cancelled
                reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(raffle_id, ticket_number)
            );
        `);
        console.log('Tablas creadas o ya existentes.');
    } catch (err) {
        console.error('Error al crear las tablas', err.stack);
    } finally {
        client.release();
    }
};


app.listen(PORT, async () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  await createTables();
});