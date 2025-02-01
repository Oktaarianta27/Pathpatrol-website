import { db, auth, doc, getDoc, updateDoc } from "./firebase-config.js";

// Function to fetch user profile from Firestore
function getUserProfile(uid) {
  const userRef = doc(db, "admin", uid);

  getDoc(userRef)
    .then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Display current profile data
        document.getElementById("username").textContent =
          data.username || "N/A";
        document.getElementById("fullname").textContent =
          data.fullname || "N/A";
        document.getElementById("email").textContent = data.email || "N/A";
        document.getElementById("phone").textContent = data.phone || "N/A";
        document.getElementById("profile-img").src =
          data.profil_url || "default-profile.png";
      } else {
        console.error("No such document in Firestore!");
      }
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
    });
}

// Enable editing when the Edit button is clicked
document.getElementById("edit-btn").addEventListener("click", function () {
  // Show Save button, hide Edit button
  document.getElementById("save-btn").style.display = "inline-block";
  document.getElementById("edit-btn").style.display = "none";

  // Convert displayed data into editable input fields
  const username = document.getElementById("username");
  const fullname = document.getElementById("fullname");
  const phone = document.getElementById("phone");

  // Replace span with input elements to enable editing
  username.innerHTML = `<input type="text" value="${username.textContent}">`;
  fullname.innerHTML = `<input type="text" value="${fullname.textContent}">`;
  phone.innerHTML = `<input type="text" value="${phone.textContent}">`;
});

// Handle the save operation with confirmation
document.getElementById("save-btn").addEventListener("click", function () {
  // Show confirmation dialog before saving the changes
  document.getElementById("confirm-dialog").style.display = "flex";
});

// Handle confirm dialog "Yes" click
document.getElementById("confirm-yes").addEventListener("click", function () {
  const user = auth.currentUser; // Get the current logged-in user

  if (user) {
    // Get the new values from the input fields
    const newUsername = document
      .getElementById("username")
      .querySelector("input").value;
    const newFullname = document
      .getElementById("fullname")
      .querySelector("input").value;
    const newPhone = document
      .getElementById("phone")
      .querySelector("input").value;

    // Update the profile in Firestore
    const userRef = doc(db, "admin", user.uid);
    updateDoc(userRef, {
      username: newUsername,
      fullname: newFullname,
      phone: newPhone,
    })
      .then(() => {
        // Update the displayed values
        document.getElementById("username").textContent = newUsername;
        document.getElementById("fullname").textContent = newFullname;
        document.getElementById("phone").textContent = newPhone;

        // Hide Save button, show Edit button again
        document.getElementById("save-btn").style.display = "none";
        document.getElementById("edit-btn").style.display = "inline-block";

        // Close the confirmation dialog
        document.getElementById("confirm-dialog").style.display = "none";
        console.log("Profile updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating profile: ", error);
      });
  } else {
    console.error("No user is signed in.");
  }
});

// Handle confirm dialog "No" click
document.getElementById("confirm-no").addEventListener("click", function () {
  // Close the confirmation dialog without saving
  document.getElementById("confirm-dialog").style.display = "none";
});

// Fetch user profile when page loads
auth.onAuthStateChanged((user) => {
  if (user) {
    // If user is logged in, fetch and display the profile
    getUserProfile(user.uid);
  } else {
    console.error("User not signed in.");
  }
});
