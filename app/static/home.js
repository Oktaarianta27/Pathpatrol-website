import { db, collection, getDocs } from "./firebase-config.js";

let roadData = []; // Variabel global untuk menyimpan data dari server
let currentPage = 1;
const rowsPerPage = 20;

async function fetchUserDetections() {
  const gallery = document.getElementById("imageGallery");
  gallery.innerHTML = "<tr><td colspan='9'>Memuat Data...</td></tr>";

  try {
    const response = await fetch("/get_data_kerusakan");
    const data = await response.json();

    if (data.length > 0) {
      roadData = data; // Simpan data dari server ke variabel global
      displayPage(currentPage); // Tampilkan halaman pertama
    } else {
      gallery.innerHTML = "<tr><td colspan='8'>No data available</td></tr>";
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    gallery.innerHTML = "<tr><td colspan='9'>Failed to load data</td></tr>";
  }
}

fetchUserDetections();

function displayPage(page) {
  const tableBody = document.getElementById("imageGallery");
  tableBody.innerHTML = ""; // Reset tabel

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, roadData.length);

  for (let i = startIndex; i < endIndex; i++) {
    const row = roadData[i];
    const tableRow = `
      <tr>
        <td>${i + 1}</td>
        <td><img src="${
          row.image_url
        }" alt="Road Damage" style="max-width: 100px;" onclick="openImageModal('${
      row.image_url
    }', 'Gambar kerusakan jalan ${i + 1}')"></td>
        <td>
          <a href="https://www.google.com/maps?q=${row.latitude},${
      row.longitude
    }" target="_blank" style="text-decoration: none; color: inherit;"> 
            ${row.latitude}, ${row.longitude}
          </a>
        </td>

        <td>${row.damage_type}</td>
        <td>${new Date(row.timestamp).toLocaleString()}</td>
        <td>${row.bbox_height} cm x ${row.bbox_width} cm</td>
        <td>${row.Tingkat || "Belum Ditentukan"}</td>
        <td>${row.status || "Belum Ditentukan"}</td>
        <td>
            ${
              row.proof_image_url
                ? `<img src="${
                    row.proof_image_url
                  }" alt="Proof Image" style="max-width: 100px;" onclick="openImageModal('${
                    row.proof_image_url
                  }', 'Bukti kerusakan ${i + 1}')">`
                : "Belum Ada Bukti"
            }
        </td>
      </tr>
    `;
    tableBody.innerHTML += tableRow;
  }

  const pageInfo = document.getElementById("pageInfo");
  pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(
    roadData.length / rowsPerPage
  )}`;

  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled =
    currentPage === Math.ceil(roadData.length / rowsPerPage);
}
function changePage(direction) {
  currentPage += direction;
  displayPage(currentPage);
}

document
  .getElementById("prevPage")
  .addEventListener("click", () => changePage(-1));
document
  .getElementById("nextPage")
  .addEventListener("click", () => changePage(1));

function openImageModal(imageSrc, captionText) {
  const modal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");
  const caption = document.getElementById("caption");

  modal.style.display = "block";
  modalImage.src = imageSrc;
  caption.textContent = captionText;
}
window.openImageModal = openImageModal;
// Function to close the image modal
function closeImageModal() {
  const modal = document.getElementById("imageModal");
  modal.style.display = "none";
}
window.closeImageModal = closeImageModal;

// Toggles the hamburger menu with click
document.addEventListener("DOMContentLoaded", function () {
  var hamburger = document.querySelector(".hamburger");
  var closeBtn = document.querySelector(".closebtn");
  var navRight = document.getElementById("navbarRight");

  console.log(hamburger, closeBtn, navRight); // Cek apakah elemen ada

  if (hamburger && navRight) {
    hamburger.addEventListener("click", function () {
      navRight.classList.toggle("active");
    });
  }

  if (closeBtn && navRight) {
    closeBtn.addEventListener("click", function () {
      navRight.classList.remove("active");
    });
  }

  const dropBtn = document.getElementById("dropBtn");
  if (dropBtn) {
    const dropdownContent = document.querySelector(".dropdown-content");

    dropBtn.addEventListener("click", function () {
      dropdownContent.classList.toggle("show");
    });
  }
});
