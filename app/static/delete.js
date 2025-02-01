import {
  db,
  auth,
  doc,
  getDoc,
  storage,
  deleteField,
  deleteObject,
  ref,
  deleteDoc,
  updateDoc,
} from "./firebase-config.js";

// Function to display confirmation dialog
function showDialog(onConfirm) {
  const dialog = document.getElementById("confirmDialog");
  const overlay = document.getElementById("overlay");

  if (!dialog || !overlay) {
    showMessage("Dialog elements not found on the page.", "error");
    return;
  }

  // Show dialog and overlay
  dialog.style.display = "block";
  overlay.style.display = "block";

  // "Yes" button click
  document.getElementById("confirmYes").onclick = () => {
    dialog.style.display = "none";
    overlay.style.display = "none";
    onConfirm(); // Execute the callback (delete the record)
  };

  // "No" button click
  document.getElementById("confirmNo").onclick = () => {
    dialog.style.display = "none";
    overlay.style.display = "none";
  };
}

// Function to show custom message modal
function showMessage(message, type) {
  const modal = document.getElementById("customMessageModal");
  const modalMessage = document.getElementById("customModalMessage");
  const overlay = document.getElementById("customModalOverlay");

  if (!modal || !modalMessage || !overlay) {
    console.error("Modal elements not found on the page.");
    return;
  }

  modalMessage.textContent = message;
  modal.style.display = "block";
  overlay.style.display = "block";

  document.getElementById("customCloseModal").onclick = () => {
    modal.style.display = "none";
    overlay.style.display = "none";
  };
}

async function deleteRecord(itemId) {
  showDialog(async () => {
    try {
      // Reference to Firestore document
      const docRef = doc(db, "road_detections", itemId);
      const docSnapshot = await getDoc(docRef);
      const imageUrl = docSnapshot.data()?.image_url;

      // If an image URL exists, delete the image from Firebase Storage
      if (imageUrl) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      }

      // Optionally, delete the 'image_url' field from the Firestore document
      await updateDoc(docRef, {
        image_url: deleteField(),
      });

      // Delete the Firestore document
      await deleteDoc(docRef);

      // Remove the row from the HTML table (if it exists)success
      const rowToDelete = document.querySelector(
        `tr[data-item-id='${itemId}']`
      );
      if (rowToDelete) {
        rowToDelete.remove();
      }

      showMessage("The data has been successfully deleted.", "success");
    } catch (error) {
      console.error("Error deleting record:", error);
      showMessage("Failed to delete record.", "error");
    }
  });
}

window.deleteRecord = deleteRecord;
