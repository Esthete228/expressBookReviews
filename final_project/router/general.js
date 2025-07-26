const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users").isValid;
let users = require("./auth_users").users;
const axios = require('axios');
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.find(user => user.username === username);

  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  let isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  } else {
    return res.status(404).json({message: "Book not found"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author.toLowerCase();
  const booksByAuthor = [];

  for (const key in books) {
    if (books[key].author.toLowerCase() === author) {
      booksByAuthor.push(books[key]);
    }
  }

  if (booksByAuthor.length > 0) {
    return res.status(200).json(booksByAuthor);
  } else {
    return res.status(404).json({message: "No books found by this author"});
  }

});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title.toLowerCase();
  const booksByTitle = [];
  for (const key in books) {
    if (books[key].title.toLowerCase().includes(title)) {
      booksByTitle.push(books[key]);
    }
  }
  if (booksByTitle.length > 0) {
    return res.status(200).json(booksByTitle);
  } else {
    return res.status(404).json({message: "No books found with this title"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

//  Get book reviews
public_users.get("/async-books", async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/');
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

//  Get book review by ISBN
public_users.get('/promise-isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    axios.get(`http://localhost:5000/isbn/${isbn}`)
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch(error => {
            res.status(404).json({ message: "Book not found", error: error.message });
        });
});

//  Get book reviews by author
public_users.get('/promise-author/:author', (req, res) => {
    const author = req.params.author;

    axios.get('http://localhost:5000/')
        .then(response => {
            const books = response.data;
            const filteredBooks = [];

            for (const isbn in books) {
                if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
                    filteredBooks.push({ isbn, ...books[isbn] });
                }
            }

            if (filteredBooks.length > 0) {
                res.status(200).json(filteredBooks);
            } else {
                res.status(404).json({ message: "No books found by this author" });
            }
        })
        .catch(error => {
            res.status(500).json({ message: "Error fetching books", error: error.message });
        });
});

//  Get book by title

public_users.get('/async-title/:title', async (req, res) => {
    const title = req.params.title;

    try {
        const response = await axios.get('http://localhost:5000/');
        const books = response.data;
        const filteredBooks = [];

        for (const isbn in books) {
            if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
                filteredBooks.push({ isbn, ...books[isbn] });
            }
        }

        if (filteredBooks.length > 0) {
            res.status(200).json(filteredBooks);
        } else {
            res.status(404).json({ message: "No books found with this title" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

module.exports.general = public_users;
