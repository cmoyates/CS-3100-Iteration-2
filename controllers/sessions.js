const Session = require("../models/session.js")

const create = async (req, res) => {
	const new_session = new Session(parseInt(req.body.id), parseInt(req.body.tutorId), parseInt(req.body.tutoreeId), req.body.location, req.body.time, req.body.date);
	if(new_session.isValid()) {
		let db = req.db;
		try{
			let msg = await new_session.save(db);
			res.send(msg);
		}catch(err){
			res.send('There was an error while saving your Session. (err:'+err+')');
			throw new Error(err);
		}
	} else {
		res.send('client-side: The Session data you entered is invalid')
	}
}

const getOne = async (req, res) => {
	const session_to_get = parseInt(req.params.id);
	let db = req.db;
	try{
		let obj = await Session.getSessionById(db, session_to_get);
		res.send(obj);
	}catch(err){
		res.send('There was an error while retrieving your Session. (err:'+err+')');
		throw new Error(err);
	}	
}

const updateOne = async (req, res) => {
	const session_to_update = req.body
	const session_id = parseInt(req.params.id)
	let db = req.db;
	try{
		let msg = await Session.update(db, session_id, session_to_update.tutorId, session_to_update.tutoreeId, session_to_update.location, session_to_update.time, session_to_update.date);
		res.send(msg);
	}catch(err){
		res.send('There was an error while updating your Session. (err:'+err+')');
		throw new Error(err);
	}	
}

const deleteOne = async (req, res) => {
	const session_id = parseInt(req.params.id);
	let db = req.db;
	try{
		let msg = await Session.delete(db, session_id);
		res.send(msg);	
	}catch(err){
		res.send('There was an error while deleting your Session. (err:'+err+')');
		throw new Error(err);
	}		
}

const all = async (req, res) => {
	let db = req.db;
	try{
		let obj = await Session.getSessions(db);
		console.log('server-side: '+obj.length+' session(s) were returned');
		res.send(obj);
	}catch(err){
		res.send('There was an error while retrieving all Sessions. (err:'+err+')');
		throw new Error(err);
	}
}

const allWithTutor = async (req, res) => {
	const tutor_to_get = parseInt(req.params.tutorId);
	let db = req.db;
	try{
		let obj = await Session.getSessionsByTutor(db, tutor_to_get);
		console.log('server-side: '+obj.length+' session(s) were returned');
		res.send(obj);
	}catch(err){
		res.send('There was an error while retrieving those Sessions. (err:'+err+')');
		throw new Error(err);
	}
}

const allWithTutoree = async (req, res) => {
	const tutoree_to_get = parseInt(req.params.tutoreeId);
	let db = req.db;
	try{
		let obj = await Session.getSessionsByTutoree(db, tutoree_to_get);
		console.log('server-side: '+obj.length+' session(s) were returned');
		res.send(obj);
	}catch(err){
		res.send('There was an error while retrieving those Sessions. (err:'+err+')');
		throw new Error(err);
	}
}

const allWithDate = async (req, res) => {
	const date_to_get = req.params.date;
	let db = req.db;
	try{
		let obj = await Session.getSessionsByDate(db, date_to_get);
		console.log('server-side: '+obj.length+' session(s) were returned');
		res.send(obj);
	}catch(err){
		res.send('There was an error while retrieving those Sessions. (err:'+err+')');
		throw new Error(err);
	}
}

// Make all methods available for use.
module.exports = {
	create,
	getOne,
	updateOne,
	deleteOne,
	all,
	allWithTutor,
	allWithTutoree,
	allWithDate
}
