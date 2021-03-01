var assert = require('assert');
const Tutoree = require('../models/tutoree');
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
describe('Testing the Book API', async function(){
    describe('Testing the Book Model - Simple cases', function(){
        // In class the professor said that this was supposed to be a Success, so that is what I tested for
        it('Fail 1 - Test creation of a valid Book with parameters matching', function(){
            assert.strictEqual(new Book(0, "My Book", "Me", 2051, "Also me").isValid(), true);
        });
        it('Fail 2 - Test an invalid Book id', async function(){
            // "Fred" is not a number and therefore not a valid id
            assert.strictEqual(new Book("Fred", "My Book", "Me", 2021, "Also me").isValid(), false);
        });
        it('Fail 3 - Test an invalid Book name', function(){
            // The number 0 is not a string and therefore not a valid book name
            assert.strictEqual(new Book(0, 0, "Me", 2021, "Also me").isValid(), false);
        });
        it('Fail 4 - Test an invalid Book authors', function(){
            // The boolean true is not a string and is therefore not a valid author
            assert.strictEqual(new Book(0, "My Book", true, 2021, "Also me").isValid(), false);
        });
        it('Fail 5 - Test Invalid Book year', function(){
            // The string "nooooooooooo" is not a number and therefore not a valid year
            assert.strictEqual(new Book(0, "My Book", "Me", "nooooooooooo", "Also me").isValid(), false);
        });
        it('Success 1 - Test the insertion of a valid Book (Book.save) - Success Msg test', async function(){
            await new Session(0, 0, 0, "Wherever", "10:00", "Tomorrow").save(db);
            //assert.strictEqual(await new Book(1, "My Book", "Me", 2021, "Also me").save(db), "Book correctly inserted into the Database");
        });
        it('Success 2 - Test the update of a valid Book (Book.update) - Success Msg test', async function(){
            // Store the data about a book as well as a slightly modified versoion of the book
            let book = new Book(2, "My Book as well", "Me", 2022, "Me once again");
            let bookUpdated = new Book(2, "Not My Book", "Not Me", 1234, "Once again not me");
            // Make sure that the book is successfully added to the database and that we recieve the success message for the book updating
            assert.strictEqual(await book.save(db), "Book correctly inserted into the Database");
            assert.strictEqual(await Book.update(db, 2, "Not My Book", "Not Me", 1234, "Once again not me"), "Book correctly updated");
            // Get a book with the id of the book we updated
            let specifiedBook = await Book.getBookById(db, 2);
            // Check if the information about the book we got matches the info that we used to update the original book
            assert.strictEqual(specifiedBook.id, bookUpdated.id);
            assert.strictEqual(specifiedBook.name, bookUpdated.name);
            assert.strictEqual(specifiedBook.authors, bookUpdated.authors);
            assert.strictEqual(specifiedBook.year, bookUpdated.year);
            assert.strictEqual(specifiedBook.publisher, bookUpdated.publisher);
        });
        it('Success 3 - Test the deletetion of a valid Book (Book.delete) - Success Msg test', async function(){
            // Set the data a book variable
            let book = new Book(3, "Possibly My Book", "Could be Anybody", 2222, "Nobody Knows");
            // Test if the book is properly added to the database
            assert.strictEqual(await book.save(db), "Book correctly inserted into the Database");
            // Test that we recieve the success message from deleting the book
            assert.strictEqual(await Book.delete(db, 3), "Book deleted");
            // Try getting the book from the database (expecting it to fail)
            try {
                await Book.getBookById(db, 3)
                assert.fail("There shouldn't be any books with id 3");
            } catch (error) {
                assert.strictEqual(error, "There was no book with the id 3");
            }
        });
        it('Success 4 - Test the retrieval of a book by id (Book.getBookById) - Success Msg test', async function(){
            // Set the data a book variable
            let book = new Book(7, "Good Book", "Someone who knows how to write", 1900, "Very much not me")
            // Save the book to the database
            await book.save(db)
            // Get the data on a book with that id from the database
            let specifiedBook = await Book.getBookById(db, 7);
            // Check to make sure that all of the information about the book we got matches the one we saved
            assert.strictEqual(specifiedBook.id, book.id);
            assert.strictEqual(specifiedBook.name, book.name);
            assert.strictEqual(specifiedBook.authors, book.authors);
            assert.strictEqual(specifiedBook.year, book.year);
            assert.strictEqual(specifiedBook.publisher, book.publisher);
        });
        it('Success 5 - Test the retrieval of all books (Book.getBooks) - Success Msg test', async function(){
            // Save a new book to the database so that there should be at least one book in the database
            await new Book(6, "Not a Good Book", "Someone who knows how to write badly", 2007, "Probably me tbh").save(db)
            // Get all of the books in the database
            let allBooks = await Book.getBooks(db);
            // Check if the number of books you just got was less than 1 (if so, fail the test)
            if (allBooks.length < 1) 
            {
                assert.fail("There should be elements in the database");
            }
        });
    });
    describe('Testing the Book API - Complex Cases', function(){
        it('Success 1 - POST /books, DELETE /books/:id', function(){
            // Save the data of a book
            let book = new Book(4, "Square Book", "Somebody", 1888, "sclearinghouse");
            // Try to add that book to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/books",
                body: JSON.stringify(book)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Check to make sure the book actually got added
                    assert.strictEqual(body, "Book correctly inserted into the Database");
                    // Try to delete the book that we just added
                    request.delete({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/books/4",
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            // Make sure the book was deleted
                            assert.strictEqual(body, "Book deleted");
                    });
            });
        });
        it('Success 2 - POST /books, GET /books (retrieval greater than 1), DELETE /book/:id', function(){
            // Store the data for a book in a variable
            let book = new Book(93, "Round Book", "Somebody else else", 1324, "nooooooo");
            // Try to add the book to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/books",
                body: JSON.stringify(book)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Make sure the book got added to the database
                    assert.strictEqual(body, "Book correctly inserted into the Database");
                    // Try to get all of the books in the database
                    request.get({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/books",
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            let allBooks = JSON.parse(body);
                            // Check to see if you got more than one thing when you tried to get all of the books
                            if (allBooks.length < 1) 
                            {
                                // If not fail the test
                                assert.fail("There should be elements in the database");
                            }
                            // Try to delete the book that we added at first
                            request.delete({
                                headers: {"Content-Type": "application/json"},
                                url: myUrl + "/books/93",
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    // Make sure that the book got deleted
                                    assert.strictEqual(body, "Book deleted");
                            });
                    });
            });
        });
        it('Success 3 - POST /books, GET /books/:id, DELETE /book/:id', function(){
            // Store the data for a book in a variable
            let book = new Book(95, "I wonder what time it is", "tired", 1159, "Still Corking Co.");
            // Try to add the book to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/books",
                body: JSON.stringify(book)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Make sure the book got added
                    assert.strictEqual(body, "Book correctly inserted into the Database");
                    // Try to get the book from the database that has the same id
                    request.get({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/books/95",
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            let bookTest = JSON.parse(body);
                            // Check to see if the book that we got has all of the same information as the one we added first
                            assert.strictEqual(bookTest.id, book.id);
                            assert.strictEqual(bookTest.name, book.name);
                            assert.strictEqual(bookTest.authors, book.authors);
                            assert.strictEqual(bookTest.year, book.year);
                            assert.strictEqual(bookTest.publisher, book.publisher);
                            // Try to delete the book that we added
                            request.delete({
                                headers: {"Content-Type": "application/json"},
                                url: myUrl + "/books/95",
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    // Make sure the book got deleted
                                    assert.strictEqual(body, "Book deleted");
                            });
                    });
            });
        });
        it('Success 4 - POST /books, PUT /books/:id, GET /books/:id, DELETE /book/:id', function(){
            // Store the data for a book in a variable as well as a modified version of the data in another variable
            let book = new Book(99, "The Big Book of Triangles", "A big fan of shapes", 3333, "Three Sided inc.");
            let bookUpdated = new Book(99, "The Big Book of Pentagons", "A big fan of shapes, but only five-sided ones", 5555, "Five Sides: The Company");
            // Try to add the original book to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/books",
                body: JSON.stringify(book)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Make sure the book actually got added to the database
                    assert.strictEqual(body, "Book correctly inserted into the Database");
                    // Try to update the data of the book we just added to the "bookUpdated" data defined above
                    request.put({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/books/99",
                        body: JSON.stringify(bookUpdated)
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            // Make sure the book was updated
                            assert.strictEqual(body, "Book correctly updated");
                            // Try to get a book with the same id from the database
                            request.get({
                                headers: {"Content-Type": "application/json"},
                                url: myUrl + "/books/99",
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    let bookTest = JSON.parse(body);
                                    // Make sure the data we got matches the "bookUpdated" data
                                    assert.strictEqual(bookTest.id, bookUpdated.id);
                                    assert.strictEqual(bookTest.name, bookUpdated.name);
                                    assert.strictEqual(bookTest.authors, bookUpdated.authors);
                                    assert.strictEqual(bookTest.year, bookUpdated.year);
                                    assert.strictEqual(bookTest.publisher, bookUpdated.publisher);
                                    // Try to delete the book that we added and updated
                                    request.delete({
                                        headers: {"Content-Type": "application/json"},
                                        url: myUrl + "/books/99",
                                        }, (error, response, body) => {
                                            console.log();
                                            console.log(body);
                                            // Make sure that the book was deleted
                                            assert.strictEqual(body, "Book deleted");
                                    });
                            });
                    });
            });
        });
        it('Success 5 - (Optional) Open', function(){ // Testing if the book we add to the database appears in the array of all books
            // Store the data for a book in a variable
            let book = new Book(97, "The Magical Book of the number 97", "John Smith the 97th", 1997, "97 International");
            // Try to add the book to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/books",
                body: JSON.stringify(book)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Make sure the book got added to the database
                    assert.strictEqual(body, "Book correctly inserted into the Database");
                    // Try to get all of the books in the database
                    request.get({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/books",
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            let allBooks = JSON.parse(body);
                            let addedBookIsInArrayOfAllBooks = false;
                            // For every book found check if it has a matching id to the book we added
                            for (let i = 0; i < allBooks.length; i++) {
                                if (allBooks[i].id == book.id) 
                                {
                                    // If it does check if the rest of the data matches up, and set a bool if everything matches
                                    if (allBooks[i].name == book.name && allBooks[i].authors == book.authors && allBooks[i].year == book.year && allBooks[i].publisher == book.publisher) 
                                    {addedBookIsInArrayOfAllBooks = true;}
                                }
                            }
                            // Test if the added book was present in the array of all books
                            assert.strictEqual(addedBookIsInArrayOfAllBooks, true);
                            // Try to delete the book that we added at first (This step is mainly just for cleanup, and maintaining accuracy through repeated tests)
                            request.delete({
                                headers: {"Content-Type": "application/json"},
                                url: myUrl + "/books/97",
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    // Make sure that the book got deleted
                                    assert.strictEqual(body, "Book deleted");
                            });
                    });
            });
        });
        it('Success 6 - (Optional) Open', function(){ // Testing to make sure that multiple updates are handled correctly
            // Store the data for a book in a variable as well as a modified version of the data in another variable
            let book = new Book(100, "The ONE Book You Need in Your Life", "One Man Gang", 1911, "One For All Limited");
            let bookUpdated1 = new Book(100, "Two For: The Show", "Jacob Two-Two", 1922, "The Two Alliance");
            let bookUpdated2 = new Book(100, "Three Complicated Laws", "The same guy who wrote the triangle book", 1933, "Three Black Dots");
            let bookUpdated3 = new Book(100, "Four books is too many", "A very tired human being", 1944, "Done Four Now");
            // Try to add the original book to the database
            request.post({
                headers: {"Content-Type": "application/json"},
                url: myUrl + "/books",
                body: JSON.stringify(book)
                }, (error, response, body) => {
                    console.log();
                    console.log(body);
                    // Make sure the book actually got added to the database
                    assert.strictEqual(body, "Book correctly inserted into the Database");
                    // Try to update the data of the book we just added to the "bookUpdated1" data defined above
                    request.put({
                        headers: {"Content-Type": "application/json"},
                        url: myUrl + "/books/100",
                        body: JSON.stringify(bookUpdated1)
                        }, (error, response, body) => {
                            console.log();
                            console.log(body);
                            // Make sure the book was updated
                            assert.strictEqual(body, "Book correctly updated");
                            // Try to update the data of the book again, to the "bookUpdated2" data this time
                            request.put({
                                headers: {"Content-Type": "application/json"},
                                url: myUrl + "/books/100",
                                body: JSON.stringify(bookUpdated2)
                                }, (error, response, body) => {
                                    console.log();
                                    console.log(body);
                                    // Make sure the book was updated
                                    assert.strictEqual(body, "Book correctly updated");
                                    // Try to update the data of the book one more time, to the "bookUpdated3" data this time
                                    request.put({
                                        headers: {"Content-Type": "application/json"},
                                        url: myUrl + "/books/100",
                                        body: JSON.stringify(bookUpdated3)
                                        }, (error, response, body) => {
                                            console.log();
                                            console.log(body);
                                            // Make sure the book was updated
                                            assert.strictEqual(body, "Book correctly updated");
                                            // Try to get a book with the same id from the database
                                            request.get({
                                                headers: {"Content-Type": "application/json"},
                                                url: myUrl + "/books/100",
                                                }, (error, response, body) => {
                                                    console.log();
                                                    console.log(body);
                                                    let bookTest = JSON.parse(body);
                                                    // Make sure the data we got matches the "bookUpdated3" data
                                                    assert.strictEqual(bookTest.id, bookUpdated3.id);
                                                    assert.strictEqual(bookTest.name, bookUpdated3.name);
                                                    assert.strictEqual(bookTest.authors, bookUpdated3.authors);
                                                    assert.strictEqual(bookTest.year, bookUpdated3.year);
                                                    assert.strictEqual(bookTest.publisher, bookUpdated3.publisher);
                                                    // Try to delete the book that we added and updated
                                                    request.delete({
                                                        headers: {"Content-Type": "application/json"},
                                                        url: myUrl + "/books/100",
                                                        }, (error, response, body) => {
                                                            console.log();
                                                            console.log(body);
                                                            // Make sure that the book was deleted
                                                            assert.strictEqual(body, "Book deleted");
                                                    });
                                            });
                                    });
                            });
                    });
            });
            
        });
    });
});