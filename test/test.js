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
        it('Success 6 - Test the retrieval of all tutorees (Tutoree.getTutorees) - Success Msg test', async function(){
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
        it('Success 7 - Test the retrieval of a tutoree by id (Tutoree.getTutoreeByEmail) - Success Msg test', async function(){
            // Set the data a tutoree variable
            let tutoree = new Tutoree(43, "Mason", "Travis", 18003636890, "mt@gmail.com", 2)
            // Save the tutoree to the database
            await tutoree.save(db)
            // Get the data on a tutoree with that email from the database
            let specifiedTutoree = await Tutoree.getTutoreeByEmail(db, "mt@gmail.com");
            // Check to make sure that all of the information about the tutoree we got matches the one we saved
            assert.strictEqual(specifiedTutoree.id, tutoree.id);
            assert.strictEqual(specifiedTutoree.firstName, tutoree.firstName);
            assert.strictEqual(specifiedTutoree.lastName, tutoree.lastName);
            assert.strictEqual(specifiedTutoree.phoneNumber, tutoree.phoneNumber);
            assert.strictEqual(specifiedTutoree.email, tutoree.email);
            assert.strictEqual(specifiedTutoree.gradeLevel, tutoree.gradeLevel);
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
        it('Success 2 - POST /tutorees, GET /tutorees (retrieval greater than 1), DELETE /tutorees/:id', function(){
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
        it('Success 3 - POST /tutorees, GET /tutorees/:id, DELETE /tutorees/:id', function(){
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
        it('Success 4 - POST /tutorees, PUT /tutorees/:id, GET /tutorees/:id, DELETE /tutorees/:id', function(){
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
        it('Success 5 - POST /tutorees, GET /tutorees/email/:email, DELETE /tutorees/:id', function(){
            // Store the data for a tutoree in a variable
            let tutoree = new Tutoree(107, "Clint", "Stevens", 12121212121, "cs@mun.ca", 13);
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
                        url: myUrl + "/tutorees/email/cs@mun.ca",
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
                                url: myUrl + "/tutorees/" + tutoreeTest.id,
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    // Make sure the tutoree got deleted
                                    assert.strictEqual(body, "Tutoree deleted");
                            });
                    });
            });
        });
    });
    describe('Testing the Tutor Model - Simple cases', function(){
        it('Fail 1 - Test an invalid Tutor id', async function(){
            // "Fred" is not a number and therefore not a valid id
            assert.strictEqual(new Tutor("Fred", "Paul", "Paulson", "paul2@gmail.com", "Hi, I'm Paul!", 1234567890, [[false]], ["Math"], 2).isValid(), false);
        });
        it('Fail 2 - Test an invalid Tutor first name', function(){
            // The number 23 is not a string and therefore not a valid first name
            assert.strictEqual(new Tutor(0, 23, "Paulson", "paul2@gmail.com", "Hi, I'm Paul!", 1234567890, [[false]], ["Math"], 2).isValid(), false);
        });
        it('Fail 3 - Test an invalid Tutor last name', function(){
            // The number 48 is not a string and therefore not a valid last name
            assert.strictEqual(new Tutor(0, "Paul", 48, "paul2@gmail.com", "Hi, I'm Paul!", 1234567890, [[false]], ["Math"], 2).isValid(), false);
        });
        it('Fail 4 - Test an invalid Tutor email', function(){
            // The boolean false is not a string and is therefore not a valid email
            assert.strictEqual(new Tutor(0, "Paul", "Paulson", false, "Hi, I'm Paul!", 1234567890, [[false]], ["Math"], 2).isValid(), false);
        });
        it('Fail 5 - Test Invalid Tutor description', function(){
            // The boolean true is not a number and therefore not a valid description
            assert.strictEqual(new Tutor(0, "Paul", "Paulson", "paul2@gmail.com", true, 1234567890, [[false]], ["Math"], 2).isValid(), false);
        });
        it('Fail 6 - Test Invalid Tutor phoneNumber', function(){
            // The string "number" is not a number and therefore not a valid phoneNumber
            assert.strictEqual(new Tutor(0, "Paul", "Paulson", "paul2@gmail.com", "Hi, I'm Paul!", "number", [[false]], ["Math"], 2).isValid(), false);
        });
        it('Fail 7 - Test Invalid Tutor availabilities', function(){
            // The number 1 is not an array and therefore are not valid availabilities
            assert.strictEqual(new Tutor(0, "Paul", "Paulson", "paul2@gmail.com", "Hi, I'm Paul!", 1234567890, 1, ["Math"], 2).isValid(), false);
        });
        it('Fail 8 - Test Invalid Tutor subjects', function(){
            // The string "yay" is not an array and therefore are not valid subjects
            assert.strictEqual(new Tutor(0, "Paul", "Paulson", "paul2@gmail.com", "Hi, I'm Paul!", 1234567890, [[false]], "yay", 2).isValid(), false);
        });
        it('Fail 9 - Test Invalid Tutor feedback', function(){
            // The boolean false is not a number and therefore is not valid feedback
            assert.strictEqual(new Tutor(0, "Paul", "Paulson", "paul2@gmail.com", "Hi, I'm Paul!", 1234567890, [[false]], ["Math"], false).isValid(), false);
        });
        it('Success 1 - Test creation of a valid Tutor with parameters matching', function(){
            assert.strictEqual(new Tutor(0, "Paul", "Paulson", "paul2@gmail.com", "Hi, I'm Paul!", 1234567890, [[false]], ["Math"], 2).isValid(), true);
        });
        it('Success 2 - Test the insertion of a valid Tutor (Tutor.save) - Success Msg test', async function(){
            assert.strictEqual(await new Tutor(1, "Robert", "Roy", "nothing@clever.com", "Alcohol.", 17095555555, [[true]], ["Chemistry", "Biology"], 2.5).save(db), "Tutor correctly inserted into the Database");
        });
        it('Success 3 - Test the update of a valid Tutor (Tutor.update) - Success Msg test', async function(){
            // Store the data about a tutor as well as a slightly modified versoion of the tutor
            let tutor = new Tutor(2, "Kyle", "Albatross", "kyal@gmail.com", "My name is a bird lol", 12345555555, [[false, true]], ["Biology"], [1]);
            let tutorUpdated = new Tutor(2, "Brad", "Desktop", "bradesk@msn.com", "Not the same guy as before", 18002626262, [[false, false]], ["Computer Science"], 1.2);
            // Make sure that the tutor is successfully added to the database and that we recieve the success message for the tutor updating
            assert.strictEqual(await tutor.save(db), "Tutor correctly inserted into the Database");
            assert.strictEqual(await Tutor.update(db, 2, "Brad", "Desktop", "bradesk@msn.com", "Not the same guy as before", 18002626262, [[false, false]], ["Computer Science"], 1.2), "Tutor correctly updated");
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
            let tutor = new Tutor(3, "John", "Doe", "anon@tor.org", "Nobody Knows", 11111111111, [[true]], ["Computer Science"], 3);
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
            let tutor = new Tutor(7, "Morgan", "Freeman", "idk@gmail.com", "Literally Morgan Freeman", 18005550001, [[false]], ["Drama"], 3)
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
            assert.strictEqual(specifiedTutor.feedback, tutor.feedback);
        });
        it('Success 6 - Test the retrieval of all tutors (Tutor.getTutors) - Success Msg test', async function(){
            // Save a new tutor to the database so that there should be at least one tutor in the database
            await new Tutor(316, "Steve", "Austin", "sc@gmail.com", "What?", 10003160000, [[false]], ["Physical Education"], 3).save(db)
            // Get all of the tutors in the database
            let allTutors = await Tutor.getTutors(db);
            // Check if the number of tutors you just got was less than 1 (if so, fail the test)
            if (allTutors.length < 1) 
            {
                assert.fail("There should be elements in the database");
            }
        });
        it('Success 7 - Test the retrieval of a tutor by id (Tutor.getTutorByEmail) - Success Msg test', async function(){
            // Set the data a tutor variable
            let tutor = new Tutor(137, "Stanley", "Rodriguez", "stanrod@gmail.com", "Kinda dumb tbh...", 12341234123, [[true]], ["English"], 1)
            // Save the tutor to the database
            await tutor.save(db)
            // Get the data on a tutor with that id from the database
            let specifiedTutor = await Tutor.getTutorByEmail(db, "stanrod@gmail.com");
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
            assert.strictEqual(specifiedTutor.feedback, tutor.feedback);
        });
        it('Success 8 - Test the retrieval of all tutors (Tutor.getTutorsBySubject) - Success Msg test', async function(){
            // Save a new tutor to the database so that there should be at least one tutor in the database
            await new Tutor(136, "Math", "Man", "mm@mun.com", "I know the math things!", 12358132135, [[false]], ["Math"], 3).save(db)
            // Get all of the tutors in the database
            let allTutors = await Tutor.getTutorsBySubject(db, "Math");
            // Check if the number of tutors you just got was less than 1 (if so, fail the test)
            if (allTutors.length < 1) 
            {
                assert.fail("There should be elements in the database");
            }
        });
        it('Success 9 - Test the retrieval of all tutors (Tutor.getTutorsByFeedback) - Success Msg test', async function(){
            // Save a new tutor to the database so that there should be at least one tutor in the database
            await new Tutor(315, "Bruce", "Wayne", "notbatman@batman.com", "What's a batman?", 10000000000, [[false]], ["Business"], 3).save(db)
            await new Tutor(317, "Clarke", "Kent", "notsosuper@gmail.com", "Nothing clever", 10000000001, [[false]], ["Journalism"], 2.7).save(db)
            // Get all of the tutors in the database
            let allTutors = await Tutor.getTutorsByFeedback(db);
            // Check if the number of tutors you just got was less than 1 (if so, fail the test)
            if (allTutors.length < 1) 
            {
                assert.fail("There should be elements in the database");
            }
            // Get the indicies of the two tutors that were just added
            let tutor1Index;
            let tutor2Index;
            for (let i = 0; i < allTutors.length; i++) {
                if (allTutors[i].id == 315) {
                    tutor1Index = i;
                }
                else if (allTutors[i].id == 317) 
                {
                    tutor2Index = i;
                }
            }
            // Check if the first tutor (with better feedback) comes earlier in the array (has a lower index)
            assert.strictEqual((tutor1Index < tutor2Index), true);
        });
    });
    describe('Testing the Tutor API - Complex Cases', function(){
        it('Success 1 - POST /tutors, DELETE /tutors/:id', function(){
            // Save the data of a tutor
            let tutor = new Tutor(4, "Reggie", "Fils-Aimé", "support@nintendo.com", "Recently out of work", 18002553700, [[true]], ["Tech"], 2.1);
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
        it('Success 2 - POST /tutors, GET /tutors (retrieval greater than 1), DELETE /tutors/:id', function(){
            // Store the data for a tutor in a variable
            let tutor = new Tutor(93, "Mark", "Wahlberg", "outofideas@gmail.com", "Not even sure if the last name is spelled right", 18005554321, [[true]], ["Drama"], 1.3);
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
        it('Success 3 - POST /tutors, GET /tutors/:id, DELETE /tutors/:id', function(){
            // Store the data for a tutor in a variable
            let tutor = new Tutor(95, "Tony", "Stark", "iron@man.com", "What am I signing up for?", 1, [[false]], ["Tech"], 2.4);
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
        it('Success 4 - POST /tutors, PUT /tutors/:id, GET /tutors/:id, DELETE /tutors/:id', function(){
            // Store the data for a tutor in a variable as well as a modified version of the data in another variable
            let tutor = new Tutor(99, "Steve", "Jobs", "support@apple.com", "Everything was totally my idea", 18004320034, [[false]], ["Business"], 2.1);
            let tutorUpdated = new Tutor(99, "Steve", "Wozniak", "actualsupport@apple.com", "Really?", 18004320035, [[true]], ["Tech"], 2.9);
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
        it('Success 5 - POST /tutors, GET /tutors/subject/:subject (retrieval greater than 1), DELETE /tutors/:id', function(){
            // Store the data for a tutor in a variable
            let tutor = new Tutor(184, "Derek", "Johnson", "djboi@gmail.com", "Not even sure if the first name is spelled right", 15552342446, [[true]], ["Gym"], 1.6);
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
                        url: myUrl + "/tutors/subject/Gym",
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            let allTutorsWithSubject = JSON.parse(body);
                            // Check to see if you got more than one thing when you tried to get all of the tutors with the specified subject
                            if (allTutorsWithSubject.length < 1) 
                            {
                                // If not fail the test
                                assert.fail("There should be elements in the database");
                            }
                            // Try to delete the tutor that we added at first
                            request.delete({
                                headers: {"Content-Type": "application/json"},
                                url: myUrl + "/tutors/184",
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    // Make sure that the tutor got deleted
                                    assert.strictEqual(body, "Tutor deleted");
                            });
                    });
            });
        });
        it('Success 6 - POST /tutors, GET /tutors/email/:email, DELETE /tutors/:id', function(){
            // Store the data for a tutor in a variable
            let tutor = new Tutor(185, "Robert", "Roberts", "doubler@gmail.com", "Where am I?", 1, [[true]], ["Math"], 0.4);
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
                        url: myUrl + "/tutors/email/doubler@gmail.com",
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
                                url: myUrl + "/tutors/185",
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    // Make sure the tutor got deleted
                                    assert.strictEqual(body, "Tutor deleted");
                            });
                    });
            });
        });
        it('Success 7 - POST /tutors, GET /tutors/sort/feedback (retrieval greater than 1), DELETE /tutors/:id', function(){
            // Store the data for a tutor in a variable
            let tutor1 = new Tutor(320, "Buddy", "Wasisname", "bud@gmail.com", "... and the other fellers", 18005554321, [[false]], ["Music"], 2.7);
            let tutor2 = new Tutor(321, "Thomas", "Roooooooo", "troo@gmail.com", "I needed a job.", 18005554321, [[true]], ["English"], 0.4);
            // Try to add the first tutor to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/tutors",
                body: JSON.stringify(tutor1)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Make sure the tutor got added to the database
                    assert.strictEqual(body, "Tutor correctly inserted into the Database");
                    // Try to add the second tutor to the database
                    request.post({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/tutors",
                        body: JSON.stringify(tutor2)
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            // Make sure the tutor got added to the database
                            assert.strictEqual(body, "Tutor correctly inserted into the Database");
                            // Try to get all of the tutors in the database
                            request.get({
                                headers: {"Content-Type": "application/json"},
                                url: myUrl + "/tutors/sort/feedback",
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
                                    // Get the indecies of the tutors
                                    let tutor1Index;
                                    let tutor2Index;
                                    for (let i = 0; i < allTutors.length; i++) {
                                        if (allTutors[i].id == 320) {
                                            tutor1Index = i;
                                        }
                                        else if (allTutors[i].id == 321) 
                                        {
                                            tutor2Index = i;
                                        }
                                    }
                                    // Check if the first tutor (with better feedback) comes earlier in the array (has a lower index)
                                    assert.strictEqual((tutor1Index < tutor2Index), true);
                                    // Try to delete the tutor that we added first
                                    request.delete({
                                        headers: {"Content-Type": "application/json"},
                                        url: myUrl + "/tutors/320",
                                        }, (error, response, body) => {
                                            console.log();
                                            console.log(body);
                                            // Make sure that the tutor got deleted
                                            assert.strictEqual(body, "Tutor deleted");
                                            // Try to delete the tutor that we added second
                                            request.delete({
                                                headers: {"Content-Type": "application/json"},
                                                url: myUrl + "/tutors/321",
                                                }, (error, response, body) => {
                                                    console.log();
                                                    console.log(body);
                                                    // Make sure that the tutor got deleted
                                                    assert.strictEqual(body, "Tutor deleted");
                                            });
                                    });
                            });
                    });
            });
        });
    });
    describe('Testing the Session Model - Simple cases', function(){
        it('Fail 1 - Test an invalid Session id', async function(){
            // "Fred" is not a number and therefore not a valid id
            assert.strictEqual(new Session("Fred", 3, 7, "Library", "12:00", "Nov 7 2021").isValid(), false);
        });
        it('Fail 2 - Test an invalid tutor id', async function(){
            // The boolean false is not a number and therefore not a valid tutor id
            assert.strictEqual(new Session(0, false, 7, "Library", "12:00", "Nov 7 2021").isValid(), false);
        });
        it('Fail 3 - Test an invalid tutoree id', function(){
            // The string "nope" is not a number and therefore not a valid tutoree id
            assert.strictEqual(new Session(0, 3, "nope", "Library", "12:00", "Nov 7 2021").isValid(), false);
        });
        it('Fail 4 - Test an invalid Session location', function(){
            // The number 1900 is not a string and is therefore not a valid location
            assert.strictEqual(new Session(0, 3, 7, 1900, "12:00", "Nov 7 2021").isValid(), false);
        });
        it('Fail 5 - Test Invalid Session time', function(){
            // The boolean true is not a string and therefore not a valid time
            assert.strictEqual(new Session(0, 3, 7, "Library", true, "Nov 7 2021").isValid(), false);
        });
        it('Fail 6 - Test Invalid Session date', function(){
            // The number 0 is not a string and therefore not a valid date
            assert.strictEqual(new Session(0, 3, 7, "Library", "12:00", 0).isValid(), false);
        });
        it('Success 1 - Test creation of a valid Session with parameters matching', function(){
            assert.strictEqual(new Session(0, 3, 7, "Library", "12:00", "Nov 7 2021").isValid(), true);
        });
        it('Success 2 - Test the insertion of a valid Session (Session.save) - Success Msg test', async function(){
            assert.strictEqual(await new Session(1, 12, 43, "Starbucks", "9:00", "April 20 2021").save(db), "Session correctly inserted into the Database");
        });
        it('Success 3 - Test the update of a valid Session (Session.update) - Success Msg test', async function(){
            // Store the data about a session as well as a slightly modified versoion of the session
            let session = new Session(2, 14, 8, "The park", "15:00", "July 7 2022");
            let sessionUpdated = new Session(2, 17, 82, "The MUN Computer Lab", "15:02", "July 9 2022");
            // Make sure that the session is successfully added to the database and that we recieve the success message for the session updating
            assert.strictEqual(await session.save(db), "Session correctly inserted into the Database");
            assert.strictEqual(await Session.update(db, 2, 17, 82, "The MUN Computer Lab", "15:02", "July 9 2022"), "Session correctly updated");
            // Get a session with the id of the session we updated
            let specifiedSession = await Session.getSessionById(db, 2);
            // Check if the information about the session we got matches the info that we used to update the original session
            assert.strictEqual(specifiedSession.id, sessionUpdated.id);
            assert.strictEqual(specifiedSession.tutorId, sessionUpdated.tutorId);
            assert.strictEqual(specifiedSession.tutoreeId, sessionUpdated.tutoreeId);
            assert.strictEqual(specifiedSession.location, sessionUpdated.location);
            assert.strictEqual(specifiedSession.time, sessionUpdated.time);
            assert.strictEqual(specifiedSession.date, sessionUpdated.date);
        });
        it('Success 4 - Test the deletetion of a valid Session (Session.delete) - Success Msg test', async function(){
            // Set the data a session variable
            let session = new Session(3, 5, 3, "Main Building", "22:22", "Aug 17 2021");
            // Test if the session is properly added to the database
            assert.strictEqual(await session.save(db), "Session correctly inserted into the Database");
            // Test that we recieve the success message from deleting the session
            assert.strictEqual(await Session.delete(db, 3), "Session deleted");
            // Try getting the session from the database (expecting it to fail)
            try {
                await Session.getSessionById(db, 3)
                assert.fail("There shouldn't be any sessions with id 3");
            } catch (error) {
                assert.strictEqual(error, "There was no session with the id 3");
            }
        });
        it('Success 5 - Test the retrieval of a session by id (Session.getSessionById) - Success Msg test', async function(){
            // Set the data a session variable
            let session = new Session(7, 32, 19, "Coffee Shop", "10:00", "Dec 12 2021")
            // Save the session to the database
            await session.save(db)
            // Get the data on a session with that id from the database
            let specifiedSession = await Session.getSessionById(db, 7);
            // Check to make sure that all of the information about the session we got matches the one we saved
            assert.strictEqual(specifiedSession.id, session.id);
            assert.strictEqual(specifiedSession.tutorId, session.tutorId);
            assert.strictEqual(specifiedSession.tutoreeId, session.tutoreeId);
            assert.strictEqual(specifiedSession.location, session.location);
            assert.strictEqual(specifiedSession.time, session.time);
            assert.strictEqual(specifiedSession.date, session.date);
        });
        it('Success 6 - Test the retrieval of all sessions (Session.getSessions) - Success Msg test', async function(){
            // Save a new session to the database so that there should be at least one session in the database
            await new Session(6, 18, 27, "Library Study Room", "16:30", "Feb 8 2022").save(db)
            // Get all of the sessions in the database
            let allSessions = await Session.getSessions(db);
            // Check if the number of sessions you just got was less than 1 (if so, fail the test)
            if (allSessions.length < 1) 
            {
                assert.fail("There should be elements in the database");
            }
        });
        it('Success 7 - Test the retrieval of all sessions (Session.getSessionsByTutor) - Success Msg test', async function(){
            // Save a new session to the database so that there should be at least one session in the database with the correct tutor id
            await new Session(120, 52, 83, "Coffe Shop", "09:30", "Dec 8 2022").save(db)
            // Get all of the sessions in the database
            let allSessionsWithTutor = await Session.getSessionsByTutor(db, 52);
            // Check if the number of sessions you just got was less than 1 (if so, fail the test)
            if (allSessionsWithTutor.length < 1) 
            {
                assert.fail("There should be elements in the database");
            }
        });
        it('Success 8 - Test the retrieval of all sessions (Session.getSessionsByTutoree) - Success Msg test', async function(){
            // Save a new session to the database so that there should be at least one session in the database with the correct tutoree id
            await new Session(121, 47, 129, "Main Building", "14:00", "Aug 8 2022").save(db)
            // Get all of the sessions in the database
            let allSessionsWithTutoree = await Session.getSessionsByTutoree(db, 129);
            // Check if the number of sessions you just got was less than 1 (if so, fail the test)
            if (allSessionsWithTutoree.length < 1) 
            {
                assert.fail("There should be elements in the database");
            }
        });
        it('Success 9 - Test the retrieval of all sessions (Session.getSessions) - Success Msg test', async function(){
            // Save a new session to the database so that there should be at least one session in the database with the correct date
            await new Session(122, 42, 52, "Library", "18:30", "07-08-22").save(db)
            // Get all of the sessions in the database
            let allSessionsWithDate = await Session.getSessionsByDate(db, "07-08-22");
            // Check if the number of sessions you just got was less than 1 (if so, fail the test)
            if (allSessionsWithDate.length < 1) 
            {
                assert.fail("There should be elements in the database");
            }
        });
    });
    describe('Testing the Session API - Complex Cases', function(){
        it('Success 1 - POST /sessions, DELETE /sessions/:id', function(){
            // Save the data of a session
            let session = new Session(4, 43, 28, "Main Building", "14:30", "Oct 23 2021");
            // Try to add that session to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/sessions",
                body: JSON.stringify(session)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Check to make sure the session actually got added
                    assert.strictEqual(body, "Session correctly inserted into the Database");
                    // Try to delete the session that we just added
                    request.delete({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/sessions/4",
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            // Make sure the session was deleted
                            assert.strictEqual(body, "Session deleted");
                    });
            });
        });
        it('Success 2 - POST /sessions, GET /sessions (retrieval greater than 1), DELETE /sessions/:id', function(){
            // Store the data for a session in a variable
            let session = new Session(93, 15, 41, "Library", "17:30", "Sept 3 2021");
            // Try to add the session to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/sessions",
                body: JSON.stringify(session)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Make sure the session got added to the database
                    assert.strictEqual(body, "Session correctly inserted into the Database");
                    // Try to get all of the sessions in the database
                    request.get({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/sessions",
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            let allSessions = JSON.parse(body);
                            // Check to see if you got more than one thing when you tried to get all of the sessions
                            if (allSessions.length < 1) 
                            {
                                // If not fail the test
                                assert.fail("There should be elements in the database");
                            }
                            // Try to delete the session that we added at first
                            request.delete({
                                headers: {"Content-Type": "application/json"},
                                url: myUrl + "/sessions/93",
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    // Make sure that the session got deleted
                                    assert.strictEqual(body, "Session deleted");
                            });
                    });
            });
        });
        it('Success 3 - POST /sessions, GET /sessions/:id, DELETE /sessions/:id', function(){
            // Store the data for a session in a variable
            let session = new Session(95, 2, 108, "MUN CS Lab", "15:45", "Nov 14 2022");
            // Try to add the session to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/sessions",
                body: JSON.stringify(session)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Make sure the session got added
                    assert.strictEqual(body, "Session correctly inserted into the Database");
                    // Try to get the session from the database that has the same id
                    request.get({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/sessions/95",
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            let sessionTest = JSON.parse(body);
                            // Check to see if the session that we got has all of the same information as the one we added first
                            assert.strictEqual(sessionTest.id, session.id);
                            assert.strictEqual(sessionTest.tutorId, session.tutorId);
                            assert.strictEqual(sessionTest.tutoreeId, session.tutoreeId);
                            assert.strictEqual(sessionTest.location, session.location);
                            assert.strictEqual(sessionTest.time, session.time);
                            assert.strictEqual(sessionTest.date, session.date);
                            // Try to delete the session that we added
                            request.delete({
                                headers: {"Content-Type": "application/json"},
                                url: myUrl + "/sessions/95",
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    // Make sure the session got deleted
                                    assert.strictEqual(body, "Session deleted");
                            });
                    });
            });
        });
        it('Success 4 - POST /sessions, PUT /sessions/:id, GET /sessions/:id, DELETE /sessions/:id', function(){
            // Store the data for a session in a variable as well as a modified version of the data in another variable
            let session = new Session(99, 12, 32, "Starbucks", "13:00", "Oct 31 2021");
            let sessionUpdated = new Session(99, 13, 21, "Generic Coffee Shop", "13:01", "Nov 1 2021");
            // Try to add the original session to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/sessions",
                body: JSON.stringify(session)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Make sure the session actually got added to the database
                    assert.strictEqual(body, "Session correctly inserted into the Database");
                    // Try to update the data of the session we just added to the "sessionUpdated" data defined above
                    request.put({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/sessions/99",
                        body: JSON.stringify(sessionUpdated)
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            // Make sure the session was updated
                            assert.strictEqual(body, "Session correctly updated");
                            // Try to get a session with the same id from the database
                            request.get({
                                headers: {"Content-Type": "application/json"},
                                url: myUrl + "/sessions/99",
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    let sessionTest = JSON.parse(body);
                                    // Make sure the data we got matches the "sessionUpdated" data
                                    assert.strictEqual(sessionTest.id, sessionUpdated.id);
                                    assert.strictEqual(sessionTest.tutorId, sessionUpdated.tutorId);
                                    assert.strictEqual(sessionTest.tutoreeId, sessionUpdated.tutoreeId);
                                    assert.strictEqual(sessionTest.location, sessionUpdated.location);
                                    assert.strictEqual(sessionTest.time, sessionUpdated.time);
                                    assert.strictEqual(sessionTest.date, sessionUpdated.date);
                                    // Try to delete the session that we added and updated
                                    request.delete({
                                        headers: {"Content-Type": "application/json"},
                                        url: myUrl + "/sessions/99",
                                        }, (error, response, body) => {
                                            console.log();
                                            console.log(body);
                                            // Make sure that the session was deleted
                                            assert.strictEqual(body, "Session deleted");
                                    });
                            });
                    });
            });
        });
        it('Success 5 - POST /sessions, GET /sessions/tutor/:tutorId (retrieval greater than 1), DELETE /sessions/:id', function(){
            // Store the data for a session in a variable
            let session = new Session(193, 86, 213, "Library Study Room", "14:30", "Sept 5 2021");
            // Try to add the session to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/sessions",
                body: JSON.stringify(session)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Make sure the session got added to the database
                    assert.strictEqual(body, "Session correctly inserted into the Database");
                    // Try to get all of the sessions in the database that involve that tutor
                    request.get({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/sessions/tutor/86",
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            let allSessions = JSON.parse(body);
                            // Check to see if you got more than one thing when you tried to get all of the correct sessions
                            if (allSessions.length < 1) 
                            {
                                // If not fail the test
                                assert.fail("There should be elements in the database");
                            }
                            // Try to delete the session that we added at first
                            request.delete({
                                headers: {"Content-Type": "application/json"},
                                url: myUrl + "/sessions/193",
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    // Make sure that the session got deleted
                                    assert.strictEqual(body, "Session deleted");
                            });
                    });
            });
        });
        it('Success 6 - POST /sessions, GET /sessions/tutoree/:tutoreeId (retrieval greater than 1), DELETE /sessions/:id', function(){
            // Store the data for a session in a variable
            let session = new Session(194, 72, 81, "Starbucks", "17:00", "Sept 4 2021");
            // Try to add the session to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/sessions",
                body: JSON.stringify(session)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Make sure the session got added to the database
                    assert.strictEqual(body, "Session correctly inserted into the Database");
                    // Try to get all of the sessions in the database that involve that tutoree
                    request.get({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/sessions/tutoree/81",
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            let allSessions = JSON.parse(body);
                            // Check to see if you got more than one thing when you tried to get all of the correct sessions
                            if (allSessions.length < 1) 
                            {
                                // If not fail the test
                                assert.fail("There should be elements in the database");
                            }
                            // Try to delete the session that we added at first
                            request.delete({
                                headers: {"Content-Type": "application/json"},
                                url: myUrl + "/sessions/194",
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    // Make sure that the session got deleted
                                    assert.strictEqual(body, "Session deleted");
                            });
                    });
            });
        });
        it('Success 7 - POST /sessions, GET /sessions/date/:date (retrieval greater than 1), DELETE /sessions/:id', function(){
            // Store the data for a session in a variable
            let session = new Session(195, 91, 123, "Main Building", "19:21", "01-03-22");
            // Try to add the session to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/sessions",
                body: JSON.stringify(session)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Make sure the session got added to the database
                    assert.strictEqual(body, "Session correctly inserted into the Database");
                    // Try to get all of the sessions in the database with the specified date
                    request.get({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/sessions/date/01-03-22",
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            let allSessions = JSON.parse(body);
                            // Check to see if you got more than one thing when you tried to get all of the correct sessions
                            if (allSessions.length < 1) 
                            {
                                // If not fail the test
                                assert.fail("There should be elements in the database");
                            }
                            // Try to delete the session that we added at first
                            request.delete({
                                headers: {"Content-Type": "application/json"},
                                url: myUrl + "/sessions/195",
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    // Make sure that the session got deleted
                                    assert.strictEqual(body, "Session deleted");
                            });
                    });
            });
        });
    });
    describe('Testing the Admin Model - Simple cases', function(){
        it('Fail 1 - Test an invalid Admin id', async function(){
            // "Fred" is not a number and therefore not a valid id
            assert.strictEqual(new Admin("Fred", "Charles", "Dickens", "bigcd@gmail.com").isValid(), false);
        });
        it('Fail 2 - Test an invalid Admin first name', function(){
            // The number 0 is not a string and therefore not a valid first name
            assert.strictEqual(new Admin(0, 0, "Dickens", "bigcd@gmail.com").isValid(), false);
        });
        it('Fail 3 - Test an invalid Admin last name', function(){
            // The boolean true is not a string and is therefore not a valid last name
            assert.strictEqual(new Admin(0, "Charles", true, "bigcd@gmail.com").isValid(), false);
        });
        it('Fail 4 - Test Invalid Admin email', function(){
            // The number 4 is not a string and therefore not a valid email
            assert.strictEqual(new Admin(0, "Charles", "Dickens", 4).isValid(), false);
        });
        it('Success 1 - Test creation of a valid Admin with parameters matching', function(){
            assert.strictEqual(new Admin(0, "Charles", "Dickens", "bigcd@gmail.com").isValid(), true);
        });
        it('Success 2 - Test the insertion of a valid Admin (Admin.save) - Success Msg test', async function(){
            assert.strictEqual(await new Admin(1, "Roy", "Gbiv", "rainbows@gmail.com").save(db), "Admin correctly inserted into the Database");
        });
        it('Success 3 - Test the update of a valid Admin (Admin.update) - Success Msg test', async function(){
            // Store the data about a admin as well as a slightly modified versoion of the admin
            let admin = new Admin(2, "Marcus", "Aurelius", "m@gmail.com");
            let adminUpdated = new Admin(2, "Markus", "Smith", "smithsmith@gmail.com");
            // Make sure that the admin is successfully added to the database and that we recieve the success message for the admin updating
            assert.strictEqual(await admin.save(db), "Admin correctly inserted into the Database");
            assert.strictEqual(await Admin.update(db, 2, "Markus", "Smith", "smithsmith@gmail.com"), "Admin correctly updated");
            // Get a admin with the id of the admin we updated
            let specifiedAdmin = await Admin.getAdminById(db, 2);
            // Check if the information about the admin we got matches the info that we used to update the original admin
            assert.strictEqual(specifiedAdmin.id, adminUpdated.id);
            assert.strictEqual(specifiedAdmin.name, adminUpdated.name);
            assert.strictEqual(specifiedAdmin.authors, adminUpdated.authors);
            assert.strictEqual(specifiedAdmin.year, adminUpdated.year);
            assert.strictEqual(specifiedAdmin.publisher, adminUpdated.publisher);
        });
        it('Success 4 - Test the deletetion of a valid Admin (Admin.delete) - Success Msg test', async function(){
            // Set the data a admin variable
            let admin = new Admin(3, "Jeremy", "Peters", "jpjp@gmail.com");
            // Test if the admin is properly added to the database
            assert.strictEqual(await admin.save(db), "Admin correctly inserted into the Database");
            // Test that we recieve the success message from deleting the admin
            assert.strictEqual(await Admin.delete(db, 3), "Admin deleted");
            // Try getting the admin from the database (expecting it to fail)
            try {
                await Admin.getAdminById(db, 3)
                assert.fail("There shouldn't be any admins with id 3");
            } catch (error) {
                assert.strictEqual(error, "There was no admin with the id 3");
            }
        });
        it('Success 5 - Test the retrieval of a admin by id (Admin.getAdminById) - Success Msg test', async function(){
            // Set the data a admin variable
            let admin = new Admin(7, "Arron", "Runningoutoflastnames", "ehehron@gmail.com")
            // Save the admin to the database
            await admin.save(db)
            // Get the data on a admin with that id from the database
            let specifiedAdmin = await Admin.getAdminById(db, 7);
            // Check to make sure that all of the information about the admin we got matches the one we saved
            assert.strictEqual(specifiedAdmin.id, admin.id);
            assert.strictEqual(specifiedAdmin.name, admin.name);
            assert.strictEqual(specifiedAdmin.authors, admin.authors);
            assert.strictEqual(specifiedAdmin.year, admin.year);
            assert.strictEqual(specifiedAdmin.publisher, admin.publisher);
        });
        it('Success 6 - Test the retrieval of all admins (Admin.getAdmins) - Success Msg test', async function(){
            // Save a new admin to the database so that there should be at least one admin in the database
            await new Admin(6, "Tony", "Magenta", "thatsacolor@gmail.com").save(db)
            // Get all of the admins in the database
            let allAdmins = await Admin.getAdmins(db);
            // Check if the number of admins you just got was less than 1 (if so, fail the test)
            if (allAdmins.length < 1) 
            {
                assert.fail("There should be elements in the database");
            }
        });
        it('Success 7 - Test the retrieval of a admin by id (Admin.getAdminByEmail) - Success Msg test', async function(){
            // Set the data a admin variable
            let admin = new Admin(7, "Richard", "Nixon", "nixed@gmail.com")
            // Save the admin to the database
            await admin.save(db)
            // Get the data on a admin with that id from the database
            let specifiedAdmin = await Admin.getAdminByEmail(db, "nixed@gmail.com");
            // Check to make sure that all of the information about the admin we got matches the one we saved
            assert.strictEqual(specifiedAdmin.id, admin.id);
            assert.strictEqual(specifiedAdmin.name, admin.name);
            assert.strictEqual(specifiedAdmin.authors, admin.authors);
            assert.strictEqual(specifiedAdmin.year, admin.year);
            assert.strictEqual(specifiedAdmin.publisher, admin.publisher);
        });
    });
    describe('Testing the Admin API - Complex Cases', function(){
        it('Success 1 - POST /admins, DELETE /admins/:id', function(){
            // Save the data of a admin
            let admin = new Admin(4, "Fredrick", "McGuffen", "gufrick@gmail.com");
            // Try to add that admin to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/admins",
                body: JSON.stringify(admin)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Check to make sure the admin actually got added
                    assert.strictEqual(body, "Admin correctly inserted into the Database");
                    // Try to delete the admin that we just added
                    request.delete({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/admins/4",
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            // Make sure the admin was deleted
                            assert.strictEqual(body, "Admin deleted");
                    });
            });
        });
        it('Success 2 - POST /admins, GET /admins (retrieval greater than 1), DELETE /admins/:id', function(){
            // Store the data for a admin in a variable
            let admin = new Admin(93, "Martin", "Derhufferstein", "stein@gmail.com");
            // Try to add the admin to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/admins",
                body: JSON.stringify(admin)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Make sure the admin got added to the database
                    assert.strictEqual(body, "Admin correctly inserted into the Database");
                    // Try to get all of the admins in the database
                    request.get({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/admins",
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            let allAdmins = JSON.parse(body);
                            // Check to see if you got more than one thing when you tried to get all of the admins
                            if (allAdmins.length < 1) 
                            {
                                // If not fail the test
                                assert.fail("There should be elements in the database");
                            }
                            // Try to delete the admin that we added at first
                            request.delete({
                                headers: {"Content-Type": "application/json"},
                                url: myUrl + "/admins/93",
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    // Make sure that the admin got deleted
                                    assert.strictEqual(body, "Admin deleted");
                            });
                    });
            });
        });
        it('Success 3 - POST /admins, GET /admins/:id, DELETE /admins/:id', function(){
            // Store the data for a admin in a variable
            let admin = new Admin(95, "Christian", "Works", "currentlyunemployed@gmail.com");
            // Try to add the admin to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/admins",
                body: JSON.stringify(admin)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Make sure the admin got added
                    assert.strictEqual(body, "Admin correctly inserted into the Database");
                    // Try to get the admin from the database that has the same id
                    request.get({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/admins/95",
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            let adminTest = JSON.parse(body);
                            // Check to see if the admin that we got has all of the same information as the one we added first
                            assert.strictEqual(adminTest.id, admin.id);
                            assert.strictEqual(adminTest.name, admin.name);
                            assert.strictEqual(adminTest.authors, admin.authors);
                            assert.strictEqual(adminTest.year, admin.year);
                            assert.strictEqual(adminTest.publisher, admin.publisher);
                            // Try to delete the admin that we added
                            request.delete({
                                headers: {"Content-Type": "application/json"},
                                url: myUrl + "/admins/95",
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    // Make sure the admin got deleted
                                    assert.strictEqual(body, "Admin deleted");
                            });
                    });
            });
        });
        it('Success 4 - POST /admins, PUT /admins/:id, GET /admins/:id, DELETE /admins/:id', function(){
            // Store the data for a admin in a variable as well as a modified version of the data in another variable
            let admin = new Admin(99, "Frank", "Masterino", "nomoreideas@gmail.com");
            let adminUpdated = new Admin(99, "Roomba", "LastName", "isuck@gmail.com");
            // Try to add the original admin to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/admins",
                body: JSON.stringify(admin)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Make sure the admin actually got added to the database
                    assert.strictEqual(body, "Admin correctly inserted into the Database");
                    // Try to update the data of the admin we just added to the "adminUpdated" data defined above
                    request.put({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/admins/99",
                        body: JSON.stringify(adminUpdated)
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            // Make sure the admin was updated
                            assert.strictEqual(body, "Admin correctly updated");
                            // Try to get a admin with the same id from the database
                            request.get({
                                headers: {"Content-Type": "application/json"},
                                url: myUrl + "/admins/99",
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    let adminTest = JSON.parse(body);
                                    // Make sure the data we got matches the "adminUpdated" data
                                    assert.strictEqual(adminTest.id, adminUpdated.id);
                                    assert.strictEqual(adminTest.name, adminUpdated.name);
                                    assert.strictEqual(adminTest.authors, adminUpdated.authors);
                                    assert.strictEqual(adminTest.year, adminUpdated.year);
                                    assert.strictEqual(adminTest.publisher, adminUpdated.publisher);
                                    // Try to delete the admin that we added and updated
                                    request.delete({
                                        headers: {"Content-Type": "application/json"},
                                        url: myUrl + "/admins/99",
                                        }, (error, response, body) => {
                                            console.log();
                                            console.log(body);
                                            // Make sure that the admin was deleted
                                            assert.strictEqual(body, "Admin deleted");
                                    });
                            });
                    });
            });
        });
        it('Success 5 - POST /admins, GET /admins/email/:email, DELETE /admins/:id', function(){
            // Store the data for a admin in a variable
            let admin = new Admin(283, "Derherbergerdefer", "Johnson", "der@gmail.com");
            // Try to add the admin to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/admins",
                body: JSON.stringify(admin)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Make sure the admin got added
                    assert.strictEqual(body, "Admin correctly inserted into the Database");
                    // Try to get the admin from the database that has the same email
                    request.get({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/admins/email/der@gmail.com",
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            let adminTest = JSON.parse(body);
                            // Check to see if the admin that we got has all of the same information as the one we added first
                            assert.strictEqual(adminTest.id, admin.id);
                            assert.strictEqual(adminTest.name, admin.name);
                            assert.strictEqual(adminTest.authors, admin.authors);
                            assert.strictEqual(adminTest.year, admin.year);
                            assert.strictEqual(adminTest.publisher, admin.publisher);
                            // Try to delete the admin that we added
                            request.delete({
                                headers: {"Content-Type": "application/json"},
                                url: myUrl + "/admins/283",
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    // Make sure the admin got deleted
                                    assert.strictEqual(body, "Admin deleted");
                            });
                    });
            });
        });
    });
});