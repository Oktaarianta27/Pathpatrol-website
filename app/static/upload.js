import {
  db,
  doc,
  storage,
  ref,
  updateDoc,
  getDownloadURL,
  uploadBytes,
} from "./firebase-config.js";

document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll(".repair-form");
  console.log("Forms found:", forms.length); // Menampilkan jumlah form yang ditemukan
  if (forms.length > 0) {
    forms.forEach((form) => {
      console.log("Form element:", form);
      console.log("Form dataset:", form.dataset);
      if (!form.hasAttribute("data-listener-attached")) {
        console.log(
          "Preparing to add event listener for form with item ID:",
          form.dataset.itemId
        );
        form.addEventListener("submit", handleFormSubmit);
        form.setAttribute("data-listener-attached", "true"); // Tandai form sudah diberi event listener
        console.log(
          "Event listener added to form with item ID:",
          form.dataset.itemId
        );
      }
    });
  }
});
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

async function handleFormSubmit(event) {
  event.preventDefault();
  console.log("Form submitted:", event.target);

  try {
    const formElement = event.target;

    // Debug: Pastikan form terdeteksi
    console.log("Form submitted:", formElement);

    // Cari elemen input file dalam form
    const fileInput = formElement.querySelector("input[type='file']");
    if (!fileInput) {
      showMessage("File input not found in the form.", "error");
      console.error("File input not found in the form.");
      return;
    }

    const file = fileInput.files[0];
    if (!file) {
      showMessage("No file selected.", "error");
      console.error("No file selected.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      showMessage("Invalid file type. Please select an image file.", "error");
      console.error("Invalid file type:", file.type);
      return;
    }

    // Ambil itemId dari atribut data-item-id form
    const itemId = formElement.dataset.itemId;
    if (!itemId) {
      showMessage("Item ID not found in form dataset.", "error");
      console.error("Item ID not found in form dataset.");
      return;
    }

    // Debug: Informasi file dan item ID
    console.log("Selected file:", file);
    console.log("Item ID:", itemId);

    // Upload file ke Firebase Storage
    console.log("Uploading file to Firebase Storage...");
    const storageRef = ref(storage, `Repair/${itemId}/${file.name}`);
    await uploadBytes(storageRef, file);

    // Dapatkan URL unduhan file
    const fileUrl = await getDownloadURL(storageRef);
    console.log("File uploaded successfully. File URL:", fileUrl);

    // Perbarui dokumen di Firestore
    console.log("Updating Firestore document...");
    const detectionRef = doc(db, "road_detections", itemId);
    await updateDoc(detectionRef, {
      proof_image_url: fileUrl,
      repair_status: "completed",
    });

    // Beri tahu pengguna bahwa upload berhasil
    showMessage("Proof of repair uploaded successfully.", "success");
    formElement.reset();
  } catch (error) {
    // Tangani kesalahan
    console.error("Error during file upload or Firestore update:", error);
    showMessage("An error occurred. Please try again.", "error");
  }
}
window.handleFormSubmit = handleFormSubmit;
