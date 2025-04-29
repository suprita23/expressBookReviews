const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  // Check if both username and password are provided
  if (username && password) {
      // Check if the user does not already exist
      if (!isValid(username)) {
          // Add the new user to the users array
          users.push({"username": username, "password": password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(404).json({message: "User already exists!"});
      }
  }
  // Return error if username or password is missing
  return res.status(404).json({message: "Unable to register user."});
});

async function getAllBooks(){
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(books);
    }, 1000);
  });
}
async function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject(new Error('Book not found'));
      }
    }, 1000);
  });
}

async function getBookByAuthor(author) {
  new Promise((resolve, reject) => {
    setTimeout(() => {
      let booksList = [];
      for (let id in books) {
        if (books[id].author === author) {
          booksList.push(books[id]);
        }
      }
      if (booksList.length > 0) {
        resolve(booksList);
      } else {
        reject(new Error('No books found for this author'));
      }
    }, 1000);
  }
  );
}
// Get the book list available in the shop
public_users.get('/',function (req, res) {
  getAllBooks()
    .then((books) => {
      res.send(JSON.stringify(books, null, 4));
    })
    .catch((error) => {
      res.status(500).send(error.message);
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  getBookByISBN(req.params.isbn)
    .then((book) => {
      res.send(JSON.stringify(book, null, 4));
    })
    .catch((error) => {
      res.status(404).send(error.message);
    });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  getBookByAuthor(req.params.author)
    .then((books) => {
      res.send(JSON.stringify(books, null, 4));
    })
    .catch((error) => {
      res.status(404).send(error.message);
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  title = req.params.title;
  let booksList = []
  for (let id in books){
    console.log(books[id].title);
    if (books[id].title == title) {
      booksList.push(books[id]);
    }
  }
  if (booksList.length > 0) {
    return res.status(200).json(booksList);
  } else {
    return res.status(404).json({message: "No books found with this title"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  isbn = req.params.isbn;
  
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews || {});
  } else {
    return res.status(404).json({message: "No books found with this ISBN"});
  }
});

module.exports.general = public_users;
