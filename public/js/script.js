import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Add event listener for form submission
document.getElementById('reset-password-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form from submitting normally

    const email = document.getElementById('email').value;

    if (validateEmail(email)) {
        // Send password reset email using Firebase Authentication
        sendPasswordResetEmail(auth, email)
            .then(() => {
                document.getElementById('message').textContent = 'A password reset link has been sent to your email.';
            })
            .catch((error) => {
                document.getElementById('message').textContent = error.message;
            });
    } else {
        document.getElementById('message').textContent = 'Please enter a valid email address.';
    }
});

// Function to validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}