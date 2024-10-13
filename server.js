require('dotenv').config();
const express = require('express');
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set, get } = require("firebase/database");
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const app = express();
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(express.static(path.join(__dirname, 'public')));

const googleApiKey = process.env.GOOGLE_API_KEY;

const firebaseConfig = {
  apiKey: process.env.googleApiKey,
  authDomain: "easyrent-9b025.firebaseapp.com",
  databaseURL: "https://easyrent-9b025-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "easyrent-9b025",
  storageBucket: "easyrent-9b025.appspot.com",
  messagingSenderId: "701935235340",
  appId: "1:701935235340:web:aeb3e8e2b715a27227d929",
  measurementId: "G-5B0RSMB262"
};

// Initialize Firebase
initializeApp(firebaseConfig);

function sanitizeEmail(email) {
    return email.replace(/[.#$[\]]/g, '_');
}

// Single dashboard route
app.get('/dashboard', (req, res) => {
    const userRole = req.session.role;

    if (userRole === 'tenant') {
        res.sendFile(path.join(__dirname, 'tenant_dashboard.html'));
    } else if (userRole === 'landlord') {
        res.sendFile(path.join(__dirname, 'landlord_dashboard.html'));
    } else {
        res.status(403).send('Access denied'); 
    }
});

// Serve the login page as the default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve the register page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

const bcrypt = require('bcrypt');

// Modify the register route to hash passwords
app.post('/register', (req, res) => {
    const { email, password, role } = req.body;

    // Validate input fields
    if (!email || !password || !role) {
        return res.status(400).json({ message: "Email, password, and role are required" });
    }

    // Hash the password before storing it
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: "Error hashing password" });
        }

        // Sanitize email
        const sanitizedEmail = sanitizeEmail(email);
        const reference = ref(getDatabase(), 'users/' + sanitizedEmail);

        // Check if user already exists
        get(reference)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    return res.status(409).json({ message: "Email is already in use" });
                }

                // Store the user with the hashed password
                set(reference, {
                    email: email,
                    password: hashedPassword, // Store the hashed password
                    role: role
                })
                .then(() => {
                    res.status(200).json({ message: "User registered successfully" });
                });
            });
    });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const db = getDatabase();
    const sanitizedEmail = sanitizeEmail(email);
    const reference = ref(db, 'users/' + sanitizedEmail);

    // Retrieve the user's details from Firebase
    get(reference)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();

                // Compare the entered password with the stored hashed password
                bcrypt.compare(password, userData.password, (err, result) => {
                    if (err) {
                        return res.status(500).json({ message: "Error comparing passwords" });
                    }

                    if (result) {
                        // Store user role in the session
                        req.session.role = userData.role;
                        // Send back user role along with success message
                        return res.status(200).json({
                            message: "Login successful",
                            role: userData.role // Ensure the role is stored in the user data
                        });
                    } else {
                        res.status(401).json({ message: "Incorrect password" });
                    }
                });
            } else {
                res.status(404).json({ message: "User not found" });
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            res.status(500).json({ message: "Internal server error" });
        });
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});