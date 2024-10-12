const express = require('express');
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set, get } = require("firebase/database");
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());

const firebaseConfig = {
  apiKey: "AIzaSyCkXjV21s_PhJcslSh9-P6mutkDQaWsk0Q",
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

// Serve the login page as the default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve the register page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.post('/register', (req, res) => {
    const { email, password, role } = req.body;

    // Validate input fields
    if (!email || !password || !role) {
        return res.status(400).json({ message: "Email, password, and role are required" });
    }

    // Sanitize email
    const sanitizedEmail = sanitizeEmail(email);
    const reference = ref(getDatabase(), 'users/' + sanitizedEmail);

    // Check if user already exists
    get(reference)
        .then((snapshot) => {
            if (snapshot.exists()) {
                return res.status(409).json({ message: "Email is already in use" }); // Conflict status
            }

            // If email doesn't exist, register the user
            set(reference, {
                email: email,
                password: password,
                role: role // Save the user's role (landlord or tenant)
            })
            .then(() => {
                res.status(200).json({ message: "User registered successfully" });
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
                if (userData.password === password) {
                    res.status(200).json({ message: "Login successful" });
                } else {
                    res.status(401).json({ message: "Incorrect password" });
                }
            } else {
                res.status(404).json({ message: "User not found" });
            }
        });
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});