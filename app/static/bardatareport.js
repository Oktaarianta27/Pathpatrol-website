// Function to fetch data from the Flask endpoint
async function fetchData() {
  try {
    const response = await fetch("/get_data_kerusakan");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();

    // Initialize counters
    let totalDamage = 0;
    let totalPothole = 0;
    let totalCrack = 0;
    let totalLongitudinal = 0;
    let totalTransverse = 0;
    let totalRevair = 0;

    // Process the data
    data.forEach((item) => {
      totalDamage++; // Count total damage

      // Count damage types
      if (item.damage_type === "Pothole") {
        totalPothole++;
      } else if (item.damage_type === "Aligator Crack") {
        totalCrack++;
      } else if (item.damage_type === "Longitudinal Crack") {
        totalLongitudinal++;
      } else if (item.damage_type === "Transverse Crack") {
        totalTransverse++;
      }

      // Count repair status
      if (item.repair_status === "completed") {
        totalRevair++;
      }
    });

    // Update the DOM with the data
    document.getElementById("totalDamage").innerText = totalDamage;
    document.getElementById("totalPothole").innerText = totalPothole;
    document.getElementById("totalCrack").innerText = totalCrack;
    document.getElementById("totalLongitudinal").innerText = totalLongitudinal;
    document.getElementById("totalTransverse").innerText = totalTransverse;
    document.getElementById("totalRevair").innerText = totalRevair;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

// Call the function to fetch data
fetchData();
