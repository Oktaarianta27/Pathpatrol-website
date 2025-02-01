// Fetch data and populate the table
async function fetchDetections() {
  const gallery = document.getElementById("imageGallery");
  gallery.innerHTML = "<tr><td colspan='11'>Memuat Data...</td></tr>";

  try {
    const response = await fetch("/get_data_kerusakan");
    const data = await response.json();

    gallery.innerHTML = "";

    if (data.length > 0) {
      data.forEach((item, index) => {
        const itemId = item.id || item.documentId;

        if (!itemId) {
          console.error("Item ID is undefined:", item);
          return;
        }

        // Membuat baris tabel
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${item.id_perangkat}</td>
          <td><img src="${
            item.image_url
          }" alt="Road Damage" style="max-width: 100px;" onclick="openImageModal('${
          item.image_url
        }', 'Gambar kerusakan jalan ${index + 1}')"></td>
          <td>${item.latitude}, ${item.longitude}</td>
          <td>${item.damage_type}</td>
          <td>${new Date(item.timestamp).toLocaleString()}</td>
          <td>${item.bbox_height} cm x ${item.bbox_width} cm</td>
          <td>
            <select class="tingkat-select" data-item-id="${itemId}">
            <option value="">Pilih</option>
              <option value="rendah" ${
                item.Tingkat === "rendah" ? "selected" : ""
              }>Rendah</option>
              <option value="sedang" ${
                item.Tingkat === "sedang" ? "selected" : ""
              }>Sedang</option>
              <option value="tinggi" ${
                item.Tingkat === "tinggi" ? "selected" : ""
              }>Tinggi</option>
            </select>
          </td>
          <td>
            <select class="status-select" data-item-id="${itemId}">
            <option value="">Pilih</option>
              <option value="pengecekan" ${
                item.status === "pengecekan" ? "selected" : ""
              }>Pengecekan</option>
              <option value="pengerjaan" ${
                item.status === "pengerjaan" ? "selected" : ""
              }>Pengerjaan</option>
              <option value="selesai" ${
                item.status === "selesai" ? "selected" : ""
              }>Selesai</option>
            </select>
          </td>
          <td>
            <form id="repairForm" class="repair-form" enctype="multipart/form-data" data-item-id='${itemId}'>
              <label class="custom-file-upload">
                <input type="file" id="repairImage" name="file" required>
                Pilih File
              </label>
              <button type="submit">Upload</button>
            </form>
          </td>
          <td>
                ${
                  item.proof_image_url
                    ? `<img src="${
                        item.proof_image_url
                      }" alt="Proof Image" style="max-width: 100px;" onclick="openImageModal('${
                        item.proof_image_url
                      }', 'Bukti kerusakan ${index + 1}')">`
                    : "Belum Ada Bukti"
                }
            </td>
          <td>
            <button onclick="deleteRecord('${itemId}')" style="background: none; border: none; cursor: pointer; color:rgb(255, 0, 47); font-size: 30px;">
              <i class='bx bxs-trash-alt'></i>
            </button>
          </td>
          </td>
        `;
        gallery.appendChild(row);

        const tingkatSelect = row.querySelector(".tingkat-select");
        const statusSelect = row.querySelector(".status-select");

        // Listener untuk tingkat
        tingkatSelect.addEventListener("change", async (event) => {
          const newTingkat = event.target.value;
          const newStatus = statusSelect.value; // Ambil status terkini
          await updateDocument(itemId, {
            Tingkat: newTingkat,
            status: newStatus,
          });
        });

        // Listener untuk status
        statusSelect.addEventListener("change", async (event) => {
          const newStatus = event.target.value;
          const newTingkat = tingkatSelect.value; // Ambil tingkat terkini
          await updateDocument(itemId, {
            Tingkat: newTingkat,
            status: newStatus,
          });
        });
      });
    } else {
      gallery.innerHTML = "<tr><td colspan='11'>No data available</td></tr>";
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    gallery.innerHTML = "<tr><td colspan='11'>Failed to load data</td></tr>";
  }
}
fetchDetections();

// Function to open the image modal
function openImageModal(imageSrc, captionText) {
  const modal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");
  const caption = document.getElementById("caption");

  modal.style.display = "block";
  modalImage.src = imageSrc;
  caption.textContent = captionText;
}
// Function to close the image modal
function closeImageModal() {
  const modal = document.getElementById("imageModal");
  modal.style.display = "none";
}

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
// Function to delete data
// async function deleteRecord(id) {
//   if (!id || typeof id !== "string" || id.trim() === "") {
//     alert("ID dokumen tidak valid.");
//     return;
//   }

//   console.log(`Attempting to delete record with ID: ${id}`);

//   // Show confirmation dialog
//   showDialog(async () => {
//     try {
//       const response = await fetch("/delete/" + id, {
//         method: "DELETE",
//       });

//       if (!response.ok) {
//         throw new Error(`Gagal menghapus data: ${response.statusText}`);
//       }

//       // Check if response is empty before attempting to parse it
//       const responseText = await response.text();
//       const data = responseText ? JSON.parse(responseText) : {};

//       if (data.success) {
//         console.log("Document deleted successfully");
//         alert(data.success); // Show success message from API response
//         fetchDetections(); // Refresh data after deletion
//       } else {
//         throw new Error(data.error || "Gagal menghapus data");
//       }
//     } catch (error) {
//       console.error("Error deleting record:", error);
//       alert("Gagal menghapus data: " + error.message);
//     }
//   });
// }

// // Function to display confirmation dialog
// function showDialog(onConfirm) {
//   const dialog = document.getElementById("confirmDialog");
//   const overlay = document.getElementById("overlay");

//   if (!dialog || !overlay) {
//     alert("Dialog elemen tidak ditemukan di halaman.");
//     return;
//   }

//   // Tampilkan dialog dan overlay
//   dialog.style.display = "block";
//   overlay.style.display = "block";

//   // Klik tombol "Ya"
//   document.getElementById("confirmYes").onclick = () => {
//     dialog.style.display = "none";
//     overlay.style.display = "none";
//     onConfirm(); // Jalankan callback jika "Ya" diklik
//   };

//   // Klik tombol "Tidak"
//   document.getElementById("confirmNo").onclick = () => {
//     dialog.style.display = "none";
//     overlay.style.display = "none";
//   };
// }

// Loop through each row and add event listener for the form within that row
document.querySelectorAll(".repair-form").forEach((form) => {
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const id = this.getAttribute("data-id"); // Ambil id dari atribut data
    if (!id) {
      alert("No ID provided for the upload.");
      return;
    }

    const formData = new FormData(this); // Collect data from the form

    try {
      const response = await fetch(`/upload_data/${id}`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok && data.image_url) {
        alert(`File uploaded successfully! Image URL: ${data.image_url}`);
      } else {
        console.error("Upload failed:", data.error || response.statusText);
        alert("Error: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    }
  });
});

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

async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "landscape",
  });

  // Dapatkan tabel HTML
  const table = document.querySelector(".roadDataTable");
  const rows = Array.from(table.rows);

  // Siapkan data untuk AutoTable
  const headers = Array.from(rows[0].querySelectorAll("th"))
    .map((th, index) =>
      th.textContent.trim() === "Hapus" || th.textContent.trim() === "Action"
        ? null
        : th.textContent.trim()
    )
    .filter((header) => header !== null);

  const data = rows.slice(1).map((row) => {
    return Array.from(row.cells)
      .map((cell, index) => {
        // Mengecualikan kolom Action dan Hapus
        if (index === 2) {
          // Kolom "Image"
          const imgElement = cell.querySelector("img");
          return imgElement ? "Image" : ""; // Ganti dengan teks placeholder jika gambar ada
        }
        if (headers[index] === "Status") {
          // Kolom "Status" - Ambil nilai yang dipilih dari dropdown
          const dropdown = cell.querySelector("select");
          return dropdown ? dropdown.value : cell.textContent.trim(); // Ambil nilai yang dipilih
        }
        return headers[index] === undefined ? null : cell.textContent.trim();
      })
      .filter((cell) => cell !== null); // Hilangkan nilai null
  });

  // Menambahkan AutoTable dengan lebar kolom dinamis dan margin yang sesuai
  let startY = 20;

  doc.autoTable({
    head: [headers],
    body: data,
    startY: startY, // Mulai di posisi Y
    margin: { top: 10, left: 10, right: 10, bottom: 10 },
    styles: {
      fontSize: 10,
      cellPadding: 3,
      halign: "center",
      valign: "middle",
    },
    columnStyles: {
      2: {
        // Kolom gambar
        cellWidth: "auto",
      },
    },
    didDrawCell: function (data) {
      if (data.column.index === 2 && data.cell.raw) {
        // Kolom "Image"
        const imgElement = rows[data.row.index].cells[2].querySelector("img");
        if (imgElement) {
          const base64Img = imgElement.src;

          // Tentukan ukuran gambar (5 cm = 50 mm)
          const imgWidth = 50; // Lebar gambar dalam mm (5 cm)
          const imgHeight = 50; // Tinggi gambar dalam mm (5 cm)

          // Sesuaikan lebar dan tinggi gambar agar sesuai dengan ukuran yang ditentukan
          doc.addImage(
            base64Img,
            "JPEG",
            data.cell.x + 2,
            data.cell.y + 2,
            imgWidth,
            imgHeight
          );
        }
      }
    },
    // Update startY untuk posisi berikutnya
    didDrawPage: function () {
      startY = doc.autoTable.previous.finalY + 10; // Menentukan posisi Y setelah tabel
    },
  });

  // Simpan PDF setelah selesai
  doc.save("table-data-with-images.pdf");
}
