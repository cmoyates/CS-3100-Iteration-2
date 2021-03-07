const Validator = require("validatorjs")

async function _get_tutors_collection (db){
    try{
		return await db.collection('tutors');
	}catch(err){
		throw err;
	}    
};

class Tutor {
	constructor(id, firstName, lastName, email, description, phoneNumber, availabilities, subjects, feedback) {
		this.id        		= id
		this.firstName      = firstName
        this.lastName       = lastName
		this.email      	= email
        this.description    = description
        this.phoneNumber    = phoneNumber
        this.availabilities = availabilities
        this.subjects       = subjects
        this.feedback       = feedback
	}
	// This makes sure that all of the data of the tutor is valid
	isValid(){
		const rules = {
			id: 	   	    	'required|integer',
			firstName:          'required|string',
            lastName:           'required|string',
			email:          	'required|string',
            description:        'required|string',
            phoneNumber:        'required|integer',
            availabilities:     'required|array',
            subjects:           'required|array',
            feedback:           'required|numeric'
		}
		const validation = new Validator(this, rules);
		return validation.passes();		
	};
	
	// This function saves the tutor to the database
	async save(db) {
		// Save the data for the current tutor to a variable
		var tutor =  this;
		return new Promise(async function (resolve, reject){
			// Check if the tutors data is valid
			if (tutor.isValid()) {
				// If so, insert the tutor into the database and resolve
				let collection = await _get_tutors_collection(db);
				collection.insertOne(tutor, (err, obj) => {
					if (err) throw err;
					console.log("1 Tutor was inserted into the database");
					resolve("Tutor correctly inserted into the Database");
				});
			}
			// If tutor not valid, reject
			else {
				console.log("The Tutor was not correctly inserted into the database since it is not valid");
				reject("Error: Tutor not inserted into the database");
			}
		});
	};

	// This function updates a tutor in the database with a specified id
	static async update(db, id, firstName, lastName, email, description, phoneNumber, availabilities, subjects, feedback) {
		return new Promise(async function (resolve, reject){
			// Create a tutor variable to store all of the updates data
			var updateTutor = new Tutor(id, firstName, lastName, email, description, phoneNumber, availabilities, subjects, feedback);
			// Check if that tutor is valid
			if (updateTutor.isValid()) {
				// If so, update the data of the tutor at the specified id and resolve
				let collection = await _get_tutors_collection(db);
				let newVals = {$set: {"id": id, "firstName": firstName, "lastName": lastName, "email": email, "description": description, "phoneNumber": phoneNumber, "availabilities": availabilities, "subjects": subjects, "feedback": feedback}};
				collection.updateOne({"id": id}, newVals, (err, obj) => {
					if (err) throw err;
					console.log("1 Tutor correctly updated");
					resolve("Tutor correctly updated");
				});
			}
			// If not, reject
			else {
				console.log("The tutor was not updated");
				reject("The new tutor data was not valid");
			}
		});
	};

	// This function deletes a tutor with a specified id from the database
	static async delete(db, id) {
		var id_delete = id;
		return new Promise(async function (resolve, reject){
			let collection = await _get_tutors_collection(db);
			// Try to delete a tutor with the specified id from the database
			collection.deleteOne({"id": id_delete}, (err, obj) => {
				if (err) throw err;
				// Check if a tutor was found with that id (and therefore deleted)
				if (obj.result.n > 0) {
					// If so, resolve
					console.log("1 Tutor deleted");
					resolve("Tutor deleted");
				}
				// If not, reject
				else {
					reject("Tutor was not found");
				}
			});
		});
	};
	
	// This function returns a tutor with a specified id from the database
	static async getTutorById(db, id) {
		var id_get = id;
		return new Promise(async function (resolve, reject){
			let collection = await _get_tutors_collection(db);
			// Try to find a tutor with the specified id in the database
			collection.findOne({"id": id_get}, (err, obj) => {
				if (err) throw err;
				// If a null was returned (because nothing was found with that id), reject
				if (obj == null) {
					console.log("Tutor was not found");
					reject("There was no tutor with the id " + id_get);
				}
				// If what was returned was not a null, resolve and return the tutor that was found
				else {
					console.log("1 Tutor was sent");
					resolve(obj);
				}
			});
		});
	};

	// This function returns a tutor with a specified email from the database
	static async getTutorByEmail(db, email) {
		var email_get = email;
		return new Promise(async function (resolve, reject){
			let collection = await _get_tutors_collection(db);
			// Try to find a tutor with the specified email in the database
			collection.findOne({"email": email_get}, (err, obj) => {
				if (err) throw err;
				// If a null was returned (because nothing was found with that email), reject
				if (obj == null) {
					console.log("Tutor was not found");
					reject("There was no tutor with the email " + email_get);
				}
				// If what was returned was not a null, resolve and return the tutor that was found
				else {
					console.log("1 Tutor was sent");
					resolve(obj);
				}
			});
		});
	};

	// This function returns all tutors that tutor a specified subject from the database
	static async getTutorsBySubject(db, subject) {
		var subject_get = subject;
		return new Promise(async function (resolve, reject){
			let collection = await _get_tutors_collection(db);
			// Try to find a tutor that tutors the subject in the database
			collection.find({"subjects": subject_get}).toArray((err, items) => {
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

	// This function gets all of the tutors from the database
	static async getTutors(db) {
		return new Promise(async function (resolve, reject){
			let collection = await _get_tutors_collection(db);
			// Try to get all of the tutors in the database
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

	// This function gets all of the tutors from the database in descending order of feedback
	static async getTutorsByFeedback(db) {
		return new Promise(async function (resolve, reject){
			let collection = await _get_tutors_collection(db);
			// Try to get all of the tutors in the database and sort in descending order
			collection.find({}).sort({"feedback": -1}).toArray((err, items) => {
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

module.exports = Tutor
