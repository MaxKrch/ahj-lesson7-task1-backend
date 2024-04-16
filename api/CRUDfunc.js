const fs = require('fs/promises');

const readAllTickets = async () => {
	const ticketsJSON = await fs.readFile('./db/tickets.json', 'utf8');
	const ticketsAll = ticketsJSON ? JSON.parse(ticketsJSON) : {
		nextId: 0,
		tickets: [],
		ticketsFull: []
	}
	return ticketsAll;
}

const findTicketById = (tickets, id) => {
	const ticketFull = tickets.find(item => item.id === id);
	return ticketFull;
}

const writeAllTickets = async (tickets) => {
	try {
		const data = JSON.stringify(tickets);
		await fs.writeFile('./db/tickets.json', data);
	} catch(err) {
		return "База данных временно недоступна";
	}

}

const addTicket = async (ticket) => {

	const ticketsAll = await readAllTickets();
	const id = ticketsAll.nextId;
	
	const newTicket = {
		id,
		short: ticket.short,
		status: false,
		created: ticket.created
	}
	const newTicketFull = {
		id,
		description: ticket.description
	}

	ticketsAll.tickets.unshift(newTicket)
	ticketsAll.ticketsFull.unshift(newTicketFull)
	ticketsAll.nextId += 1;
	await writeAllTickets(ticketsAll);

	return newTicket;
}

const readTicketsList = async () => {
	const ticketsAll = await readAllTickets();
	const ticketsList = ticketsAll.tickets;

	return ticketsList;
}

const readTicketFull = async (id) => {
	const ticketsAll = await readAllTickets();
	const ticketFull = findTicketById(ticketsAll.ticketsFull, id);

	if(!ticketFull) {
		return;
	}

	return ticketFull;
}

const updateTicketFull = async (ticket) => {
	const ticketsAll = await readAllTickets();
	const updatableTicket = findTicketById(ticketsAll.tickets, Number(ticket.id));
	const updatableTicketFull = findTicketById(ticketsAll.ticketsFull, Number(ticket.id));

	if(!updatableTicket || !updatableTicketFull) {
		return;
	}
	
	const status = ticket.status === 'true' ? true : false;
	
	updatableTicket.short = ticket.short;
	updatableTicket.status = status;
	updatableTicketFull.description = ticket.description;
	await writeAllTickets(ticketsAll);

	return updatableTicket;
}


const deleteTicket = async (id) => {
	const ticketsAll = await readAllTickets();
	if(!deleteTicketById(ticketsAll.tickets, id)) {
		return false;
	}
	if(!deleteTicketById(ticketsAll.ticketsFull, id)) {
		return false;
	}
	await writeAllTickets(ticketsAll);

	return true;
}

const deleteTicketById = (tickets, id) => {
	const index = tickets.findIndex(item => Number(item.id) === Number(id));
	
	if(index < 0) {
		return false;
	}

	tickets.splice(index, 1);
	return true;
}

module.exports = { addTicket, readTicketsList, readTicketFull, updateTicketFull, deleteTicket }
