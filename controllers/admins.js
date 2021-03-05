const Admin = require("../models/admin.js")

const create = async (req, res) => {
	const new_admin = new Admin(parseInt(req.body.id), req.body.firstName, req.body.lastName, req.body.email);
	if(new_admin.isValid()) {
		let db = req.db;
		try{
			let msg = await new_admin.save(db);
			res.send(msg);
		}catch(err){
			res.send('There was an error while saving your Admin. (err:'+err+')');
			throw new Error(err);
		}
	} else {
		res.send('client-side: The Admin data you entered is invalid')
	}
}

const getOne = async (req, res) => {
	const admin_to_get = parseInt(req.params.id);
	let db = req.db;
	try{
		let obj = await Admin.getAdminById(db, admin_to_get);
		res.send(obj);
	}catch(err){
		res.send('There was an error while retrieving your Admin. (err:'+err+')');
		throw new Error(err);
	}	
}
const getOneByEmail = async (req, res) => {
	const admin_to_get = req.params.email;
	let db = req.db;
	try{
		let obj = await Admin.getAdminByEmail(db, admin_to_get);
		res.send(obj);
	}catch(err){
		res.send('There was an error while retrieving your Admin. (err:'+err+')');
		throw new Error(err);
	}	
}

const updateOne = async (req, res) => {
	const admin_to_update = req.body
	const admin_id = parseInt(req.params.id)
	let db = req.db;
	try{
		let msg = await Admin.update(db, admin_id, admin_to_update.firstName, admin_to_update.lastName, admin_to_update.email);
		res.send(msg);
	}catch(err){
		res.send('There was an error while updating your Admin. (err:'+err+')');
		throw new Error(err);
	}	
}

const deleteOne = async (req, res) => {
	const admin_id = parseInt(req.params.id);
	let db = req.db;
	try{
		let msg = await Admin.delete(db, admin_id);
		res.send(msg);	
	}catch(err){
		res.send('There was an error while deleting your Admin. (err:'+err+')');
		throw new Error(err);
	}		
}

const all = async (req, res) => {
	let db = req.db;
	try{
		let obj = await Admin.getAdmins(db);
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
	all
}
