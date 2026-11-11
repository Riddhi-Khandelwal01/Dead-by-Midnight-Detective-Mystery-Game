
const startButton = document.getElementById("startButton");

const landingPage = document.getElementById("landingPage");

const storyPage = document.getElementById("storyPage");

// Open the story when the player clicks Start
startButton.addEventListener("click", function() {

    landingPage.classList.add("hidden");

    storyPage.classList.remove("hidden");

});

// Get the mansion dashboard
const gamePage = document.getElementById("gamePage");

// Get the Enter Mansion button
const enterMansion = document.getElementById("enterMansion");

// Open the game dashboard
enterMansion.addEventListener("click", function() {

    storyPage.classList.add("hidden");

    gamePage.classList.remove("hidden");

});// Store collected items and investigation history
let inventory = [];
let journal = [];

inspectDesk.addEventListener("click", function() {

    const clue = "Torn letter mentioning Eleanor's death";

    // Add clue to inventory
    inventory.push(clue);

    // Record discovery in journal
    journal.push("Discovered a torn letter in the Study.");

    clueResult.textContent =
        "CLUE FOUND: " + clue;

    inspectDesk.disabled = true;

});
// Get the Study elements
const exploreStudy = document.getElementById("exploreStudy");
const studyPanel = document.getElementById("studyPanel");

const inspectDesk = document.getElementById("inspectDesk");
const clueResult = document.getElementById("clueResult");

const backToRooms = document.getElementById("backToRooms");

// Open the Study
exploreStudy.addEventListener("click", function() {

    studyPanel.classList.remove("hidden");

    document.querySelector(".room-container").classList.add("hidden");

});

// Inspect the desk and discover a clue
inspectDesk.addEventListener("click", function() {

    clueResult.textContent =
        "CLUE FOUND: A torn letter mentioning Eleanor's death ten years ago.";

    inspectDesk.disabled = true;

});

// Return to the room selection
backToRooms.addEventListener("click", function() {

    studyPanel.classList.add("hidden");

    document.querySelector(".room-container").classList.remove("hidden");

});
// Get inventory elements
const inventoryButton = document.getElementById("inventoryButton");
const inventoryPanel = document.getElementById("inventoryPanel");
const inventoryList = document.getElementById("inventoryList");
const closeInventory = document.getElementById("closeInventory");

// Get journal elements
const journalButton = document.getElementById("journalButton");
const journalPanel = document.getElementById("journalPanel");
const journalList = document.getElementById("journalList");
const closeJournal = document.getElementById("closeJournal");

// Display inventory
inventoryButton.addEventListener("click", function() {

    inventoryList.innerHTML = "";

    inventory.forEach(function(item) {

        const li = document.createElement("li");
        li.textContent = item;

        inventoryList.appendChild(li);

    });

    inventoryPanel.classList.remove("hidden");

});

// Close inventory
closeInventory.addEventListener("click", function() {

    inventoryPanel.classList.add("hidden");

});

// Display journal
journalButton.addEventListener("click", function() {

    journalList.innerHTML = "";

    journal.forEach(function(entry) {

        const li = document.createElement("li");
        li.textContent = entry;

        journalList.appendChild(li);

    });

    journalPanel.classList.remove("hidden");

});

// Close journal
closeJournal.addEventListener("click", function() {

    journalPanel.classList.add("hidden");

});