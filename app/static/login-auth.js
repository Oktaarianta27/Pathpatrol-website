import { auth, provider } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

/* == UI - Elements == */
const signInWithGoogleButtonEl = document.getElementById(
  "sign-in-with-google-btn"
);
const signUpWithGoogleButtonEl = document.getElementById(
  "sign-up-with-google-btn"
);
const emailInputEl = document.getElementById("email-input");
const passwordInputEl = document.getElementById("password-input");
const signInButtonEl = document.getElementById("sign-in-btn");
const createAccountButtonEl = document.getElementById("create-account-btn");
const emailForgotPasswordEl = document.getElementById("email-forgot-password");
const forgotPasswordButtonEl = document.getElementById("forgot-password-btn");

const errorMsgEmail = document.getElementById("email-error-message");
const errorMsgPassword = document.getElementById("password-error-message");
const errorMsgGoogleSignIn = document.getElementById(
  "google-signin-error-message"
);

/* == UI - Event Listeners == */
if (signInWithGoogleButtonEl) {
  signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle);
}

if (signInButtonEl) {
  signInButtonEl.addEventListener("click", authSignInWithEmail);
}

if (createAccountButtonEl) {
  createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail);
}

if (signUpWithGoogleButtonEl) {
  signUpWithGoogleButtonEl.addEventListener("click", authSignUpWithGoogle);
}

if (forgotPasswordButtonEl) {
  forgotPasswordButtonEl.addEventListener("click", resetPassword);
}

// Function to validate email format
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// Function to validate password (at least 6 characters)
function validatePassword(password) {
  return password.length >= 6;
}

// Centralized error handling function
function handleAuthError(error) {
  const errorCode = error.code;
  console.error("Error code: ", errorCode);

  switch (errorCode) {
    case "auth/invalid-email":
      errorMsgEmail.textContent = "Invalid email format.";
      break;
    case "auth/invalid-credential":
      errorMsgPassword.textContent = "Invalid email or password.";
      break;
    case "auth/weak-password":
      errorMsgPassword.textContent = "Password must be at least 6 characters.";
      break;
    case "auth/email-already-in-use":
      errorMsgEmail.textContent = "An account already exists for this email.";
      break;
    case "auth/user-not-found":
      errorMsgEmail.textContent = "User not found.";
      break;
    case "auth/wrong-password":
      errorMsgPassword.textContent = "Incorrect password.";
      break;
    default:
      errorMsgEmail.textContent = "An error occurred. Please try again.";
      break;
  }
}

// Function to sign in with Google authentication
async function authSignInWithGoogle() {
  provider.setCustomParameters({
    prompt: "select_account",
  });

  try {
    const result = await signInWithPopup(auth, provider);

    if (!result || !result.user) {
      throw new Error("Authentication failed: No user data returned.");
    }

    const user = result.user;
    const idToken = await user.getIdToken();
    loginUser(user, idToken);
  } catch (error) {
    console.error("Error during Google sign-in: ", error.message);
    errorMsgGoogleSignIn.textContent =
      "Google sign-in failed. Please try again.";
  }
}

// Function to sign up with Google authentication
async function authSignUpWithGoogle() {
  provider.setCustomParameters({
    prompt: "select_account",
  });

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const idToken = await user.getIdToken();
    loginUser(user, idToken);
  } catch (error) {
    console.error("Error during Google sign-up: ", error.message);
    errorMsgGoogleSignIn.textContent =
      "Google sign-up failed. Please try again.";
  }
}

// Function to sign in with email and password
async function authSignInWithEmail() {
  const email = emailInputEl.value.trim();
  const password = passwordInputEl.value.trim();

  if (!validateEmail(email)) {
    errorMsgEmail.textContent = "Invalid email format.";
    return;
  }

  if (!validatePassword(password)) {
    errorMsgPassword.textContent = "Password must be at least 6 characters.";
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    const idToken = await user.getIdToken();
    loginUser(user, idToken);
  } catch (error) {
    handleAuthError(error);
  }
}

// Function to create a new account with email and password
async function authCreateAccountWithEmail() {
  const email = emailInputEl.value.trim();
  const password = passwordInputEl.value.trim();

  if (!validateEmail(email)) {
    errorMsgEmail.textContent = "Invalid email format.";
    return;
  }

  if (!validatePassword(password)) {
    errorMsgPassword.textContent = "Password must be at least 6 characters.";
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await addNewUserToFirestore(user); // Assuming this function exists
    const idToken = await user.getIdToken();
    loginUser(user, idToken);
  } catch (error) {
    handleAuthError(error);
  }
}

// Function to reset password
async function resetPassword() {
  const emailToReset = emailForgotPasswordEl.value.trim();

  if (!validateEmail(emailToReset)) {
    errorMsgEmail.textContent = "Invalid email format.";
    return;
  }

  try {
    await sendPasswordResetEmail(auth, emailToReset);
    const resetFormView = document.getElementById("reset-password-view");
    const resetSuccessView = document.getElementById(
      "reset-password-confirmation-page"
    );

    resetFormView.style.display = "none";
    resetSuccessView.style.display = "block";
  } catch (error) {
    handleAuthError(error);
  }
}

// Function to log in the user
function loginUser(user, idToken) {
  fetch("/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    credentials: "same-origin",
  })
    .then((response) => {
      if (response.ok) {
        window.location.href = "/dashboard";
      } else {
        throw new Error("Failed to login");
      }
    })
    .catch((error) => {
      console.error("Error with Fetch operation: ", error);
      errorMsgGoogleSignIn.textContent = "Login failed. Please try again.";
    });
}

// Function to clear input fields
function clearInputField(field) {
  field.value = "";
}

function clearAuthFields() {
  clearInputField(emailInputEl);
  clearInputField(passwordInputEl);
}
