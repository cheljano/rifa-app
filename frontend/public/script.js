//# ARCHIVO: frontend/public/script.js
//#======================================================================
document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://x0sogc808s0ks80g8w804c4c.85.31.224.6.sslip.io:8081'; // Cambiar en producción a la URL del backend
    const rafflesContainer = document.getElementById('raffles-container');
    const modal = document.getElementById('raffle-modal');
    const modalRaffleName = document.getElementById('modal-raffle-name');
    const ticketsGrid = document.getElementById('tickets-grid');
    const entryForm = document.getElementById('entry-form');
    const selectedNumberInput = document.getElementById('selected-number');
    const closeButton = document.querySelector('.close-button');

    let currentRaffleId = null;
    let selectedTicket = null;

    // Cargar rifas al iniciar
    async function loadRaffles() {
        try {
            const response = await fetch(`${API_URL}/raffles`);
            const raffles = await response.json();
            rafflesContainer.innerHTML = '';
            raffles.forEach(raffle => {
                const card = document.createElement('div');
                card.className = 'raffle-card';
                card.innerHTML = `
                    <h3>${raffle.name}</h3>
                    <p>${raffle.description || ''}</p>
                    <p><strong>Finaliza:</strong> ${new Date(raffle.end_date).toLocaleDateString()}</p>
                `;
                card.dataset.raffleId = raffle.id;
                rafflesContainer.appendChild(card);
            });
        } catch (error) {
            console.error('Error al cargar rifas:', error);
            rafflesContainer.innerHTML = '<p>No se pudieron cargar las rifas. Intenta más tarde.</p>';
        }
    }

    // Abrir modal y mostrar números
    rafflesContainer.addEventListener('click', async (e) => {
        const card = e.target.closest('.raffle-card');
        if (card) {
            currentRaffleId = card.dataset.raffleId;
            try {
                const response = await fetch(`${API_URL}/raffles/${currentRaffleId}`);
                const raffle = await response.json();
                modalRaffleName.textContent = raffle.name;
                
                ticketsGrid.innerHTML = '';
                const takenNumbers = new Map(raffle.taken_tickets.map(t => [t.ticket_number, t.status]));
                
                for (let i = 1; i <= raffle.total_tickets; i++) {
                    const ticketDiv = document.createElement('div');
                    ticketDiv.className = 'ticket-number';
                    ticketDiv.textContent = i;
                    ticketDiv.dataset.number = i;
                    
                    if (takenNumbers.has(i)) {
                        ticketDiv.classList.add(takenNumbers.get(i)); // 'reserved' o 'paid'
                    } else {
                        ticketDiv.classList.add('available');
                    }
                    ticketsGrid.appendChild(ticketDiv);
                }
                
                modal.style.display = 'block';
            } catch (error) {
                console.error('Error al cargar detalles de la rifa:', error);
            }
        }
    });

    // Seleccionar un número
    ticketsGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('available')) {
            if (selectedTicket) {
                selectedTicket.classList.remove('selected');
            }
            selectedTicket = e.target;
            selectedTicket.classList.add('selected');
            selectedNumberInput.value = `Número seleccionado: ${selectedTicket.dataset.number}`;
            entryForm.classList.remove('hidden');
        }
    });

    // Enviar formulario de participación
    entryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!selectedTicket) {
            alert('Por favor, selecciona un número.');
            return;
        }

        const participantData = {
            ticket_number: parseInt(selectedTicket.dataset.number),
            name: document.getElementById('participant-name').value,
            lastname: document.getElementById('participant-lastname').value,
            email: document.getElementById('participant-email').value,
            phone: document.getElementById('participant-phone').value,
        };

        try {
            const response = await fetch(`${API_URL}/raffles/${currentRaffleId}/enter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(participantData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error en el servidor');
            }

            const newTicket = await response.json();
            alert(`¡Felicidades! Has reservado el número ${newTicket.ticket_number}.`);
            
            // Descargar constancia
            window.open(`${API_URL}/raffles/tickets/${newTicket.id}/receipt`, '_blank');

            closeModal();
            loadRaffles(); // Recargar para reflejar cambios
        } catch (error) {
            console.error('Error al participar:', error);
            alert(`No se pudo reservar el número. ${error.message}`);
        }
    });

    // Cerrar modal
    function closeModal() {
        modal.style.display = 'none';
        entryForm.classList.add('hidden');
        entryForm.reset();
        selectedTicket = null;
        currentRaffleId = null;
    }
    closeButton.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            closeModal();
        }
    });

    loadRaffles();
});