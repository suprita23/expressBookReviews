const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if(authenticatedUser(username,password)){
    // Generate a token with the username and password
    let accessToken = jwt.sign({ data: username }, 'accessTokenSecret', { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken, username };
    return res.status(200).send("User successfully logged in");
  }
  return res.status(208).json({message: "Invalid Login. Check username and password"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //verify if the user is logged in
  const token = req.session.authorization.accessToken;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // Verify the token 
  jwt.verify(token, 'accessTokenSecret', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    // Extract the username from the token
    const username = decoded.data;
    const isbn = req.params.isbn;
    const review = req.body.review;

    // Check if the book exists
    
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Add the review to the book
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
    books[isbn].reviews = review;

    return res.status(200).json({ message: "Review added successfully" });
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  //verify if the user is logged in
  const token = req.session.authorization.accessToken;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // Verify the token 
  jwt.verify(token, 'accessTokenSecret', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    // Extract the username from the token
    const username = decoded.data;
    const isbn = req.params.isbn;

    // Check if the book exists
    
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Add the review to the book
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
    books[isbn].reviews = "";

    return res.status(200).json({ message: "Review removed successfully" });
  });
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
