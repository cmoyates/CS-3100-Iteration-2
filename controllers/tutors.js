const Tutor = require("../models/tutor.js")

const create = async (req, res) => {
	const new_tutor = new Tutor(parseInt(req.body.id), req.body.firstName, req.body.lastName, req.body.email, req.body.description, req.body.phoneNumber, req.body.availabilities, req.body.subjects, req.body.feedback);
	if(new_tutor.isValid()) {
		let db = req.db;
		try{
			let msg = await new_tutor.save(db);
			res.send(msg);
		}catch(err){
			res.send('There was an error while saving your Tutor. (err:'+err+')');
			throw new Error(err);
		}
	} else {
		res.send('client-side: The Tutor data you entered is invalid')
	}
}

const getOne = async (req, res) => {
	const tutor_to_get = parseInt(req.params.id);
	let db = req.db;
	try{
		let obj = await Tutor.getTutorById(db, tutor_to_get);
		res.send(obj);
	}catch(err){
		res.send('There was an error while retrieving your Tutor. (err:'+err+')');
		throw new Error(err);
	}
}
const getOneByEmail = async (req, res) => {
	const tutor_to_get = parseInt(req.params.email);
	let db = req.db;
	try{
		let obj = await Tutor.getTutorByEmail(db, tutor_to_get);
		res.send(obj);
	}catch(err){
		res.send('There was an error while retrieving your Tutor. (err:'+err+')');
		throw new Error(err);
	}	
}

const updateOne = async (req, res) => {
	const tutor_to_update = req.body;
	const tutor_id = parseInt(req.params.id);
	let db = req.db;
	try{
		let msg = await Tutor.update(db, tutor_id, tutor_to_update.firstName, tutor_to_update.lastName, tutor_to_update.email, tutor_to_update.description, tutor_to_update.phoneNumber, tutor_to_update.availabilities, tutor_to_update.subjects, tutor_to_update.feedback);
		res.send(msg);
	}catch(err){
		res.send('There was an error while updating your Tutor. (err:'+err+')');
		throw new Error(err);
	}	
}

const deleteOne = async (req, res) => {
	const tutor_id = parseInt(req.params.id);
	let db = req.db;
	try{
		let msg = await Tutor.delete(db, tutor_id);
		res.send(msg);	
	}catch(err){
		res.send('There was an error while deleting your Tutor. (err:'+err+')');
		throw new Error(err);
	}		
}

const getAllBySubject = async (req, res) => {
    const subject = req.params.subject;
    let db = req.db;
    try{
        let obj = await Tutor.getTutorsBySubject(db, subject);
        console.log('server-side: '+obj.length+' tutors(s) were returned');
        res.send(obj);
    }
    catch(err){
        res.send('There was an error while retrieving Tutors. (err:'+err+')');
        throw new Error(err);
    }
}

const getAllOrderedFeedback = async(req, res) => {
    let db = req.db;
    try{
        let obj = await Tutor.getTutorsByFeedback(db);
        console.log('server-side: '+obj.length+' tutors(s) were returned');
        res.send(obj);
    }
    catch(err){
        res.send('There was an error while retrieving Tutors. (err:'+err+')');
        throw new Error(err)
    }
}

const all = async (req, res) => {
	let db = req.db;
	try{
		let obj = await Tutor.getTutors(db);
		console.log('server-side: '+obj.length+' admin(s) were returned');
		res.send(obj);
	}catch(err){
		res.send('There was an error while retrieving all Admins. (err:'+err+')');
		throw new Error(err);
	}	
}

// Make all methods available for use.
module.exports = {
	create,
	getOne,
	getOneByEmail,
	updateOne,
	deleteOne,
    getAllBySubject,
    getAllOrderedFeedback,
	all
}