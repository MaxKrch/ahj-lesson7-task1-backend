const { addTicket, readTicketsList, readTicketFull, updateTicketFull, deleteTicket } = require('./CRUDfunc.js');

const processingQuery = async (queryString, body) => {
	const queryArray = queryString.split('&');
	const reqArray = queryArray[0].split('=');
	const req = reqArray[1];
	let id = null;

	if(queryArray[1]) {
		const reqArray = queryArray[1].split('=');
		id = reqArray[1];
	}
	
	const resp = {
		success: false,
		data: null
	}

	switch (req) {
		case 'allTickets':
			resp.data = await gettingTicketList();
			resp.success = true;
			break;

		case 'createTicket':
			if(resp.data = await createTicket(body)) {
				resp.success = true;
			}
			break;

		case 'updateTicket':
			if(resp.data = await updateTicket(body)) {
				resp.success = true;
			}
			break;

		case 'ticketById':
			if(resp.data = await gettingTicketFull(id)) {
				resp.success = true;
			}
			break;

		case 'deleteTicket':
			if(await removeTicket(id)) {
				resp.success = true;
			}
			break;

		default:
			resp.data = "Что-то пошло не так";
			break;
	}

	return resp;
}

const createTicket = async (ticket) => {
	if(!ticket.short) {
		return;
	}
	ticket.created = Date.now();
	const newTicket = await addTicket(ticket);

	return newTicket;
}

const gettingTicketList = async () => {
	const ticketList = await readTicketsList();

	return ticketList;
}

const gettingTicketFull = async (id) => {
	const ticketFull = await readTicketFull(Number(id));

	return ticketFull;
}

const updateTicket = async (ticket) => {
	const updTicket = await updateTicketFull(ticket) 

	return updTicket;
}

const removeTicket = async (id) => {	
	const chek = await deleteTicket(Number(id));
	if(!chek) {
		return false;
	} 
			
	return true;
}

module.exports = { processingQuery }