// Increase the max listeners if needed to prevent warnings
require('events').EventEmitter.defaultMaxListeners = 20;

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const validator = require('validator'); // Import validator for validation

const app = express();
const port = 5000;

// Enable CORS for all requests
app.use(cors());
// Parse incoming JSON requests
app.use(bodyParser.json());

// Create the MySQL connection using environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect to the MySQL database
db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL Database');
});

// Root endpoint to check if the server is working
app.get('/', (req, res) => {
    res.send('Welcome to the backend API');
});

// User signup route
app.post('/api/signup', async (req, res) => {
    const { username, password } = req.body;

    // Validate password strength
    if (!password || !validator.isStrongPassword(password, { minLength: 8, minSymbols: 1 })) {
        return res.status(400).send('Password is not strong enough');
    }

    try {
        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        db.query(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword],
            (err, results) => {
                if (err) {
                    console.error('Error during signup:', err);
                    return res.status(400).send('Username already exists');
                }
                res.send('Signup successful!');
            }
        );
    } catch (err) {
        console.error('Error hashing password:', err);
        res.status(500).send('Internal server error');
    }
});
