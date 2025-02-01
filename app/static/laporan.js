// Fetch data and populate the table
let roadsData = []; // Variabel global untuk menyimpan data dari server
let currentPages = 1;
const rowsPerPages = 10;

// Fetch data and populate the table
async function fetchDetections() {
  const gallery = document.getElementById("imageGallery");
  gallery.innerHTML = "<tr><td colspan='12'>Memuat Data...</td></tr>";

  try {
    const response = await fetch("/get_data_kerusakan");
    const data = await response.json();

    if (data.length > 0) {
      roadsData = data; // Menyimpan seluruh data di roadsData
      displayPages(currentPages); // Tampilkan halaman pertama
    } else {
      gallery.innerHTML = "<tr><td colspan='12'>No data available</td></tr>";
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    gallery.innerHTML = "<tr><td colspan='12'>Failed to load data</td></tr>";
  }
}

fetchDetections();

function displayPages(pages) {
  const tableBody = document.getElementById("imageGallery");
  tableBody.innerHTML = ""; // Reset table

  const startIndex = (pages - 1) * rowsPerPages;
  const endIndex = Math.min(startIndex + rowsPerPages, roadsData.length);

  console.log(`Displaying data from index ${startIndex} to ${endIndex}`);

  for (let i = startIndex; i < endIndex; i++) {
    const item = roadsData[i];
    const tableRow = createTableRow(item, i);
    tableBody.innerHTML += tableRow;
  }

  setupEventListeners();
  updatePaginationInfo(pages);
  updatePaginationButtons(pages);
}

function updatePaginationInfo(currentPages) {
  const pageInfo = document.getElementById("pageInfo");
  const totalPages = Math.ceil(roadsData.length / rowsPerPages);
  pageInfo.textContent = `Page ${currentPages} of ${totalPages}`;
}

function updatePaginationButtons(currentPages) {
  const totalPages = Math.ceil(roadsData.length / rowsPerPages);
  const prevPageButton = document.getElementById("prevPage");
  const nextPageButton = document.getElementById("nextPage");

  // Menonaktifkan tombol 'Previous' jika berada di halaman pertama
  prevPageButton.disabled = currentPages === 1;

  // Menonaktifkan tombol 'Next' jika berada di halaman terakhir
  nextPageButton.disabled = currentPages === totalPages;
}

function changePage(direction) {
  const totalPages = Math.ceil(roadsData.length / rowsPerPages);
  currentPages += direction;

  // Membatasi currentPages agar tidak keluar dari rentang halaman yang valid
  if (currentPages < 1) {
    currentPages = 1;
  } else if (currentPages > totalPages) {
    currentPages = totalPages;
  }

  displayPages(currentPages);
}

document.getElementById("prevPage").addEventListener("click", () => {
  console.log("Previous button clicked");
  changePage(-1);
});

document.getElementById("nextPage").addEventListener("click", () => {
  console.log("Next button clicked");
  changePage(1);
});

// Function to add a new record to the table
function createTableRow(item, index) {
  console.log("Creating form for item ID:", item.id);
  return `
    <tr>
      <td>${index + 1}</td>
      <td>${item.id_perangkat}</td>
      <td>
        <img src="${
          item.image_url
        }" alt="Road Damage" style="max-width: 100px;" 
             onclick="openImageModal('${
               item.image_url
             }', 'Gambar kerusakan jalan ${index + 1}')">
      </td>
      <td>
        <a href="https://www.google.com/maps?q=${item.latitude},${
    item.longitude
  }" target="_blank">
          ${item.latitude}, ${item.longitude}
        </a>
      </td>

      <td>${item.damage_type}</td>
      <td>${new Date(item.timestamp).toLocaleString()}</td>
      <td>${item.bbox_height} cm x ${item.bbox_width} cm</td>
      <td>
        ${createTingkatSelect(item.Tingkat, item.id)}
      </td>
      <td>
        ${createStatusSelect(item.status, item.id)}
      </td>
      <td>
        ${createRepairForm(item.id)}
      </td>
      <td>
        ${createProofImageCell(item.proof_image_url, index)}
      </td>
      <td>
        <button onclick="deleteRecord('${
          item.id
        }')" style="background: none; border: none; cursor: pointer; color:rgb(255, 0, 47); font-size: 30px;">
          <i class='bx bxs-trash-alt'></i>
        </button>
      </td>
    </tr>
  `;
}
window.createTableRow = createTableRow;

function createTingkatSelect(selectedTingkat, itemId) {
  return `
    <select class="tingkat-select" data-item-id="${itemId}">
      <option value="">Pilih</option>
      <option value="rendah" ${
        selectedTingkat === "rendah" ? "selected" : ""
      }>Rendah</option>
      <option value="sedang" ${
        selectedTingkat === "sedang" ? "selected" : ""
      }>Sedang</option>
      <option value="tinggi" ${
        selectedTingkat === "tinggi" ? "selected" : ""
      }>Tinggi</option>
    </select>
  `;
}

function createStatusSelect(selectedStatus, itemId) {
  return `
    <select class="status-select" data-item-id="${itemId}">
      <option value="">Pilih</option>
      <option value="pengecekan" ${
        selectedStatus === "pengecekan" ? "selected" : ""
      }>Pengecekan</option>
      <option value="pengerjaan" ${
        selectedStatus === "pengerjaan" ? "selected" : ""
      }>Pengerjaan</option>
      <option value="selesai" ${
        selectedStatus === "selesai" ? "selected" : ""
      }>Selesai</option>
    </select>
  `;
}

function createRepairForm(itemId) {
  console.log("Creating repair form for item ID:", itemId);
  return `
    <form class="repair-form" enctype="multipart/form-data" data-item-id="${itemId}">
      <label class="custom-file-upload">
        <input type="file" id="repairImage" name="file" required>
        Pilih File
      </label>
      <button type="submit">Upload</button>
    </form>
  `;
}

function createProofImageCell(proofImageUrl, index) {
  if (proofImageUrl) {
    return `<img src="${proofImageUrl}" alt="Proof Image" style="max-width: 100px;" 
               onclick="openImageModal('${proofImageUrl}', 'Bukti kerusakan ${
      index + 1
    }')">`;
  }
  return "Belum Ada Bukti";
}

function setupEventListeners() {
  const tableBody = document.getElementById("imageGallery");

  // Cek apakah form sudah diberi event listener sebelumnya
  const formsInGallery = tableBody.querySelectorAll(".repair-form");
  formsInGallery.forEach((form) => {
    // Hanya tambahkan listener jika form belum diberi listener
    if (!form.hasAttribute("data-listener-attached")) {
      form.addEventListener("submit", handleFormSubmit);
      form.setAttribute("data-listener-attached", "true");
      console.log(
        "Event listener added to form with item ID:",
        form.dataset.itemId
      );
    }
  });

  // Hapus listener sebelumnya untuk dropdown
  document.querySelectorAll(".tingkat-select").forEach((select) => {
    select.removeEventListener("change", handleSelectChange);
    select.addEventListener("change", handleSelectChange);
  });

  document.querySelectorAll(".status-select").forEach((select) => {
    select.removeEventListener("change", handleSelectChange);
    select.addEventListener("change", handleSelectChange);
  });
}

async function handleSelectChange(event) {
  const itemId = event.target.dataset.itemId;
  const newTingkat = document.querySelector(
    `.tingkat-select[data-item-id="${itemId}"]`
  ).value;
  const newStatus = document.querySelector(
    `.status-select[data-item-id="${itemId}"]`
  ).value;

  await updateDocument(itemId, {
    Tingkat: newTingkat,
    status: newStatus,
  });
}

//function to open the image modal
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

// Function to show the modal with a custom message
function showModal(message, type) {
  const modal = document.getElementById("statusModal");
  const modalMessage = document.getElementById("modalMessage");

  modalMessage.textContent = message;
  modal.style.display = "block";

  // Add classes based on success or error
  if (type === "success") {
    modalMessage.style.color = "green";
  } else if (type === "error") {
    modalMessage.style.color = "red";
  }
}
// Function to close the modal
function closeModal() {
  const modal = document.getElementById("statusModal");
  modal.style.display = "none";
}
// Close the modal when the user clicks anywhere outside of it
window.onclick = function (event) {
  const modal = document.getElementById("statusModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// Function to update status via API request
async function updateDocument(id, updates) {
  try {
    const response = await fetch(`update_data/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update document: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.id) {
      showModal("Document updated successfully!", "success");
    } else {
      const errorMessage = data.error || "Unknown error occurred";
      throw new Error(`Error updating document: ${errorMessage}`);
    }
  } catch (error) {
    console.error("Error updating document:", error);
    showModal("Failed to update document: " + error.message, "error");
  }
}
// Fungsi untuk mengurutkan tabel berdasarkan kolom yang diklik
function sortTable(columnIndex) {
  const table = document.querySelector(".roadDataTable"); // Dapatkan tabel
  const rows = Array.from(table.rows).slice(1); // Ambil semua baris selain header

  let isNumeric = columnIndex === 2 || columnIndex === 6; // Tentukan apakah kolom berisi data numerik (misalnya koordinat atau waktu)
  console.log(rows); // Lihat data yang ada di dalam rows sebelum dan sesudah pengurutan

  // Sorting berdasarkan kolom
  rows.sort((rowA, rowB) => {
    const cellA = rowA.cells[columnIndex].textContent.trim();
    const cellB = rowB.cells[columnIndex].textContent.trim();

    if (isNumeric) {
      // Untuk kolom numerik (misalnya, koordinat atau waktu)
      return parseFloat(cellA) - parseFloat(cellB);
    } else {
      // Untuk kolom non-numerik (misalnya, nama atau perangkat)
      return cellA.localeCompare(cellB);
    }
  });
  // Setelah data diurutkan, tambahkan baris ke tabel
  rows.forEach((row) => table.appendChild(row));
}
//function for pdf download
async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("landscape", "mm", "a4");

  // Set document title
  doc.setFontSize(18);
  doc.text("Road Damage Report", 105, 10, null, null, "center");

  // Prepare table data (excluding image URLs for now)
  const tableData = [];
  const images = []; // Array to store the images

  // Fetch all images and store them
  for (let item of roadsData) {
    const imageUrl = item.image_url;
    if (imageUrl) {
      const imgData = await fetchImage(imageUrl);
      images.push(imgData); // Store the image data
    } else {
      images.push(null); // No image
    }
  }

  // Prepare table data with image references
  roadsData.forEach((item, index) => {
    tableData.push([
      index + 1, // No
      item.latitude + ", " + item.longitude, // Coordinates
      item.damage_type, // Damage Type
      new Date(item.timestamp).toLocaleString(), // Time
      item.bbox_height + " cm x " + item.bbox_width + " cm", // Dimensions
      item.Tingkat, // Tingkat
      images[index], // Image data (from previously fetched images)
    ]);
  });

  // Create table column titles
  const tableColumns = [
    "No",
    "Coordinates",
    "Damage Type",
    "Time",
    "Dimensions",
    "Tingkat",
    "Image",
  ];

  // Add the table to the PDF
  doc.autoTable({
    head: [tableColumns],
    body: tableData,
    startY: 20,
    margin: { top: 30 },
    theme: "striped",
    styles: {
      halign: "center",
      fontSize: 10,
    },
    columnStyles: {
      6: { cellWidth: 20 }, // Control image column width
    },
    didDrawCell: (data) => {
      // Insert image in the table cells (image data in column 6)
      if (data.column.index === 6 && data.cell.raw) {
        const imgData = data.cell.raw; // Get image data from the table data array

        if (imgData) {
          // Insert the image into the PDF cell
          doc.addImage(
            imgData,
            "JPEG",
            data.cell.x + 1,
            data.cell.y + 1,
            20,
            20
          );
        }
      }
    },
  });

  // Save the PDF
  doc.save("road_damage_report.pdf");
}

// Function to fetch the image and return base64 data
async function fetchImage(imageUrl) {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const reader = new FileReader();

  return new Promise((resolve) => {
    reader.onloadend = function () {
      resolve(reader.result); // Resolve with base64 image data
    };
    reader.readAsDataURL(blob);
  });
}
