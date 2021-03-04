var assert = require('assert');
const Tutoree = require('../models/tutoree');
const Tutor = require('../models/tutor');
const Admin = require('../models/admin');
const Session = require('../models/session');
const request = require('request');
const mongo = require('../utils/db');
const { getMaxListeners } = require('process');

var db;
// This method runs once and connects to the mongoDB
before(async function() {
	try {
		db = await mongo.connectToDB();
	}catch(err){
		throw err;
	}
});
// this method will close your connection to MongoDB after the tests
after(async function() {
    try{
        mongo.closeDBConnection();
    }catch(err){
        throw err;
    }
	
});

// Create a variable to store the url that the requests will be made to later
var myUrl = "http://localhost:3000";


// The Tests
describe('Testing the Tutoring API', async function(){
    describe('Testing the Tutoree Model - Simple cases', function(){
        it('Fail 1 - Test an invalid Tutoree id', async function(){
            // "The number 3" is not a number and therefore not a valid id
            assert.strictEqual(new Tutoree("The number 3", "Dave", "Karlson", 18005551232, "dkson@notreal.com", 12).isValid(), false);
        });
        it('Fail 2 - Test an invalid Tutoree first name', function(){
            // The number 42 is not a string and therefore not a valid first name
            assert.strictEqual(new Tutoree(3, 42, "Karlson", 18005551232, "dkson@notreal.com", 12).isValid(), false);
        });
        it('Fail 3 - Test an invalid Tutoree last name', function(){
            // The number 43 is not a string and therefore not a valid last name
            assert.strictEqual(new Tutoree(3, "Dave", 43, 18005551232, "dkson@notreal.com", 12).isValid(), false);
        });
        it('Fail 4 - Test an invalid Tutoree phone number', function(){
            // "Cabbage" true is not a string and is therefore not a valid author
            assert.strictEqual(new Tutoree(3, "Dave", "Karlson", "Cabbage", "dkson@notreal.com", 12).isValid(), false);
        });
        it('Fail 5 - Test Invalid Tutoree email', function(){
            // The boolean false is not a string and therefore not a valid email
            assert.strictEqual(new Tutoree("The number 3", "Dave", "Karlson", 18005551232, false, 12).isValid(), false);
        });
        it('Fail 6 - Test Invalid Tutoree grade level', function(){
            // The string "Blue" is not a number and therefore not a valid grade level
            assert.strictEqual(new Tutoree("The number 3", "Dave", "Karlson", 18005551232, "dkson@notreal.com", "Blue").isValid(), false);
        });
        it('Success 1 - Test creation of a valid Tutoree with parameters matching', function(){
            assert.strictEqual(new Tutoree(0, "Bob", "Rogerson", 18665548300, "bobrog@nooo.org", 9).isValid(), true);
        });
        it('Success 2 - Test the insertion of a valid Tutoree (Tutoree.save) - Success Msg test', async function(){
            assert.strictEqual(await new Tutoree(1, "Steve", "Maximillion", 15552803999, "stee1m@goldmail.rich", 14).save(db), "Tutoree correctly inserted into the Database");
        });
        it('Success 3 - Test the update of a valid Tutoree (Tutoree.update) - Success Msg test', async function(){
            // Store the data about a tutoree as well as a slightly modified version of the tutoree
            let tutoree = new Tutoree(2, "Dirk", "Crawford", 15551230123, "sfdfssed@gmail.com", 3);
            let tutoreeUpdated = new Tutoree(2, "Dwayne", "Johnson", 10003160000, "rock@rock.rock", 4);
            // Make sure that the tutoree is successfully added to the database and that we recieve the success message for the tutoree updating
            assert.strictEqual(await tutoree.save(db), "Tutoree correctly inserted into the Database");
            assert.strictEqual(await Tutoree.update(db, 2, "Dwayne", "Johnson", 10003160000, "rock@rock.rock", 4), "Tutoree correctly updated");
            // Get a tutoree with the id of the tutoree we updated
            let specifiedTutoree = await Tutoree.getTutoreeById(db, 2);
            // Check if the information about the tutoree we got matches the info that we used to update the original tutoree
            assert.strictEqual(specifiedTutoree.id, tutoreeUpdated.id);
            assert.strictEqual(specifiedTutoree.firstName, tutoreeUpdated.firstName);
            assert.strictEqual(specifiedTutoree.lastName, tutoreeUpdated.lastName);
            assert.strictEqual(specifiedTutoree.phoneNumber, tutoreeUpdated.phoneNumber);
            assert.strictEqual(specifiedTutoree.email, tutoreeUpdated.email);
            assert.strictEqual(specifiedTutoree.gradeLevel, tutoreeUpdated.gradeLevel);
        });
        it('Success 4 - Test the deletetion of a valid Tutoree (Tutoree.delete) - Success Msg test', async function(){
            // Set the data a tutoree variable
            let tutoree = new Tutoree(3, "Brian", "Danielson", 13453455555, "runningoutofideas@yahoo.com", 11);
            // Test if the tutoree is properly added to the database
            assert.strictEqual(await tutoree.save(db), "Tutoree correctly inserted into the Database");
            // Test that we recieve the success message from deleting the tutoree
            assert.strictEqual(await Tutoree.delete(db, 3), "Tutoree deleted");
            // Try getting the tutoree from the database (expecting it to fail)
            try {
                await Tutoree.getTutoreeById(db, 3)
                assert.fail("There shouldn't be any tutorees with id 3");
            } catch (error) {
                assert.strictEqual(error, "There was no tutoree with the id 3");
            }
        });
        it('Success 5 - Test the retrieval of a tutoree by id (Tutoree.getTutoreeById) - Success Msg test', async function(){
            // Set the data a tutoree variable
            let tutoree = new Tutoree(7, "Todd", "Howard", 19001234760, "tood@bathesda.com", 2)
            // Save the tutoree to the database
            await tutoree.save(db)
            // Get the data on a tutoree with that id from the database
            let specifiedTutoree = await Tutoree.getTutoreeById(db, 7);
            // Check to make sure that all of the information about the tutoree we got matches the one we saved
            assert.strictEqual(specifiedTutoree.id, tutoree.id);
            assert.strictEqual(specifiedTutoree.firstName, tutoree.firstName);
            assert.strictEqual(specifiedTutoree.lastName, tutoree.lastName);
            assert.strictEqual(specifiedTutoree.phoneNumber, tutoree.phoneNumber);
            assert.strictEqual(specifiedTutoree.email, tutoree.email);
            assert.strictEqual(specifiedTutoree.gradeLevel, tutoree.gradeLevel);
        });
        it('Success 6 - Test the retrieval of all tutoree (Tutoree.getTutorees) - Success Msg test', async function(){
            // Save a new tutoree to the database so that there should be at least one tutoree in the database
            await new Tutoree(6, "Joe", "Rogan", 18005555555, "joro@entirely.possible", 4).save(db)
            // Get all of the tutorees in the database
            let allTutorees = await Tutoree.getTutorees(db);
            // Check if the number of tutorees you just got was less than 1 (if so, fail the test)
            if (allTutorees.length < 1) 
            {
                assert.fail("There should be elements in the database");
            }
        });
    });
    describe('Testing the Tutoree API - Complex Cases', function(){
        it('Success 1 - POST /tutorees, DELETE /tutorees/:id', function(){
            // Save the data of a tutoree
            let tutoree = new Tutoree(4, "George", "Harrison", 18888888888, "george@pawn.shop", 5);
            // Try to add that tutoree to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/tutorees",
                body: JSON.stringify(tutoree)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Check to make sure the tutoree actually got added
                    assert.strictEqual(body, "Tutoree correctly inserted into the Database");
                    // Try to delete the tutoree that we just added
                    request.delete({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/tutorees/4",
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            // Make sure the tutoree was deleted
                            assert.strictEqual(body, "Tutoree deleted");
                    });
            });
        });
        it('Success 2 - POST /tutorees, GET /tutorees (retrieval greater than 1), DELETE /tutoree/:id', function(){
            // Store the data for a tutoree in a variable
            let tutoree = new Tutoree(93, "Pete", "Petersberg", 14444444444, "petepete@aaahhhh.pain", 7);
            // Try to add the tutoree to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/tutorees",
                body: JSON.stringify(tutoree)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Make sure the tutoree got added to the database
                    assert.strictEqual(body, "Tutoree correctly inserted into the Database");
                    // Try to get all of the tutorees in the database
                    request.get({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/tutorees",
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            let allTutorees = JSON.parse(body);
                            // Check to see if you got more than one thing when you tried to get all of the tutorees
                            if (allTutorees.length < 1) 
                            {
                                // If not fail the test
                                assert.fail("There should be elements in the database");
                            }
                            // Try to delete the tutoree that we added at first
                            request.delete({
                                headers: {"Content-Type": "application/json"},
                                url: myUrl + "/tutorees/93",
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    // Make sure that the tutoree got deleted
                                    assert.strictEqual(body, "Tutoree deleted");
                            });
                    });
            });
        });
        it('Success 3 - POST /tutorees, GET /tutorees/:id, DELETE /tutoree/:id', function(){
            // Store the data for a tutoree in a variable
            let tutoree = new Tutoree(95, "James", "Hudson", 11111111111, "sorry@bored.com", 14);
            // Try to add the tutoree to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/tutorees",
                body: JSON.stringify(tutoree)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Make sure the tutoree got added
                    assert.strictEqual(body, "Tutoree correctly inserted into the Database");
                    // Try to get the tutoree from the database that has the same id
                    request.get({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/tutorees/95",
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            let tutoreeTest = JSON.parse(body);
                            // Check to see if the tutoree that we got has all of the same information as the one we added first
                            assert.strictEqual(tutoreeTest.id, tutoree.id);
                            assert.strictEqual(tutoreeTest.firstName, tutoree.firstName);
                            assert.strictEqual(tutoreeTest.lastName, tutoree.lastName);
                            assert.strictEqual(tutoreeTest.phoneNumber, tutoree.phoneNumber);
                            assert.strictEqual(tutoreeTest.email, tutoree.email);
                            assert.strictEqual(tutoreeTest.gradeLevel, tutoree.gradeLevel);
                            // Try to delete the tutoree that we added
                            request.delete({
                                headers: {"Content-Type": "application/json"},
                                url: myUrl + "/tutorees/95",
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    // Make sure the tutoree got deleted
                                    assert.strictEqual(body, "Tutoree deleted");
                            });
                    });
            });
        });
        it('Success 4 - POST /tutorees, PUT /tutorees/:id, GET /tutorees/:id, DELETE /tutoree/:id', function(){
            // Store the data for a tutoree in a variable as well as a modified version of the data in another variable
            let tutoree = new Tutoree(99, "Rick", "Rollington", 13333333333, "never@gonna.give", 12);
            let tutoreeUpdated = new Tutoree(99, "Big", "Man", 19999999999, "large@gmail.co", 10);
            // Try to add the original tutoree to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/tutorees",
                body: JSON.stringify(tutoree)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Make sure the tutoree actually got added to the database
                    assert.strictEqual(body, "Tutoree correctly inserted into the Database");
                    // Try to update the data of the tutoree we just added to the "tutoreeUpdated" data defined above
                    request.put({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/tutorees/99",
                        body: JSON.stringify(tutoreeUpdated)
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            // Make sure the tutoree was updated
                            assert.strictEqual(body, "Tutoree correctly updated");
                            // Try to get a tutoree with the same id from the database
                            request.get({
                                headers: {"Content-Type": "application/json"},
                                url: myUrl + "/tutorees/99",
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    let tutoreeTest = JSON.parse(body);
                                    // Make sure the data we got matches the "tutoreeUpdated" data
                                    assert.strictEqual(tutoreeTest.id, tutoreeUpdated.id);
                                    assert.strictEqual(tutoreeTest.firstName, tutoreeUpdated.firstName);
                                    assert.strictEqual(tutoreeTest.lastName, tutoreeUpdated.lastName);
                                    assert.strictEqual(tutoreeTest.phoneNumber, tutoreeUpdated.phoneNumber);
                                    assert.strictEqual(tutoreeTest.email, tutoreeUpdated.email);
                                    assert.strictEqual(tutoreeTest.gradeLevel, tutoreeUpdated.gradeLevel);
                                    // Try to delete the tutoree that we added and updated
                                    request.delete({
                                        headers: {"Content-Type": "application/json"},
                                        url: myUrl + "/tutorees/99",
                                        }, (error, response, body) => {
                                            console.log();
                                            console.log(body);
                                            // Make sure that the tutoree was deleted
                                            assert.strictEqual(body, "Tutoree deleted");
                                    });
                            });
                    });
            });
        });
    });
    describe('Testing the Tutor Model - Simple cases', function(){
        it('Fail 1 - Test an invalid Tutor id', async function(){
            // "Fred" is not a number and therefore not a valid id
            assert.strictEqual(new Tutor("Fred", "Paul", "Paulson", "paul2@gmail.com", "Hi, I'm Paul!", 1234567890, [[false]], ["Math"], [2]).isValid(), false);
        });
        it('Fail 2 - Test an invalid Tutor first name', function(){
            // The number 23 is not a string and therefore not a valid first name
            assert.strictEqual(new Tutor(0, 23, "Paulson", "paul2@gmail.com", "Hi, I'm Paul!", 1234567890, [[false]], ["Math"], [2]).isValid(), false);
        });
        it('Fail 3 - Test an invalid Tutor last name', function(){
            // The number 48 is not a string and therefore not a valid last name
            assert.strictEqual(new Tutor(0, "Paul", 48, "paul2@gmail.com", "Hi, I'm Paul!", 1234567890, [[false]], ["Math"], [2]).isValid(), false);
        });
        it('Fail 4 - Test an invalid Tutor email', function(){
            // The boolean false is not a string and is therefore not a valid email
            assert.strictEqual(new Tutor(0, "Paul", "Paulson", false, "Hi, I'm Paul!", 1234567890, [[false]], ["Math"], [2]).isValid(), false);
        });
        it('Fail 5 - Test Invalid Tutor description', function(){
            // The boolean true is not a number and therefore not a valid description
            assert.strictEqual(new Tutor(0, "Paul", "Paulson", "paul2@gmail.com", true, 1234567890, [[false]], ["Math"], [2]).isValid(), false);
        });
        it('Fail 6 - Test Invalid Tutor phoneNumber', function(){
            // The string "number" is not a number and therefore not a valid phoneNumber
            assert.strictEqual(new Tutor(0, "Paul", "Paulson", "paul2@gmail.com", "Hi, I'm Paul!", "number", [[false]], ["Math"], [2]).isValid(), false);
        });
        it('Fail 7 - Test Invalid Tutor availabilities', function(){
            // The number 1 is not an array and therefore are not valid availabilities
            assert.strictEqual(new Tutor(0, "Paul", "Paulson", "paul2@gmail.com", "Hi, I'm Paul!", 1234567890, 1, ["Math"], [2]).isValid(), false);
        });
        it('Fail 8 - Test Invalid Tutor subjects', function(){
            // The string "yay" is not an array and therefore are not valid subjects
            assert.strictEqual(new Tutor(0, "Paul", "Paulson", "paul2@gmail.com", "Hi, I'm Paul!", 1234567890, [[false]], "yay", ["Math"]).isValid(), false);
        });
        it('Fail 9 - Test Invalid Tutor feedback', function(){
            // The boolean false is not an array and therefore is not valid feedback
            assert.strictEqual(new Tutor(0, "Paul", "Paulson", "paul2@gmail.com", "Hi, I'm Paul!", 1234567890, [[false]], ["Math"], false).isValid(), false);
        });
        it('Success 1 - Test creation of a valid Tutor with parameters matching', function(){
            assert.strictEqual(new Tutor(0, "Paul", "Paulson", "paul2@gmail.com", "Hi, I'm Paul!", 1234567890, [[false]], ["Math"], [2]).isValid(), true);
        });
        it('Success 2 - Test the insertion of a valid Tutor (Tutor.save) - Success Msg test', async function(){
            assert.strictEqual(await new Tutor(1, "Robert", "Roy", "nothing@clever.com", "Alcohol.", 17095555555, [[true]], ["Chemistry", "Biology"], [2.5]).save(db), "Tutor correctly inserted into the Database");
        });
        it('Success 3 - Test the update of a valid Tutor (Tutor.update) - Success Msg test', async function(){
            // Store the data about a tutor as well as a slightly modified versoion of the tutor
            let tutor = new Tutor(2, "Kyle", "Albatross", "kyal@gmail.com", "My name is a bird lol", 12345555555, [[false, true]], ["Biology"], [1]);
            let tutorUpdated = new Tutor(2, "Brad", "Desktop", "bradesk@msn.com", "Not the same guy as before", 18002626262, [[false, false]], ["Computer Science"], [1.2]);
            // Make sure that the tutor is successfully added to the database and that we recieve the success message for the tutor updating
            assert.strictEqual(await tutor.save(db), "Tutor correctly inserted into the Database");
            assert.strictEqual(await Tutor.update(db, 2, "Brad", "Desktop", "bradesk@msn.com", "Not the same guy as before", 18002626262, [[false, false]], ["Computer Science"], [1.2]), "Tutor correctly updated");
            // Get a tutor with the id of the tutor we updated
            let specifiedTutor = await Tutor.getTutorById(db, 2);
            // Check if the information about the tutor we got matches the info that we used to update the original tutor
            assert.strictEqual(specifiedTutor.id, tutorUpdated.id);
            assert.strictEqual(specifiedTutor.firstName, tutorUpdated.firstName);
            assert.strictEqual(specifiedTutor.lastName, tutorUpdated.lastName);
            assert.strictEqual(specifiedTutor.email, tutorUpdated.email);
            assert.strictEqual(specifiedTutor.description, tutorUpdated.description);
            assert.strictEqual(specifiedTutor.phoneNumber, tutorUpdated.phoneNumber);
            for (let i = 0; i < specifiedTutor.availabilities.length; i++) {
                for (let j = 0; j < specifiedTutor.availabilities[0].length; j++) {
                    assert.strictEqual(specifiedTutor.availabilities[i][j], tutorUpdated.availabilities[i][j]);
                }
            }
            for (let i = 0; i < specifiedTutor.subjects.length; i++) {
                assert.strictEqual(specifiedTutor.subjects[i], tutorUpdated.subjects[i]);
            }
            for (let i = 0; i < specifiedTutor.feedback.length; i++) {
                assert.strictEqual(specifiedTutor.feedback[i], tutorUpdated.feedback[i]);
            }
        });
        it('Success 4 - Test the deletetion of a valid Tutor (Tutor.delete) - Success Msg test', async function(){
            // Set the data a tutor variable
            let tutor = new Tutor(3, "John", "Doe", "anon@tor.org", "Nobody Knows", 11111111111, [[true]], ["Computer Science"], [3]);
            // Test if the tutor is properly added to the database
            assert.strictEqual(await tutor.save(db), "Tutor correctly inserted into the Database");
            // Test that we recieve the success message from deleting the tutor
            assert.strictEqual(await Tutor.delete(db, 3), "Tutor deleted");
            // Try getting the tutor from the database (expecting it to fail)
            try {
                await Tutor.getTutorById(db, 3)
                assert.fail("There shouldn't be any tutors with id 3");
            } catch (error) {
                assert.strictEqual(error, "There was no tutor with the id 3");
            }
        });
        it('Success 5 - Test the retrieval of a tutor by id (Tutor.getTutorById) - Success Msg test', async function(){
            // Set the data a tutor variable
            let tutor = new Tutor(7, "Morgan", "Freeman", "idk@gmail.com", "Literally Morgan Freeman", 18005550001, [[false]], ["Drama"], [3])
            // Save the tutor to the database
            await tutor.save(db)
            // Get the data on a tutor with that id from the database
            let specifiedTutor = await Tutor.getTutorById(db, 7);
            // Check to make sure that all of the information about the tutor we got matches the one we saved
            assert.strictEqual(specifiedTutor.id, tutor.id);
            assert.strictEqual(specifiedTutor.firstName, tutor.firstName);
            assert.strictEqual(specifiedTutor.lastName, tutor.lastName);
            assert.strictEqual(specifiedTutor.email, tutor.email);
            assert.strictEqual(specifiedTutor.description, tutor.description);
            assert.strictEqual(specifiedTutor.phoneNumber, tutor.phoneNumber);
            for (let i = 0; i < specifiedTutor.availabilities.length; i++) {
                for (let j = 0; j < specifiedTutor.availabilities[0].length; j++) {
                    assert.strictEqual(specifiedTutor.availabilities[i][j], tutor.availabilities[i][j]);
                }
            }
            for (let i = 0; i < specifiedTutor.subjects.length; i++) {
                assert.strictEqual(specifiedTutor.subjects[i], tutor.subjects[i]);
            }
            for (let i = 0; i < specifiedTutor.feedback.length; i++) {
                assert.strictEqual(specifiedTutor.feedback[i], tutor.feedback[i]);
            }
        });
        it('Success 6 - Test the retrieval of all tutors (Tutor.getTutors) - Success Msg test', async function(){
            // Save a new tutor to the database so that there should be at least one tutor in the database
            await new Tutor(6, "Bruce", "Wayne", "notbatman@batman.com", "What's a batman?", 10000000000, [[false]], ["Business"], [3]).save(db)
            // Get all of the tutors in the database
            let allTutors = await Tutor.getTutors(db);
            // Check if the number of tutors you just got was less than 1 (if so, fail the test)
            if (allTutors.length < 1) 
            {
                assert.fail("There should be elements in the database");
            }
        });
    });
    describe('Testing the Tutor API - Complex Cases', function(){
        it('Success 1 - POST /tutors, DELETE /tutors/:id', function(){
            // Save the data of a tutor
            let tutor = new Tutor(4, "Reggie", "Fils-Aimé", "support@nintendo.com", "Recently out of work", 18002553700, [[true]], ["Tech"], [2.1]);
            // Try to add that tutor to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/tutors",
                body: JSON.stringify(tutor)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Check to make sure the tutor actually got added
                    assert.strictEqual(body, "Tutor correctly inserted into the Database");
                    // Try to delete the tutor that we just added
                    request.delete({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/tutors/4",
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            // Make sure the tutor was deleted
                            assert.strictEqual(body, "Tutor deleted");
                    });
            });
        });
        it('Success 2 - POST /tutors, GET /tutors (retrieval greater than 1), DELETE /tutor/:id', function(){
            // Store the data for a tutor in a variable
            let tutor = new Tutor(93, "Mark", "Wahlberg", "outofideas@gmail.com", "Not even sure if the last name is spelled right", 18005554321, [[true]], ["Drama"], [1.3]);
            // Try to add the tutor to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/tutors",
                body: JSON.stringify(tutor)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Make sure the tutor got added to the database
                    assert.strictEqual(body, "Tutor correctly inserted into the Database");
                    // Try to get all of the tutors in the database
                    request.get({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/tutors",
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            let allTutors = JSON.parse(body);
                            // Check to see if you got more than one thing when you tried to get all of the tutors
                            if (allTutors.length < 1) 
                            {
                                // If not fail the test
                                assert.fail("There should be elements in the database");
                            }
                            // Try to delete the tutor that we added at first
                            request.delete({
                                headers: {"Content-Type": "application/json"},
                                url: myUrl + "/tutors/93",
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    // Make sure that the tutor got deleted
                                    assert.strictEqual(body, "Tutor deleted");
                            });
                    });
            });
        });
        it('Success 3 - POST /tutors, GET /tutors/:id, DELETE /tutor/:id', function(){
            // Store the data for a tutor in a variable
            let tutor = new Tutor(95, "Tony", "Stark", "iron@man.com", "What am I signing up for?", 1, [[false]], ["Tech"], [2.4]);
            // Try to add the tutor to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/tutors",
                body: JSON.stringify(tutor)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Make sure the tutor got added
                    assert.strictEqual(body, "Tutor correctly inserted into the Database");
                    // Try to get the tutor from the database that has the same id
                    request.get({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/tutors/95",
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            let tutorTest = JSON.parse(body);
                            // Check to see if the tutor that we got has all of the same information as the one we added first
                            assert.strictEqual(tutorTest.id, tutor.id);
                            assert.strictEqual(tutorTest.firstName, tutor.firstName);
                            assert.strictEqual(tutorTest.lastName, tutor.lastName);
                            assert.strictEqual(tutorTest.email, tutor.email);
                            assert.strictEqual(tutorTest.description, tutor.description);
                            assert.strictEqual(tutorTest.phoneNumber, tutor.phoneNumber);
                            for (let i = 0; i < tutorTest.availabilities.length; i++) {
                                for (let j = 0; j < tutorTest.availabilities[0].length; j++) {
                                    assert.strictEqual(tutorTest.availabilities[i][j], tutor.availabilities[i][j]);
                                }
                            }
                            for (let i = 0; i < tutorTest.subjects.length; i++) {
                                assert.strictEqual(tutorTest.subjects[i], tutor.subjects[i]);
                            }
                            for (let i = 0; i < tutorTest.feedback.length; i++) {
                                assert.strictEqual(tutorTest.feedback[i], tutor.feedback[i]);
                            }
                            // Try to delete the tutor that we added
                            request.delete({
                                headers: {"Content-Type": "application/json"},
                                url: myUrl + "/tutors/95",
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    // Make sure the tutor got deleted
                                    assert.strictEqual(body, "Tutor deleted");
                            });
                    });
            });
        });
        it('Success 4 - POST /tutors, PUT /tutors/:id, GET /tutors/:id, DELETE /tutor/:id', function(){
            // Store the data for a tutor in a variable as well as a modified version of the data in another variable
            let tutor = new Tutor(99, "Steve", "Jobs", "support@apple.com", "Everything was totally my idea", 18004320034, [[false]], ["Business"], [2.1]);
            let tutorUpdated = new Tutor(99, "Steve", "Wozniak", "actualsupport@apple.com", "Really?", 18004320035, [[true]], ["Tech"], [2.9]);
            // Try to add the original tutor to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/tutors",
                body: JSON.stringify(tutor)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Make sure the tutor actually got added to the database
                    assert.strictEqual(body, "Tutor correctly inserted into the Database");
                    // Try to update the data of the tutor we just added to the "tutorUpdated" data defined above
                    request.put({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/tutors/99",
                        body: JSON.stringify(tutorUpdated)
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            // Make sure the tutor was updated
                            assert.strictEqual(body, "Tutor correctly updated");
                            // Try to get a tutor with the same id from the database
                            request.get({
                                headers: {"Content-Type": "application/json"},
                                url: myUrl + "/tutors/99",
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    let tutorTest = JSON.parse(body);
                                    // Make sure the data we got matches the "tutorUpdated" data
                                    assert.strictEqual(tutorTest.id, tutorUpdated.id);
                                    assert.strictEqual(tutorTest.name, tutorUpdated.name);
                                    assert.strictEqual(tutorTest.authors, tutorUpdated.authors);
                                    assert.strictEqual(tutorTest.year, tutorUpdated.year);
                                    assert.strictEqual(tutorTest.publisher, tutorUpdated.publisher);
                                    assert.strictEqual(tutorTest.id, tutorUpdated.id);
                                    assert.strictEqual(tutorTest.firstName, tutorUpdated.firstName);
                                    assert.strictEqual(tutorTest.lastName, tutorUpdated.lastName);
                                    assert.strictEqual(tutorTest.email, tutorUpdated.email);
                                    assert.strictEqual(tutorTest.description, tutorUpdated.description);
                                    assert.strictEqual(tutorTest.phoneNumber, tutorUpdated.phoneNumber);
                                    for (let i = 0; i < tutorTest.availabilities.length; i++) {
                                        for (let j = 0; j < tutorTest.availabilities[0].length; j++) {
                                            assert.strictEqual(tutorTest.availabilities[i][j], tutorUpdated.availabilities[i][j]);
                                        }
                                    }
                                    for (let i = 0; i < tutorTest.subjects.length; i++) {
                                        assert.strictEqual(tutorTest.subjects[i], tutorUpdated.subjects[i]);
                                    }
                                    for (let i = 0; i < tutorTest.feedback.length; i++) {
                                        assert.strictEqual(tutorTest.feedback[i], tutorUpdated.feedback[i]);
                                    }
                                    // Try to delete the tutor that we added and updated
                                    request.delete({
                                        headers: {"Content-Type": "application/json"},
                                        url: myUrl + "/tutors/99",
                                        }, (error, response, body) => {
                                            console.log();
                                            console.log(body);
                                            // Make sure that the tutor was deleted
                                            assert.strictEqual(body, "Tutor deleted");
                                    });
                            });
                    });
            });
        });
    });
});