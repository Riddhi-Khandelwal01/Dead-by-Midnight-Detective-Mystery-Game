
/* =========================================
   1. GAME VARIABLES
========================================= */

// Initial game statistics
let moves = 40;
let lives = 3;
let score = 0;

// Store collected clues
let inventory = [];

// Store investigation history
let journal = [];

// Track whether the Study clue has been collected
let studyClueFound = false;


/* =========================================
   2. GET HTML ELEMENTS
========================================= */

// Main screens
const landingPage = document.getElementById("landingPage");
const storyPage = document.getElementById("storyPage");
const gamePage = document.getElementById("gamePage");

// Navigation buttons
const startButton = document.getElementById("startButton");
const enterMansion = document.getElementById("enterMansion");

// Room elements
const exploreStudy = document.getElementById("exploreStudy");
const roomContainer = document.getElementById("roomContainer");
const studyPanel = document.getElementById("studyPanel");

const inspectDesk = document.getElementById("inspectDesk");
const clueResult = document.getElementById("clueResult");
const backToRooms = document.getElementById("backToRooms");

// Statistics
const movesDisplay = document.getElementById("moves");
const livesDisplay = document.getElementById("lives");
const scoreDisplay = document.getElementById("score");

// Inventory elements
const inventoryButton = document.getElementById("inventoryButton");
const inventoryPanel = document.getElementById("inventoryPanel");
const inventoryList = document.getElementById("inventoryList");
const closeInventory = document.getElementById("closeInventory");

// Journal elements
const journalButton = document.getElementById("journalButton");
const journalPanel = document.getElementById("journalPanel");
const journalList = document.getElementById("journalList");
const closeJournal = document.getElementById("closeJournal");


/* =========================================
   3. UPDATE GAME STATISTICS
========================================= */

function updateStats() {

    movesDisplay.textContent = moves;

    livesDisplay.textContent = lives;

    scoreDisplay.textContent = score;

}


/* =========================================
   4. LANDING PAGE NAVIGATION
========================================= */

// Open story introduction
startButton.addEventListener("click", function() {

    landingPage.classList.add("hidden");

    storyPage.classList.remove("hidden");

});


// Enter the mansion
enterMansion.addEventListener("click", function() {

    storyPage.classList.add("hidden");

    gamePage.classList.remove("hidden");

    updateStats();

});


/* =========================================
   5. STUDY EXPLORATION
========================================= */

// Open the Study
exploreStudy.addEventListener("click", function() {

    roomContainer.classList.add("hidden");

    studyPanel.classList.remove("hidden");

});


// Inspect the desk and discover a clue
inspectDesk.addEventListener("click", function() {

    // Check whether the player has moves remaining
    if (moves <= 0) {

        clueResult.textContent =
            "You have no moves remaining!";

        return;

    }

    // Prevent collecting the same clue twice
    if (studyClueFound) {

        clueResult.textContent =
            "You have already collected this clue.";

        return;

    }

    // Clue discovered
    const clue = "Torn letter mentioning Eleanor's death";

    // Add clue to inventory
    inventory.push(clue);

    // Add discovery to journal
    journal.push("Discovered a torn letter in the Study.");

    // Update game statistics
    moves--;

    score += 10;

    // Mark the clue as collected
    studyClueFound = true;

    // Display discovery message
    clueResult.textContent =
        "CLUE FOUND: " + clue;

    // Update dashboard
    updateStats();

    // Disable inspection button
    inspectDesk.disabled = true;

});


// Return to room selection
backToRooms.addEventListener("click", function() {

    studyPanel.classList.add("hidden");

    roomContainer.classList.remove("hidden");

});


/* =========================================
   6. INVENTORY FUNCTIONALITY
========================================= */

// Display collected clues
inventoryButton.addEventListener("click", function() {

    // Clear previous list
    inventoryList.innerHTML = "";

    // Display each collected item
    inventory.forEach(function(item) {

        const listItem = document.createElement("li");

        listItem.textContent = item;

        inventoryList.appendChild(listItem);

    });

    inventoryPanel.classList.remove("hidden");

});


// Close inventory
closeInventory.addEventListener("click", function() {

    inventoryPanel.classList.add("hidden");

});


/* =========================================
   7. DETECTIVE JOURNAL
========================================= */

// Display investigation history
journalButton.addEventListener("click", function() {

    // Clear previous list
    journalList.innerHTML = "";

    // Display each journal entry
    journal.forEach(function(entry) {

        const listItem = document.createElement("li");

        listItem.textContent = entry;

        journalList.appendChild(listItem);

    });

    journalPanel.classList.remove("hidden");

});


// Close journal
closeJournal.addEventListener("click", function() {

    journalPanel.classList.add("hidden");

});


/* =========================================
   8. INITIALIZE GAME
========================================= */

// Display initial statistics
updateStats();

console.log("Dead by Midnight game loaded successfully!");
