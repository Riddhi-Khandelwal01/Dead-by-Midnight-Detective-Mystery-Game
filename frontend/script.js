/* =========================================================
   DEAD BY MIDNIGHT - THE RAVENSCROFT CASE
   Complete frontend game logic.

   Data is loaded before this file:
     1. js/data.js     -> GAME_CONFIG, ROOMS, TIMELINE
     2. js/suspects.js -> SUSPECTS

   This file handles navigation, investigation, puzzles,
   questions, scoring, the clock, accusation and endings.
========================================================= */

"use strict";

/* ---------------------------------------------------------
   1. GAME STATE
--------------------------------------------------------- */

const state = {
    moves: GAME_CONFIG.startingMoves,
    lives: GAME_CONFIG.startingLives,
    score: GAME_CONFIG.startingScore,
    elapsedMinutes: 0,
    inventory: [],
    journal: [],
    inspectedObjects: new Set(),
    askedQuestions: new Set(),
    solvedPuzzles: new Set(),
    usedHints: new Set(),
    currentRoomId: null,
    selectedSuspectId: null,
    gameFinished: false
};

const clueIds = () => new Set(state.inventory.map(item => item.id));
const hasClue = id => clueIds().has(id);
const allCluesForRoomFound = room =>
    room.objects.every(object => hasClue(object.clue.id));

/* ---------------------------------------------------------
   2. HTML ELEMENTS
--------------------------------------------------------- */

const $ = id => document.getElementById(id);

const el = {
    landingPage: $("landingPage"),
    storyPage: $("storyPage"),
    gamePage: $("gamePage"),
    endingPage: $("endingPage"),

    startButton: $("startButton"),
    enterMansion: $("enterMansion"),
    playAgainButton: $("playAgainButton"),

    clock: $("clock"),
    moves: $("moves"),
    lives: $("lives"),
    score: $("score"),

    roomContainer: $("roomContainer"),
    roomPanel: $("roomPanel"),
    studyPanel: $("studyPanel"),
    roomTitle: $("roomTitle"),
    roomIntro: $("roomIntro"),
    objectList: $("objectList"),
    roomResult: $("roomResult"),
    roomBackButton: $("roomBackButton"),

    puzzleArea: $("puzzleArea"),
    puzzleTitle: $("puzzleTitle"),
    puzzleStory: $("puzzleStory"),
    puzzleQuestion: $("puzzleQuestion"),
    puzzleInput: $("puzzleInput"),
    submitPuzzle: $("submitPuzzle"),
    hintButton: $("hintButton"),
    puzzleHintText: $("puzzleHintText"),
    puzzleResult: $("puzzleResult"),

    inventoryButton: $("inventoryButton"),
    inventoryPanel: $("inventoryPanel"),
    inventoryList: $("inventoryList"),
    closeInventory: $("closeInventory"),

    journalButton: $("journalButton"),
    journalPanel: $("journalPanel"),
    journalList: $("journalList"),
    closeJournal: $("closeJournal"),

    suspectsButton: $("suspectsButton"),
    suspectsPanel: $("suspectsPanel"),
    suspectList: $("suspectList"),
    interrogationView: $("interrogationView"),
    suspectProfile: $("suspectProfile"),
    questionList: $("questionList"),
    answerBox: $("answerBox"),
    backToSuspects: $("backToSuspects"),
    closeSuspects: $("closeSuspects"),

    accuseButton: $("accuseButton"),
    accusationPanel: $("accusationPanel"),
    accusationContent: $("accusationContent"),
    closeAccusation: $("closeAccusation"),

    endingLabel: $("endingLabel"),
    endingTitle: $("endingTitle"),
    endingText: $("endingText"),
    endingTimeline: $("endingTimeline")
};

/* Room cards and their matching buttons are mapped by data id. */
const roomCardElements = {
    study: { card: $("studyCard"), button: $("exploreStudy") },
    library: { card: $("libraryCard"), button: $("exploreLibrary") },
    laboratory: { card: $("laboratoryCard"), button: $("exploreLaboratory") },
    secretRoom: { card: $("secretRoomCard"), button: $("exploreSecretRoom") }
};

/* ---------------------------------------------------------
   3. SMALL HELPERS
--------------------------------------------------------- */

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function addJournalEntry(entry) {
    state.journal.push(entry);
    renderJournal();
}

function showPanel(panelToShow) {
    [
        el.inventoryPanel,
        el.journalPanel,
        el.suspectsPanel,
        el.accusationPanel
    ].forEach(panel => panel.classList.add("hidden"));

    if (panelToShow) panelToShow.classList.remove("hidden");
}

function closeAllPanels() {
    showPanel(null);
}

function formatClock() {
    const total = (GAME_CONFIG.startTime.hour * 60) +
        GAME_CONFIG.startTime.minute + state.elapsedMinutes;
    const hour24 = Math.floor(total / 60) % 24;
    const minute = total % 60;
    const suffix = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;
    return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function updateStats() {
    el.moves.textContent = state.moves;
    el.lives.textContent = state.lives;
    el.score.textContent = state.score;
    el.clock.textContent = formatClock();

    if (state.moves <= 0 && !state.gameFinished) {
        el.moves.textContent = "0";
        el.accuseButton.disabled = false;
    }
}

function spendMove(actionName) {
    if (state.gameFinished) return false;

    if (state.moves <= 0) {
        updateStats();
        openAccusationPanel(true);
        return false;
    }

    state.moves -= 1;
    state.elapsedMinutes += GAME_CONFIG.minutesPerMove;
    updateStats();
    return true;
}

function getRoom(roomId) {
    return ROOMS.find(room => room.id === roomId);
}

function getPuzzle(puzzleId) {
    for (const room of ROOMS) {
        if (room.puzzle && room.puzzle.id === puzzleId) return room.puzzle;
    }
    return null;
}
function setMessage(element, message, className = "") {
    element.textContent = message;
    element.className = className;
}

function canUnlockRoom(room) {
    if (!room.unlockedBy) return true;

    const rule = room.unlockedBy;
    if (rule.type === "allCluesInRoom") {
        const requiredRoom = getRoom(rule.roomId);
        return Boolean(requiredRoom && allCluesForRoomFound(requiredRoom));
    }

    if (rule.type === "puzzleSolved") {
        return state.solvedPuzzles.has(rule.puzzleId);
    }

    return false;
}

function isRoomCleared(room) {
    const allObjectsFound = allCluesForRoomFound(room);
    const puzzleDone = !room.puzzle || state.solvedPuzzles.has(room.puzzle.id);
    return allObjectsFound && puzzleDone;
}

/* ---------------------------------------------------------
   4. SCREEN NAVIGATION
--------------------------------------------------------- */

el.startButton.addEventListener("click", () => {
    el.landingPage.classList.add("hidden");
    el.storyPage.classList.remove("hidden");
});

el.enterMansion.addEventListener("click", () => {
    el.storyPage.classList.add("hidden");
    el.gamePage.classList.remove("hidden");
    updateDashboard();
    addJournalEntry("You arrive at Ravenscroft Mansion at 10:30 PM. Eleanor is already dead.");
});

el.playAgainButton.addEventListener("click", () => {
    window.location.reload();
});

/* ---------------------------------------------------------
   5. ROOM DASHBOARD AND INVESTIGATION
--------------------------------------------------------- */

function updateRoomCards() {
    ROOMS.forEach(room => {
        const elements = roomCardElements[room.id];
        if (!elements) return;

        const unlocked = canUnlockRoom(room);
        const cleared = isRoomCleared(room);

        elements.button.disabled = !unlocked || state.gameFinished;
        elements.button.textContent = !unlocked
            ? "LOCKED"
            : (cleared ? "REVISIT" : "EXPLORE");

        elements.card.classList.toggle("locked", !unlocked);
        elements.card.classList.toggle("unlocked", unlocked && !cleared);
        elements.card.classList.toggle("cleared", cleared);
    });
}

function updateDashboard() {
    updateStats();
    updateRoomCards();

    // Suspects can be questioned as soon as the investigation begins.
    el.suspectsButton.disabled = state.gameFinished;

    // The player may accuse at any point, but weak evidence can lead
    // to an incorrect conclusion.
    el.accuseButton.disabled = state.gameFinished;
}

function openRoom(roomId) {
    if (state.gameFinished) return;

    const room = getRoom(roomId);
    if (!room || !canUnlockRoom(room)) return;

    state.currentRoomId = roomId;
    el.roomContainer.classList.add("hidden");
    el.studyPanel?.classList.add("hidden");
    el.roomPanel.classList.remove("hidden");

    el.roomTitle.textContent = room.name;
    el.roomIntro.textContent = room.intro;
    setMessage(el.roomResult, "");
    renderRoomObjects(room);
    renderPuzzle(room);
    updateRoomCards();
}

function renderRoomObjects(room) {
    el.objectList.innerHTML = "";

    room.objects.forEach(object => {
        const alreadyInspected = state.inspectedObjects.has(object.id);
        const button = document.createElement("button");

        button.type = "button";
        button.className = `object-button${alreadyInspected ? " inspected" : ""}`;
        button.disabled = alreadyInspected || state.gameFinished;

        button.innerHTML = `
            <span class="object-name">${escapeHTML(object.name)}</span>
            <span class="object-prompt">${escapeHTML(
                alreadyInspected
                    ? "Evidence collected. You may review it in your inventory."
                    : object.prompt
            )}</span>
            <span class="object-action">${alreadyInspected ? "INSPECTED" : "EXAMINE"}</span>
        `;

        button.addEventListener("click", () => inspectObject(room, object));
        el.objectList.appendChild(button);
    });
}

function inspectObject(room, object) {
    if (state.inspectedObjects.has(object.id) || state.gameFinished) return;

    if (!spendMove("inspect object")) {
        setMessage(el.roomResult, "You have no moves remaining.", "message-warning");
        return;
    }

    state.inspectedObjects.add(object.id);
    const clue = object.clue;

    state.inventory.push(clue);
    state.score += GAME_CONFIG.scoreRewards.clueFound;

    addJournalEntry(`Clue discovered in ${room.name}: ${clue.name}.`);

    setMessage(
        el.roomResult,
        `CLUE FOUND — ${clue.name}\n${clue.description}`,
        "clue-card"
    );

    renderRoomObjects(room);
    renderInventory();
    updateDashboard();

    if (allCluesForRoomFound(room)) {
        addJournalEntry(`Every clue in ${room.name} has been examined.`);
        updateRoomCards();
    }
}

function returnToRooms() {
    el.roomPanel.classList.add("hidden");
    el.roomContainer.classList.remove("hidden");
    state.currentRoomId = null;
    updateRoomCards();
}

Object.entries(roomCardElements).forEach(([roomId, elements]) => {
    elements.button.addEventListener("click", () => openRoom(roomId));
});

el.roomBackButton.addEventListener("click", returnToRooms);

/* ---------------------------------------------------------
   6. PUZZLES
--------------------------------------------------------- */

function renderPuzzle(room) {
    const puzzle = room.puzzle;

    if (!puzzle) {
        el.puzzleArea.classList.add("hidden");
        return;
    }

    el.puzzleArea.classList.remove("hidden");
    el.puzzleTitle.textContent = puzzle.title;
    el.puzzleStory.textContent = puzzle.story;
    el.puzzleQuestion.textContent = puzzle.question;
    el.puzzleInput.value = "";
    el.puzzleHintText.textContent = "";
    setMessage(el.puzzleResult, "");

    const solved = state.solvedPuzzles.has(puzzle.id);
    const cluesReady = !puzzle.requiresAllRoomClues || allCluesForRoomFound(room);

    el.puzzleInput.disabled = solved || !cluesReady || state.gameFinished;
    el.submitPuzzle.disabled = solved || !cluesReady || state.gameFinished;

    el.hintButton.disabled = solved || !cluesReady ||
        state.gameFinished || state.usedHints.has(puzzle.id);

    if (solved) {
        setMessage(
            el.puzzleResult,
            "PUZZLE SOLVED — " + puzzle.successMessage,
            "message-success"
        );
    } else if (!cluesReady) {
        setMessage(
            el.puzzleResult,
            "Examine every object in this room before attempting the puzzle.",
            "message-warning"
        );
    }
}

function normalizeAnswer(answer) {
    return answer.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function submitCurrentPuzzle() {
        const room = getRoom(state.currentRoomId);
    const puzzle = room && room.puzzle;

    if (!puzzle || state.solvedPuzzles.has(puzzle.id) || state.gameFinished) return;

    const answer = normalizeAnswer(el.puzzleInput.value);

    if (!answer) {
        setMessage(el.puzzleResult, "Enter an answer before submitting.", "message-warning");
        return;
    }

    const accepted = puzzle.acceptedAnswers.some(
        possible => normalizeAnswer(possible) === answer
    );

    if (accepted) {
        state.solvedPuzzles.add(puzzle.id);
        state.score += GAME_CONFIG.scoreRewards.puzzleSolved;

        addJournalEntry(`Puzzle solved: ${puzzle.title}. ${puzzle.successMessage}`);

        setMessage(
            el.puzzleResult,
            "CORRECT — " + puzzle.successMessage,
            "message-success"
        );

        renderPuzzle(room);
        updateDashboard();
        return;
    }

    state.lives -= GAME_CONFIG.lifeCosts.wrongPuzzleAnswer;

    addJournalEntry(`Incorrect answer to ${puzzle.title}. One life lost.`);
    updateStats();

    if (state.lives <= 0) {
        finishGame(
            false,
            "You have run out of lives. The truth remains buried beneath Ravenscroft Mansion."
        );
        return;
    }

    setMessage(el.puzzleResult, puzzle.failMessage, "message-danger");
    el.puzzleInput.value = "";
}

function usePuzzleHint() {
    const room = getRoom(state.currentRoomId);
    const puzzle = room && room.puzzle;

    if (!puzzle || state.solvedPuzzles.has(puzzle.id) ||
        state.usedHints.has(puzzle.id) || state.gameFinished) return;

    if (!allCluesForRoomFound(room)) {
        setMessage(
            el.puzzleResult,
            "Find every clue in this room before using the hint.",
            "message-warning"
        );
        return;
    }

    if (!spendMove("use hint")) return;

    state.usedHints.add(puzzle.id);
    el.puzzleHintText.textContent = "HINT: " + puzzle.hint;
    el.hintButton.disabled = true;

    addJournalEntry(`Used the hint for ${puzzle.title}.`);
}

el.submitPuzzle.addEventListener("click", submitCurrentPuzzle);

el.puzzleInput.addEventListener("keydown", event => {
    if (event.key === "Enter") submitCurrentPuzzle();
});

el.hintButton.addEventListener("click", usePuzzleHint);

/* ---------------------------------------------------------
   7. INVENTORY AND DETECTIVE JOURNAL
--------------------------------------------------------- */

function renderInventory() {
    el.inventoryList.innerHTML = "";

    if (state.inventory.length === 0) {
        const item = document.createElement("li");
        item.textContent = "No evidence collected yet.";
        el.inventoryList.appendChild(item);
        return;
    }

    state.inventory.forEach(clue => {
        const item = document.createElement("li");

        item.innerHTML = `
            <strong>${escapeHTML(clue.name)}</strong><br>
            ${escapeHTML(clue.description)}
        `;

        el.inventoryList.appendChild(item);
    });
}

function renderJournal() {
    el.journalList.innerHTML = "";

    if (state.journal.length === 0) {
        const item = document.createElement("li");
        item.textContent = "Your journal is empty.";
        el.journalList.appendChild(item);
        return;
    }

    state.journal.forEach((entry, index) => {
        const item = document.createElement("li");
        item.textContent = `${index + 1}. ${entry}`;
        el.journalList.appendChild(item);
    });
}

el.inventoryButton.addEventListener("click", () => {
    renderInventory();
    showPanel(el.inventoryPanel);
});

el.closeInventory.addEventListener("click", closeAllPanels);

el.journalButton.addEventListener("click", () => {
    renderJournal();
    showPanel(el.journalPanel);
});

el.closeJournal.addEventListener("click", closeAllPanels);

/* ---------------------------------------------------------
   8. SUSPECT PROFILES AND INTERROGATION
--------------------------------------------------------- */

function renderSuspectList() {
    el.suspectList.innerHTML = "";

    SUSPECTS.forEach(suspect => {
        const card = document.createElement("article");
        card.className = "suspect-card";

        const askedCount = suspect.questions.filter(
            q => state.askedQuestions.has(q.id)
        ).length;

        card.innerHTML = `
            <div class="suspect-avatar">${escapeHTML(suspect.initials)}</div>
            <h3 class="suspect-name">${escapeHTML(suspect.name)}</h3>
            <p class="suspect-role">${escapeHTML(suspect.role)}</p>
            <p class="suspect-age">Age: ${escapeHTML(suspect.age)}</p>
            <p class="suspect-description">${escapeHTML(suspect.description)}</p>
            <p class="suspect-status">
                ${askedCount} of ${suspect.questions.length} questions asked
            </p>
            <button type="button" class="suspect-open-button">
                INTERROGATE
            </button>
        `;

        card.querySelector("button").addEventListener(
            "click",
            () => openInterrogation(suspect.id)
        );

        el.suspectList.appendChild(card);
    });
}

function openSuspectsPanel() {
    renderSuspectList();
    el.suspectList.classList.remove("hidden");
    el.interrogationView.classList.add("hidden");
    showPanel(el.suspectsPanel);
}

function openInterrogation(suspectId) {
    const suspect = SUSPECTS.find(item => item.id === suspectId);
    if (!suspect) return;

    state.selectedSuspectId = suspectId;

    el.suspectList.classList.add("hidden");
    el.interrogationView.classList.remove("hidden");

    el.suspectProfile.innerHTML = `
        <div class="suspect-avatar">${escapeHTML(suspect.initials)}</div>
        <h3 class="suspect-name">${escapeHTML(suspect.name)}</h3>
        <p class="suspect-role">
            ${escapeHTML(suspect.role)} · Age ${escapeHTML(suspect.age)}
        </p>
        <p class="suspect-description">
            ${escapeHTML(suspect.description)}
        </p>
        <blockquote class="suspect-statement">
            “${escapeHTML(suspect.statement)}”
        </blockquote>
    `;

    renderQuestions(suspect);
    el.answerBox.innerHTML = "";
}

function renderQuestions(suspect) {
    el.questionList.innerHTML = "";

    suspect.questions.forEach(question => {
        const alreadyAsked = state.askedQuestions.has(question.id);
        const unlocked = !question.requiresClue ||
            hasClue(question.requiresClue);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "question-button";

        if (question.type === "confrontation") {
            button.classList.add("confrontation");
        }

        if (!unlocked) button.classList.add("locked");
        if (alreadyAsked) button.classList.add("asked");

        button.disabled = !unlocked || state.gameFinished;

        button.innerHTML = `
            <span>${escapeHTML(question.text)}</span>
            <span class="question-tag">
                ${alreadyAsked
                    ? "ASKED — REVIEW ANSWER"
                    : (unlocked ? question.type.toUpperCase() : "LOCKED — FIND EVIDENCE")}
            </span>
        `;

        button.addEventListener(
            "click",
            () => askQuestion(suspect, question)
        );

        el.questionList.appendChild(button);
    });
}

function askQuestion(suspect, question) {
    if (state.gameFinished) return;

    const firstTime = !state.askedQuestions.has(question.id);

    if (firstTime) {
        if (!spendMove("ask question")) {
            el.answerBox.textContent =
                "No moves remain. You must make your accusation.";
            return;
        }

        state.askedQuestions.add(question.id);
        state.score += GAME_CONFIG.scoreRewards.newQuestionAsked;

        addJournalEntry(
            `You questioned ${suspect.name}: ${question.text}`
        );
                if (question.journalNote) {
            addJournalEntry(question.journalNote);
        }
    }

    el.answerBox.innerHTML = `
        <p class="answer-speaker">${escapeHTML(suspect.name)}</p>
        <p class="answer-text">“${escapeHTML(question.answer)}”</p>
        ${question.exposesLie
            ? '<p class="lie-exposed-badge">A PREVIOUS STATEMENT HAS BEEN EXPOSED AS A LIE</p>'
            : ""}
    `;

    renderQuestions(suspect);
    updateStats();
}

el.suspectsButton.addEventListener("click", openSuspectsPanel);

el.backToSuspects.addEventListener("click", () => {
    renderSuspectList();
    el.interrogationView.classList.add("hidden");
    el.suspectList.classList.remove("hidden");
    state.selectedSuspectId = null;
});

el.closeSuspects.addEventListener("click", closeAllPanels);

/* ---------------------------------------------------------
   9. FINAL ACCUSATION
--------------------------------------------------------- */

function openAccusationPanel(forcedByNoMoves = false) {
    if (state.gameFinished) return;

    const foundKeyEvidence =
        hasClue("study_cufflink") &&
        hasClue("lab_folder") &&
        hasClue("secret_receipts");

    el.accusationContent.innerHTML = `
        <p class="accusation-warning">
            ${forcedByNoMoves
                ? "You have used all your moves. The investigation must end with an accusation."
                : "Choose carefully. A false accusation will end the investigation."}
        </p>

        <p class="accusation-evidence-note">
            ${foundKeyEvidence
                ? "Your inventory contains the cufflink, the scorched folder and the signed transfer receipts."
                : "Your evidence is incomplete. Review your clues before making a final decision."}
        </p>

        <div class="accusation-options">
            ${SUSPECTS.map(suspect => `
                <button type="button" class="accuse-card"
                    data-suspect-id="${escapeHTML(suspect.id)}">
                    <strong>${escapeHTML(suspect.name)}</strong>
                    <span>${escapeHTML(suspect.role)}</span>
                </button>
            `).join("")}
        </div>

        <div class="accusation-actions">
            <p id="selectedAccusation">
                Select the person you believe murdered Eleanor.
            </p>

            <button type="button" id="confirmAccusation"
                class="danger-button" disabled>
                CONFIRM ACCUSATION
            </button>
        </div>
    `;

    let selectedId = null;

    const cards = el.accusationContent.querySelectorAll(".accuse-card");
    const selectedText = $("selectedAccusation");
    const confirmButton = $("confirmAccusation");

    cards.forEach(card => {
        card.addEventListener("click", () => {
            cards.forEach(item => item.classList.remove("selected"));

            card.classList.add("selected");
            selectedId = card.dataset.suspectId;

            const suspect = SUSPECTS.find(
                item => item.id === selectedId
            );

            selectedText.textContent =
                `You have selected ${suspect.name}.`;

            confirmButton.disabled = false;
        });
    });

    confirmButton.addEventListener("click", () => {
        if (!selectedId) return;

        const enoughEvidence =
            hasClue("study_cufflink") &&
            hasClue("lab_folder") &&
            hasClue("secret_receipts") &&
            hasClue("secret_ledger");

        const correct = selectedId === "edward" && enoughEvidence;

        if (correct) {
            const unusedMoveBonus =
                state.moves * GAME_CONFIG.scoreRewards.perMoveLeft;

            state.score +=
                GAME_CONFIG.scoreRewards.correctAccusation +
                unusedMoveBonus;

            finishGame(
                true,
                "Edward Whitmore murdered Eleanor Ravenscroft. The evidence proves that he stole from their joint business accounts, feared exposure at midnight, and killed Eleanor to protect himself."
            );

        } else if (selectedId === "edward" && !enoughEvidence) {
            finishGame(
                false,
                "You named Edward Whitmore, but you could not support the accusation with the evidence required to prove his guilt. The case collapses in court."
            );

        } else {
            const accused = SUSPECTS.find(
                item => item.id === selectedId
            );

            finishGame(
                false,
                `You accused ${accused.name}. The evidence does not support that conclusion. The real murderer remains free, and the Ravenscroft case is closed as a failure.`
            );
        }
    });

    showPanel(el.accusationPanel);
}

el.accuseButton.addEventListener("click", () => {
    openAccusationPanel(false);
});

el.closeAccusation.addEventListener("click", closeAllPanels);

/* ---------------------------------------------------------
   10. ENDINGS
--------------------------------------------------------- */

function finishGame(won, message) {
    if (state.gameFinished) return;

    state.gameFinished = true;

    closeAllPanels();

    el.gamePage.classList.add("hidden");
    el.endingPage.classList.remove("hidden");

    el.endingPage.classList.toggle("ending-win", won);
    el.endingPage.classList.toggle("ending-lose", !won);

    el.endingLabel.textContent = won ? "CASE SOLVED" : "CASE CLOSED";

    el.endingTitle.textContent = won
        ? "THE TRUTH BEFORE MIDNIGHT"
        : "THE TRUTH REMAINS HIDDEN";

    el.endingTitle.classList.toggle("ending-win", won);
    el.endingTitle.classList.toggle("ending-lose", !won);

    el.endingText.textContent =
        `${message} Final score: ${state.score}. Time of final decision: ${formatClock()}.`;

    if (won) {
        el.endingTimeline.innerHTML = `
            <h3 class="timeline-heading">THE TRUE TIMELINE</h3>

            <div class="timeline">
                ${TIMELINE.map(item => `
                    <div class="timeline-item${item.time === "10:00 PM" ? " highlight" : ""}">
                        <span class="timeline-time">
                            ${escapeHTML(item.time)}
                        </span>

                        <span class="timeline-event">
                            ${escapeHTML(item.event)}
                        </span>
                    </div>
                `).join("")}
            </div>
        `;

    } else {
        el.endingTimeline.innerHTML = `
            <h3 class="timeline-heading">WHAT THE DETECTIVE MISSED</h3>

            <p class="reveal-item">
                The broken E.W. cufflink, Edward's hidden financial records
                and the signed fraudulent transfer receipts all pointed
                to Edward Whitmore.
            </p>

            <p class="reveal-item">
                Richard, Clara and Thomas each concealed a personal secret,
                but none of those secrets made them Eleanor's murderer.
            </p>
        `;
    }
}

/* ---------------------------------------------------------
   11. INITIAL SETUP
--------------------------------------------------------- */

function validateGameData() {
    if (!Array.isArray(ROOMS) || ROOMS.length !== 4) {
        throw new Error(
            "Game data error: exactly four rooms are required."
        );
    }

    if (!Array.isArray(SUSPECTS) || SUSPECTS.length !== 4) {
        throw new Error(
            "Suspect data error: exactly four suspects are required."
        );
    }

    if (!getRoom(GAME_CONFIG.startingRoomId)) {
        throw new Error(
            "Game data error: starting room does not exist."
        );
    }
}

function initializeGame() {
    validateGameData();

    // Hide the old one-room implementation. The generic room panel
    // now handles the Study and every room after it.
    el.studyPanel.classList.add("hidden");

    updateDashboard();
    renderInventory();
    renderJournal();

    console.log(`Game data loaded: ${ROOMS.length} rooms.`);
    console.log(`Suspect data loaded: ${SUSPECTS.length} suspects.`);
    console.log("Dead by Midnight game loaded successfully!");
}

initializeGame();