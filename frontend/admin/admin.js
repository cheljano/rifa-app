//# ARCHIVO: frontend/admin/admin.js
//#======================================================================
document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://zo8gw8sok484cos0ck4ow8oc.85.31.224.6.sslip.io';
    const createRaffleForm = document.getElementById('create-raffle-form');
    const rafflesSelect = document.getElementById('raffles-select');
    const participantsList = document.getElementById('participants-list');

    // Cargar rifas en el select
    async function loadRafflesForAdmin() {
        try {
            const response = await fetch(`${API_URL}/raffles`); // Usamos el endpoint público para listar
            const raffles = await response.json();
            rafflesSelect.innerHTML = '<option value="">Selecciona una rifa...</option>';
            raffles.forEach(raffle => {
                const option = document.createElement('option');
                option.value = raffle.id;
                option.textContent = raffle.name;
                rafflesSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar rifas:', error);
        }
    }

    // Crear una nueva rifa
    createRaffleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const raffleData = {
            name: document.getElementById('raffle-name').value,
            description: document.getElementById('raffle-description').value,
            start_date: document.getElementById('raffle-start-date').value,
            end_date: document.getElementById('raffle-end-date').value,
            total_tickets: parseInt(document.getElementById('raffle-total-tickets').value),
        };

        try {
            const response = await fetch(`${API_URL}/admin/raffles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(raffleData),
            });
            if (!response.ok) throw new Error('Error al crear la rifa');
            alert('Rifa creada exitosamente');
            createRaffleForm.reset();
            loadRafflesForAdmin();
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    });

    // Cargar participantes cuando se selecciona una rifa
    rafflesSelect.addEventListener('change', async () => {
        const raffleId = rafflesSelect.value;
        if (!raffleId) {
            participantsList.innerHTML = '';
            return;
        }
        try {
            const response = await fetch(`${API_URL}/admin/raffles/${raffleId}/participants`);
            const participants = await response.json();
            participantsList.innerHTML = '';
            participants.forEach(ticket => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>#${ticket.ticket_number} - ${ticket.participant_name} ${ticket.participant_lastname} (${ticket.status})</span>
                    <div>
                        <button class="status-btn" data-ticket-id="${ticket.id}" data-status="paid">Marcar Pagado</button>
                        <button class="cancel-btn" data-ticket-id="${ticket.id}">Anular</button>
                        <button class="receipt-btn" data-ticket-id="${ticket.id}">Imprimir</button>
                    </div>
                `;
                participantsList.appendChild(li);
            });
        } catch (error) {
            console.error('Error al cargar participantes:', error);
        }
    });

    // Manejar acciones de los botones de participante
    participantsList.addEventListener('click', async (e) => {
        const ticketId = e.target.dataset.ticketId;
        if (!ticketId) return;

        // Marcar como pagado
        if (e.target.classList.contains('status-btn')) {
            const status = e.target.dataset.status;
            try {
                await fetch(`${API_URL}/admin/tickets/${ticketId}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status }),
                });
                alert('Estado actualizado');
                rafflesSelect.dispatchEvent(new Event('change')); // Recargar lista
            } catch (error) {
                alert('Error al actualizar estado');
            }
        }

        // Anular boleto
        if (e.target.classList.contains('cancel-btn')) {
            if (confirm('¿Estás seguro de que quieres anular este boleto y liberar el número?')) {
                try {
                    await fetch(`${API_URL}/admin/tickets/${ticketId}`, { method: 'DELETE' });
                    alert('Boleto anulado');
                    rafflesSelect.dispatchEvent(new Event('change')); // Recargar lista
                } catch (error) {
                    alert('Error al anular el boleto');
                }
            }
        }

        // Imprimir constancia
        if (e.target.classList.contains('receipt-btn')) {
            window.open(`${API_URL}/admin/tickets/${ticketId}/receipt`, '_blank');
        }
    });

    loadRafflesForAdmin();
});