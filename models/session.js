const Validator = require("validatorjs")

async function _get_sessions_collection (db){
    try{
		return await db.collection('sessions');
	}catch(err){
		throw err;
	}    
};

class Session {
	constructor(id, tutorId, tutoreeId, location, time, date) {
		this.id        		= id
		this.tutorId      	= tutorId
		this.tutoreeId   	= tutoreeId
		this.location      	= location
		this.time 			= time
		this.date 			= date
	}
	// This makes sure that all of the data of the session is valid
	isValid(){
		const rules = {
			id: 	   		'required|integer',
			tutorId:      	'required|integer',
			tutoreeId:   	'required|integer',
			location:      	'required|string',
			time: 			'required|string',
			date: 			'required|string',
		}
		const validation = new Validator(this, rules);
		return validation.passes();		
	};
	
	// This function saves the session to the database
	async save(db) {
		// Save the data for the current session to a variable
		var session =  this;
		return new Promise(async function (resolve, reject){
			// Check if the sessions data is valid
			if (session.isValid()) {
				// If so, insert the session into the database and resolve
				let collection = await _get_sessions_collection(db);
				collection.insertOne(session, (err, obj) => {
					if (err) throw err;
					console.log("1 Session was inserted into the database");
					resolve("Session correctly inserted into the Database");
				});
			}
			// If session not valid, reject
			else {
				console.log("The Session was not correctly inserted into the database since it is not valid");
				reject("Error: Session not inserted into the database");
			}
		});
	};

	// This function updates a session in the database with a specified id
	static async update(db, id, tutorId, tutoreeId, location, time, date) {
		return new Promise(async function (resolve, reject){
			// Create a session variable to store all of the updates data
			var updateSession = new Session(id, name, tutoreeId, location, time, date);
			// Check if that session is valid
			if (updateSession.isValid()) {
				// If so, update the data of the session at the specified id and resolve
				let collection = await _get_sessions_collection(db);
				let newVals = {$set: {"id": id, "tutorId": tutorId, "tutoreeId": tutoreeId, "location": location, "time": time, "date": date}};
				collection.updateOne({"id": id}, newVals, (err, obj) => {
					if (err) throw err;
					console.log("1 Session correctly updated");
					resolve("Session correctly updated");
				});
			}
			// If not, reject
			else {
				console.log("The session was not updated");
				reject("The new session data was not valid");
			}
		});
	};

	// This function deletes a session with a specified id from the database
	static async delete(db, id) {
		var id_delete = id;
		return new Promise(async function (resolve, reject){
			let collection = await _get_sessions_collection(db);
			// Try to delete a session with the specified id from the database
			collection.deleteOne({"id": id_delete}, (err, obj) => {
				if (err) throw err;
				// Check if a session was found with that id (and therefore deleted)
				if (obj.result.n > 0) {
					// If so, resolve
					console.log("1 Session deleted");
					resolve("Session deleted");
				}
				// If not, reject
				else {
					reject("Session was not found");
				}
			});
		});
	};
	
	// This function returns a session with a specified id from the database
	static async getSessionById(db, id) {
		var id_get = id;
		return new Promise(async function (resolve, reject){
			let collection = await _get_sessions_collection(db);
			// Try to find a session with the specified id in the database
			collection.findOne({"id": id_get}, (err, obj) => {
				if (err) throw err;
				// If a null was returned (because nothing was found with that id), reject
				if (obj == null) {
					console.log("Session was not found");
					reject("There was no session with the id " + id_get);
				}
				// If what was returned was not a null, resolve and return the session that was found
				else {
					console.log("1 Session was sent");
					resolve(obj);
				}
			});
		});
	};

	// This function gets all of the sessions from the database
	static async getSessions(db) {
		return new Promise(async function (resolve, reject){
			let collection = await _get_sessions_collection(db);
			// Try to get all of the sessions in the database
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
	
	// This function gets all of the sessions from the database involving a specific tutor
	static async getSessionsByTutor(db, tutorId) {
		var tutorId_get = tutorId;
		return new Promise(async function (resolve, reject){
			let collection = await _get_sessions_collection(db);
			// Try to get all of the sessions involving the specified tutor in the database
			collection.find({"tutorId": tutorId_get}).toArray((err, items) => {
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

	// This function gets all of the sessions from the database involving a specific tutoree
	static async getSessionsByTutoree(db, tutoreeId) {
		var tutoreeId_get = tutoreeId;
		return new Promise(async function (resolve, reject){
			let collection = await _get_sessions_collection(db);
			// Try to get all of the sessions involving the specified tutoree in the database
			collection.find({"tutoreeId": tutoreeId_get}).toArray((err, items) => {
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

module.exports = Session
