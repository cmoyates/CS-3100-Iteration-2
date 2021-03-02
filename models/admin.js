const Validator = require("validatorjs")

async function _get_admins_collection (db){
    try{
		return await db.collection('admins');
	}catch(err){
		throw err;
	}    
};

class Admin {
	constructor(id, firstName, lastName, email) {
		this.id        		= id
		this.firstName      = firstName
		this.lastName		= lastName
		this.email      	= email
	}
	// This makes sure that all of the data of the admin is valid
	isValid(){
		const rules = {
			id: 	   		'required|integer',
			firstName:      'required|string',
			lastName:		'required|string',
			email:      	'required|string'
		}
		const validation = new Validator(this, rules);
		return validation.passes();		
	};
	
	// This function saves the admin to the database
	async save(db) {
		// Save the data for the current admin to a variable
		var admin =  this;
		return new Promise(async function (resolve, reject){
			// Check if the admins data is valid
			if (admin.isValid()) {
				// If so, insert the admin into the database and resolve
				let collection = await _get_admins_collection(db);
				collection.insertOne(admin, (err, obj) => {
					if (err) throw err;
					console.log("1 Admin was inserted into the database");
					resolve("Admin correctly inserted into the Database");
				});
			}
			// If admin not valid, reject
			else {
				console.log("The Admin was not correctly inserted into the database since it is not valid");
				reject("Error: Admin not inserted into the database");
			}
		});
	};

	// This function updates a admin in the database with a specified id
	static async update(db, id, firstName, lastName, email) {
		return new Promise(async function (resolve, reject){
			// Create a admin variable to store all of the updates data
			var updateAdmin = new Admin(id, firstName, lastName, email);
			// Check if that admin is valid
			if (updateAdmin.isValid()) {
				// If so, update the data of the admin at the specified id and resolve
				let collection = await _get_admins_collection(db);
				let newVals = {$set: {"id": id, "firstName": firstName, "lastName": lastName, "email": email}};
				collection.updateOne({"id": id}, newVals, (err, obj) => {
					if (err) throw err;
					console.log("1 Admin correctly updated");
					resolve("Admin correctly updated");
				});
			}
			// If not, reject
			else {
				console.log("The admin was not updated");
				reject("The new admin data was not valid");
			}
		});
	};

	// This function deletes a admin with a specified id from the database
	static async delete(db, id) {
		var id_delete = id;
		return new Promise(async function (resolve, reject){
			let collection = await _get_admins_collection(db);
			// Try to delete a admin with the specified id from the database
			collection.deleteOne({"id": id_delete}, (err, obj) => {
				if (err) throw err;
				// Check if a admin was found with that id (and therefore deleted)
				if (obj.result.n > 0) {
					// If so, resolve
					console.log("1 Admin deleted");
					resolve("Admin deleted");
				}
				// If not, reject
				else {
					reject("Admin was not found");
				}
			});
		});
	};
	
	// This function returns a admin with a specified id from the database
	static async getAdminById(db, id) {
		var id_get = id;
		return new Promise(async function (resolve, reject){
			let collection = await _get_admins_collection(db);
			// Try to find a admin with the specified id in the database
			collection.findOne({"id": id_get}, (err, obj) => {
				if (err) throw err;
				// If a null was returned (because nothing was found with that id), reject
				if (obj == null) {
					console.log("Admin was not found");
					reject("There was no admin with the id " + id_get);
				}
				// If what was returned was not a null, resolve and return the admin that was found
				else {
					console.log("1 Admin was sent");
					resolve(obj);
				}
			});
		});
	};

	// This function returns a admin with a specified email from the database
	static async getAdminByEmail(db, email) {
		var email_get = email;
		return new Promise(async function (resolve, reject){
			let collection = await _get_admins_collection(db);
			// Try to find a admin with the specified email in the database
			collection.findOne({"email": email_get}, (err, obj) => {
				if (err) throw err;
				// If a null was returned (because nothing was found with that email), reject
				if (obj == null) {
					console.log("Admin was not found");
					reject("There was no admin with the email " + email_get);
				}
				// If what was returned was not a null, resolve and return the admin that was found
				else {
					console.log("1 Admin was sent");
					resolve(obj);
				}
			});
		});
	};

	// This function gets all of the admins from the database
	static async getAdmins(db) {
		return new Promise(async function (resolve, reject){
			let collection = await _get_admins_collection(db);
			// Try to get all of the admins in the database
			collection.find({}).toArray((err, items) => {
				if (err) throw err;
				// Check if more any items were found (more than 0)
				if (items.length > 0) {
					// If so, resolve and return everything
					console.log(items.length + " item(s) sent");
					resolve(items);
				}
				// If not, reject
				else {
					console.log("Database is empty, no items sent");
					reject("Database is empty");
				}
			})
		});
	};
	
}

module.exports = Admin
