import {
  db,
  auth,
  doc,
  getDoc,
  onSnapshot,
  collection,
} from "./firebase-config.js";

// DOM Elements
const arrow = document.querySelectorAll(".arrow");
const sidebar = document.querySelector(".sidebar");
const sidebarBtn = document.querySelector(".bx-menu");
const navLinks = document.querySelectorAll(".nav-links li a");

// Google Map Variables
let map;
const markers = {};

// Initialize Sidebar and Menu Toggles
function initializeSidebar() {
  arrow.forEach((arrowElement) => {
    arrowElement.addEventListener("click", (e) => {
      const arrowParent = e.target.parentElement.parentElement;
      arrowParent.classList.toggle("showMenu");
    });
  });

  sidebarBtn.addEventListener("click", () => {
    sidebar.classList.toggle("close");
  });
}

// Set Active State for Navigation Links
function setActiveState() {
  const currentPage = localStorage.getItem("currentPage");
  navLinks.forEach((link) => {
    const page = link.getAttribute("data-page");
    const parentLi = link.parentElement;

    if (page === currentPage) {
      parentLi.classList.add("active");
    } else {
      parentLi.classList.remove("active");
    }
  });
}

// Event Listeners for Navigation Links
function setupNavLinks() {
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const page = link.getAttribute("data-page");
      localStorage.setItem("currentPage", page);
      setActiveState();
    });
  });
}

// Initialize Google Map
async function initMap() {
  try {
    const { Map } = await google.maps.importLibrary("maps");
    map = new Map(document.getElementById("map"), {
      center: { lat: -8.701172, lng: 115.205084 },
      zoom: 12,
      mapId: "45efbe0fea7e33d3",
    });
  } catch (error) {
    console.error("Error initializing Google Map:", error);
  }
}

// Fetch Data from Firestore and Handle Real-Time Updates
function setupFirestoreListeners() {
  const imagesCollection = collection(db, "road_detections");
  onSnapshot(imagesCollection, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const docId = change.doc.id;
      const data = change.doc.data();

      if (change.type === "added") {
        addMarker(map, docId, data);
      } else if (change.type === "modified") {
        updateMarker(docId, data);
      } else if (change.type === "removed") {
        removeMarker(docId);
      }
    });
  });
}

// Add Marker to Google Map
async function addMarker(map, docId, data) {
  try {
    const position = { lat: data.latitude, lng: data.longitude };
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    let marker;

    if (AdvancedMarkerElement) {
      marker = new AdvancedMarkerElement({
        position: position,
        map: map,
      });
    } else {
      marker = new google.maps.Marker({
        position: position,
        map: map,
      });
    }

    const infoWindowContent = `
      <div style="text-align: center;">
        <img src="${
          data.image_url
        }" alt="Road Damage" style="width:200px; height:auto;"/>
        <p>Address: ${data.address}</p>
        <p>Timestamp: ${new Date(
          data.timestamp.seconds * 1000
        ).toLocaleString()}</p>
      </div>
    `;
    const infoWindow = new google.maps.InfoWindow({
      content: infoWindowContent,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });

    markers[docId] = marker;
  } catch (error) {
    console.error("Error adding marker:", error);
  }
}

// Update Marker Position
function updateMarker(docId, data) {
  if (markers[docId]) {
    markers[docId].setPosition({ lat: data.latitude, lng: data.longitude });
  }
}

// Remove Marker from Google Map
function removeMarker(docId) {
  if (markers[docId]) {
    markers[docId].setMap(null);
    delete markers[docId];
  }
}

// Update Greeting with Username from Firestore
function updateGreeting() {
  const greetingText = document.getElementById("greeting-text");

  if (greetingText) {
    auth.onAuthStateChanged((user) => {
      if (user) {
        const userRef = doc(db, "admin", user.uid);

        getDoc(userRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              const username = data.username || "Pengguna";
              greetingText.textContent = `Halo, ${username}`;
            } else {
              console.error("No user data found in Firestore.");
            }
          })
          .catch((error) => {
            console.error("Error fetching user data from Firestore:", error);
          });
      } else {
        greetingText.textContent = "Halo, Pengguna";
      }
    });
  } else {
    console.error("greetingText element not found!");
  }
}

// Initialize the Application
function initializeApp() {
  initializeSidebar();
  setupNavLinks();
  setActiveState();
  initMap();
  setupFirestoreListeners();
  updateGreeting();
}

// Run the application when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", initializeApp);
