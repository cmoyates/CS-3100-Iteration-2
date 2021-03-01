const Tutoree = require("../models/tutoree.js")

const create = async (req, res) => {
	const new_tutoree = new Tutoree(parseInt(req.body.id), req.body.name, parseInt(req.body.phoneNumber), req.body.email, parseInt(req.body.gradeLevel));
	if(new_tutoree.isValid()) {
		let db = req.db;
		try{
			let msg = await new_tutoree.save(db);
			res.send(msg);
		}catch(err){
			res.send('There was an error while saving your Tutoree. (err:'+err+')');
			throw new Error(err);
		}
	} else {
		res.send('client-side: The Tutoree data you entered is invalid')
	}
}

const getOne = async (req, res) => {
	const tutoree_to_get = parseInt(req.params.id);
	let db = req.db;
	try{
		let obj = await Tutoree.getTutoreeById(db, tutoree_to_get);
		res.send(obj);
	}catch(err){
		res.send('There was an error while retrieving your Tutoree. (err:'+err+')');
		throw new Error(err);
	}	
}
const getOneByEmail = async (req, res) => {
	const tutoree_to_get = parseInt(req.params.email);
	let db = req.db;
	try{
		let obj = await Tutoree.getTutoreeByEmail(db, tutoree_to_get);
		res.send(obj);
	}catch(err){
		res.send('There was an error while retrieving your Tutoree. (err:'+err+')');
		throw new Error(err);
	}	
}

const updateOne = async (req, res) => {
	const tutoree_to_update = req.body
	const tutoree_id = parseInt(req.params.id)
	let db = req.db;
	try{
		let msg = await Tutoree.update(db, tutoree_id, tutoree_to_update.name, tutoree_to_update.phoneNumber, tutoree_to_update.email, tutoree_to_update.gradeLevel);
		res.send(msg);
	}catch(err){
		res.send('There was an error while updating your Tutoree. (err:'+err+')');
		throw new Error(err);
	}	
}

const deleteOne = async (req, res) => {
	const tutoree_id = parseInt(req.params.id);
	let db = req.db;
	try{
		let msg = await Tutoree.delete(db, tutoree_id);
		res.send(msg);	
	}catch(err){
		res.send('There was an error while deleting your Tutoree. (err:'+err+')');
		throw new Error(err);
	}		
}

const all = async (req, res) => {
	let db = req.db;
	try{
		let obj = await Tutoree.getTutorees(db);
		console.log('server-side: '+obj.length+' tutoree(s) were returned');
		res.send(obj);
	}catch(err){
		res.send('There was an error while retrieving all Tutorees. (err:'+err+')');
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
	all
}
