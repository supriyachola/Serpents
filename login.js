
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCres6-9eK94ZqOzz4MZpWYd5fCz4Q-xy8",
    authDomain: "carbon-footprint-6434e.firebaseapp.com",
    projectId: "carbon-footprint-6434e",
    storageBucket: "carbon-footprint-6434e.appspot.com",
    messagingSenderId: "506101424391",
    appId: "1:506101424391:web:6780265bc6b3f51e54a5a2",
    measurementId: "G-DC24DELQ6C"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  
  // Get references to the input fields and login button
  const emailField = document.getElementById("emailField");
  const passwordField = document.getElementById("passwordField");
  const loginButton = document.getElementById("loginButton");
  
  // Add an event listener to the login button
  loginButton.addEventListener("click", (e) => {
    e.preventDefault();
  
    const email = emailField.value;
    const password = passwordField.value;
  
    // Firebase Authentication login
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        alert("Login successful");
        // Redirect to google.com after successful login
        window.location.href = "home.html";
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert("Error: " + errorMessage);
      });
  });