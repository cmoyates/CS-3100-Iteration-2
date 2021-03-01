const Validator = require("validatorjs")

async function _get_tutorees_collection (db){
    try{
		return await db.collection('tutorees');
	}catch(err){
		throw err;
	}    
};

class Tutoree {
	constructor(id, name, phoneNumber, email, gradeLevel) {
		this.id        		= id
		this.name      		= name
		this.phoneNumber   	= phoneNumber
		this.email      	= email
		this.gradeLevel 	= gradeLevel
	}
	// This makes sure that all of the data of the tutoree is valid
	isValid(){
		const rules = {
			id: 	   		'required|integer',
			name:      		'required|string',
			phoneNumber:   	'required|integer',
			email:      	'required|string',
			gradeLevel: 	'required|integer',
		}
		const validation = new Validator(this, rules);
		return validation.passes();		
	};
	
	// This function saves the tutoree to the database
	async save(db) {
		// Save the data for the current tutoree to a variable
		var tutoree =  this;
		return new Promise(async function (resolve, reject){
			// Check if the tutorees data is valid
			if (tutoree.isValid()) {
				// If so, insert the tutoree into the database and resolve
				let collection = await _get_tutorees_collection(db);
				collection.insertOne(tutoree, (err, obj) => {
					if (err) throw err;
					console.log("1 Tutoree was inserted into the database");
					resolve("Tutoree correctly inserted into the Database");
				});
			}
			// If tutoree not valid, reject
			else {
				console.log("The Tutoree was not correctly inserted into the database since it is not valid");
				reject("Error: Tutoree not inserted into the database");
			}
		});
	};

	// This function updates a tutoree in the database with a specified id
	static async update(db, id, name, phoneNumber, email, gradeLevel) {
		return new Promise(async function (resolve, reject){
			// Create a tutoree variable to store all of the updates data
			var updateTutoree = new Tutoree(id, name, phoneNumber, email, gradeLevel);
			// Check if that tutoree is valid
			if (updateTutoree.isValid()) {
				// If so, update the data of the tutoree at the specified id and resolve
				let collection = await _get_tutorees_collection(db);
				let newVals = {$set: {"id": id, "name": name, "phoneNumber": phoneNumber, "email": email, "gradeLevel": gradeLevel}};
				collection.updateOne({"id": id}, newVals, (err, obj) => {
					if (err) throw err;
					console.log("1 Tutoree correctly updated");
					resolve("Tutoree correctly updated");
				});
			}
			// If not, reject
			else {
				console.log("The tutoree was not updated");
				reject("The new tutoree data was not valid");
			}
		});
	};

	// This function deletes a tutoree with a specified id from the database
	static async delete(db, id) {
		var id_delete = id;
		return new Promise(async function (resolve, reject){
			let collection = await _get_tutorees_collection(db);
			// Try to delete a tutoree with the specified id from the database
			collection.deleteOne({"id": id_delete}, (err, obj) => {
				if (err) throw err;
				// Check if a tutoree was found with that id (and therefore deleted)
				if (obj.result.n > 0) {
					// If so, resolve
					console.log("1 Tutoree deleted");
					resolve("Tutoree deleted");
				}
				// If not, reject
				else {
					reject("Tutoree was not found");
				}
			});
		});
	};
	
	// This function returns a tutoree with a specified id from the database
	static async getTutoreeById(db, id) {
		var id_get = id;
		return new Promise(async function (resolve, reject){
			let collection = await _get_tutorees_collection(db);
			// Try to find a tutoree with the specified id in the database
			collection.findOne({"id": id_get}, (err, obj) => {
				if (err) throw err;
				// If a null was returned (because nothing was found with that id), reject
				if (obj == null) {
					console.log("Tutoree was not found");
					reject("There was no tutoree with the id " + id_get);
				}
				// If what was returned was not a null, resolve and return the tutoree that was found
				else {
					console.log("1 Tutoree was sent");
					resolve(obj);
				}
			});
		});
	};

	// This function returns a tutoree with a specified email from the database
	static async getTutoreeByEmail(db, email) {
		var email_get = email;
		return new Promise(async function (resolve, reject){
			let collection = await _get_tutorees_collection(db);
			// Try to find a tutoree with the specified email in the database
			collection.findOne({"email": email_get}, (err, obj) => {
				if (err) throw err;
				// If a null was returned (because nothing was found with that email), reject
				if (obj == null) {
					console.log("Tutoree was not found");
					reject("There was no tutoree with the email " + email_get);
				}
				// If what was returned was not a null, resolve and return the tutoree that was found
				else {
					console.log("1 Tutoree was sent");
					resolve(obj);
				}
			});
		});
	};

	// This function gets all of the tutorees from the database
	static async getTutorees(db) {
		return new Promise(async function (resolve, reject){
			let collection = await _get_tutorees_collection(db);
			// Try to get all of the tutorees in the database
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

module.exports = Tutoree
