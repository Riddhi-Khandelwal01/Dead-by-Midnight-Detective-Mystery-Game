/* =========================================================
   DEAD BY MIDNIGHT - THE RAVENSCROFT CASE
   File: frontend/js/data.js

   This file stores the GAME DATA only:
     1. GAME_CONFIG  - the starting values and rules
     2. ROOMS        - 4 rooms, each with objects, clues, puzzles
     3. TIMELINE     - the true murder timeline

   There is NO game logic here. Other files will read this
   data and make the game work.

   Suspects and endings are in separate files (coming next).
========================================================= */


/* =========================================================
   1. GAME CONFIGURATION AND RULES

   Rules (written clearly so the player is never
   punished unpredictably):

   MOVES
   - Inspecting an object for the FIRST time ...... 1 move
   - Asking a NEW interrogation question .......... 1 move
   - Using a puzzle hint .......................... 1 move
   - Travelling between rooms ..................... FREE
   - Revisiting rooms, re-reading clues, opening
     inventory / journal / suspect profiles ....... FREE

   LIVES
   - A wrong puzzle answer costs 1 life (no moves).
   - At 0 lives the game is over.

   CLOCK
   - Every move advances the clock by 2 minutes.
   - 40 moves x 2 minutes = 80 minutes, so the clock
     reaches 11:50 PM when moves run out.
   - Then the player must make the final accusation
     before the 11:59 PM deadline.

   ACCUSATION
   - A wrong accusation ends the game (failure ending).
========================================================= */

const GAME_CONFIG = {

    // Starting values
    startingMoves: 40,
    startingLives: 3,
    startingScore: 0,

    // The detective arrives at 10:30 PM (22:30 in 24-hour time)
    startTime: { hour: 22, minute: 30 },
    minutesPerMove: 2,
    deadlineText: "11:59 PM",

    // Which room the player begins in
    startingRoomId: "study",

    // How many moves each action costs
    moveCosts: {
        inspectObject: 1,
        askQuestion: 1,
        useHint: 1,
        travel: 0,
        revisitOrReview: 0
    },

    // How many lives each mistake costs
    lifeCosts: {
        wrongPuzzleAnswer: 1
    },

    // Points the player earns
    scoreRewards: {
        clueFound: 10,
        puzzleSolved: 25,
        newQuestionAsked: 5,
        correctAccusation: 100,
        perMoveLeft: 2          // bonus for each unused move at the end
    }
};


/* =========================================================
   2. ROOMS

   Every room has:
     id          - unique name used by JavaScript
     name        - text shown to the player
     description - short text on the room card
     intro       - text shown when the player enters
     unlockedBy  - the rule that opens the room
     objects     - things the player can inspect (each hides 1 clue)
     puzzle      - a puzzle (or null if the room has none)

   unlockedBy can be:
     null                                  -> open from the start
     { type: "allCluesInRoom", roomId }    -> unlocks when every clue
                                              in that room is found
     { type: "puzzleSolved", puzzleId }    -> unlocks when that
                                              puzzle is solved

   Clue fields:
     id           - unique id (used in inventory and accusation)
     name         - short title shown in the inventory
     description  - full text shown when found
     evidenceType - "motive", "presence", "deception" or "fraud"
     isKey        - true if this is one of the strongest clues

   Puzzle answers are stored in lowercase with no spaces,
   dots or colons. Later, the game will clean the player's
   typing the same way before comparing.
========================================================= */

const ROOMS = [

    /* ---------------------------------------------------
       ROOM 1: THE STUDY (starting room)
       Purpose: start the suspicion and introduce the
       financial mystery.
    --------------------------------------------------- */
    {
        id: "study",
        name: "THE STUDY",
        description: "Where Eleanor Ravenscroft was found.",
        intro: "Eleanor's body has been covered with a sheet. " +
               "The room has been left exactly as it was found.",
        unlockedBy: null,

        objects: [
            {
                id: "desk",
                name: "Eleanor's desk",
                prompt: "Papers lie scattered across the desk. " +
                        "One page has been torn in half.",
                clue: {
                    id: "study_letter",
                    name: "Torn letter from Eleanor",
                    description: "Half a page in Eleanor's handwriting: " +
                        "'...the transfers cannot be explained. I have " +
                        "given him every chance to confess. At midnight, " +
                        "before the family, I shall name the person who " +
                        "has been robbing this firm...' The rest of the " +
                        "page is missing.",
                    evidenceType: "motive",
                    isKey: false
                }
            },
            {
                id: "carpet",
                name: "The rug beneath the desk",
                prompt: "Something glints where the rug is rumpled.",
                clue: {
                    id: "study_cufflink",
                    name: "Broken cufflink marked E.W.",
                    description: "A gold cufflink engraved with the " +
                        "initials E.W. The fastening is snapped, as if " +
                        "it was torn off during a struggle.",
                    evidenceType: "presence",
                    isKey: true
                }
            },
            {
                id: "fireplace",
                name: "The fireplace",
                prompt: "The ashes in the grate look recently disturbed.",
                clue: {
                    id: "study_burned",
                    name: "Partially burned business document",
                    description: "Charred scraps of a handwritten account " +
                        "sheet, written in violet ink. A list of money " +
                        "transfers survives, along with the heading " +
                        "'Ravenscroft & Whitmore - Joint Account'. " +
                        "The ashes are still faintly warm.",
                    evidenceType: "fraud",
                    isKey: false
                }
            }
        ],

        puzzle: null
    },


    /* ---------------------------------------------------
       ROOM 2: THE LIBRARY
       Unlocked after the Study investigation.
       Purpose: establish Edward's motive.
    --------------------------------------------------- */
    {
        id: "library",
        name: "THE LIBRARY",
        description: "Among the books lie forgotten secrets.",
        intro: "Tall shelves rise into the shadows. Someone has " +
               "recently disturbed the books.",
        unlockedBy: { type: "allCluesInRoom", roomId: "study" },
        unlockHint: "Find every clue in the Study to unlock this room.",

        objects: [
            {
                id: "looseBook",
                name: "A loose book on the top shelf",
                prompt: "One book sits crooked, as if it was hidden " +
                        "in a hurry.",
                clue: {
                    id: "library_letters",
                    name: "Hidden letters between Eleanor and Edward",
                    description: "A bundle of letters written in violet " +
                        "ink. Edward begs Eleanor for 'a little more " +
                        "time to put the accounts right.' Eleanor's " +
                        "replies grow colder: 'Time is exactly what you " +
                        "have already taken.' The last letter is dated " +
                        "this week.",
                    evidenceType: "motive",
                    isKey: false
                }
            },
            {
                id: "hollowBook",
                name: "A hollow book",
                prompt: "One heavy book sounds strangely empty when " +
                        "you tap it.",
                clue: {
                    id: "library_agreement",
                    name: "Concealed partnership agreement",
                    description: "The agreement of Ravenscroft & Whitmore. " +
                        "A marked clause says that if either partner is " +
                        "proved guilty of fraud, he loses his entire " +
                        "share and all control of the business.",
                    evidenceType: "motive",
                    isKey: true
                }
            },
            {
                id: "readingTable",
                name: "The reading table",
                prompt: "A pile of unopened envelopes lies under a lamp.",
                clue: {
                    id: "library_debts",
                    name: "Edward's creditor notices",
                    description: "Final demands from three creditors, all " +
                        "addressed to Edward Whitmore. Together they " +
                        "total more than 90,000 pounds. His own finances " +
                        "are in ruins, though he dresses like a rich man.",
                    evidenceType: "motive",
                    isKey: false
                }
            }
        ],

        // Solving this puzzle unlocks the Laboratory.
        puzzle: {
            id: "library_puzzle",
            title: "THE KEY BOX",
            story: "On the lowest shelf sits a brass box with a clock " +
                   "dial. Eleanor's note is pinned to it: " +
                   "'Open me at the hour I promised to speak the truth.'",
            question: "At what hour did Eleanor promise to reveal the truth?",
            requiresAllRoomClues: true,
            acceptedAnswers: ["midnight", "12", "1200", "12am", "1200am",
                              "12midnight", "twelve"],
            hint: "Read the torn letter from the Study again.",
            successMessage: "The dial clicks. Inside the box lies the " +
                            "key to the Laboratory.",
            failMessage: "The dial will not turn. A bell rings faintly " +
                         "somewhere in the house. You lose a life."
        }
    },


    /* ---------------------------------------------------
       ROOM 3: THE LABORATORY
       Unlocked after the Library puzzle.
       Purpose: challenge Edward's account of the night.
       (Ravenscroft & Whitmore make fine inks and papers,
       so the family firm kept a laboratory.)
    --------------------------------------------------- */
    {
        id: "laboratory",
        name: "THE LABORATORY",
        description: "Something suspicious happened here tonight.",
        intro: "Glass jars of ink and dye line the walls. This is " +
               "where the family firm once tested its inks and papers.",
        unlockedBy: { type: "puzzleSolved", puzzleId: "library_puzzle" },
        unlockHint: "Solve the puzzle in the Library to unlock this room.",

        objects: [
            {
                id: "basin",
                name: "The washing basin and waste bin",
                prompt: "The basin is still wet.",
                clue: {
                    id: "lab_struggle",
                    name: "Evidence of a struggle",
                    description: "A torn white shirt cuff lies in the bin, " +
                        "missing its cufflink. A stained towel hangs by " +
                        "the basin and a glass beaker is smashed on the " +
                        "floor. Someone cleaned up here in a hurry after " +
                        "a fight.",
                    evidenceType: "presence",
                    isKey: false
                }
            },
            {
                id: "incinerator",
                name: "The incinerator drawer",
                prompt: "A drawer is half open. It smells of smoke.",
                clue: {
                    id: "lab_folder",
                    name: "Scorched leather folder",
                    description: "A scorched leather folder with 'E.W.' " +
                        "stamped in gold. Its torn corner fits the " +
                        "charred scraps from the Study fireplace exactly. " +
                        "The burned document came out of this folder. " +
                        "This was no accident: it was hidden after the " +
                        "murder.",
                    evidenceType: "deception",
                    isKey: true
                }
            },
            {
                id: "microscope",
                name: "The microscope bench",
                prompt: "A slide has been left under the microscope.",
                clue: {
                    id: "lab_trace",
                    name: "Ink trace analysis",
                    description: "Under the microscope, the violet ink on " +
                        "Edward's hidden letters matches the ink on the " +
                        "burned account sheet. The paper watermark is the " +
                        "same. Both were written by the same hand.",
                    evidenceType: "fraud",
                    isKey: false
                }
            }
        ],

        // Solving this puzzle unlocks the Secret Room.
        puzzle: {
            id: "laboratory_puzzle",
            title: "THE HIDDEN PANEL",
            story: "Behind a cabinet is a panel with two letter dials. " +
                   "A message is scratched into the wood: 'Enter the " +
                   "initials engraved on the broken object found " +
                   "beneath Eleanor's desk.'",
            question: "Which two initials are engraved on the broken " +
                      "cufflink?",
            requiresAllRoomClues: true,
            acceptedAnswers: ["ew"],
            hint: "Check your inventory for the cufflink from the Study.",
            successMessage: "The panel slides open and reveals a narrow " +
                            "staircase. The Secret Room is open.",
            failMessage: "The panel stays shut and the dials grind. " +
                         "You lose a life."
        }
    },


    /* ---------------------------------------------------
       ROOM 4: THE SECRET ROOM
       Unlocked after the Laboratory puzzle.
       Purpose: motive, deception and the final connection.
    --------------------------------------------------- */
    {
        id: "secretRoom",
        name: "THE SECRET ROOM",
        description: "A room that was never meant to be found.",
        intro: "A tiny room, lit by a single dusty lamp. Eleanor " +
               "kept her most dangerous secrets here.",
        unlockedBy: { type: "puzzleSolved", puzzleId: "laboratory_puzzle" },
        unlockHint: "Solve the puzzle in the Laboratory to unlock this room.",

        objects: [
            {
                id: "writingSlope",
                name: "The writing slope",
                prompt: "A leather book lies on the sloping desk.",
                clue: {
                    id: "secret_ledger",
                    name: "Eleanor's private financial ledger",
                    description: "In Eleanor's tidy hand: fourteen months " +
                        "of missing money. 186,000 pounds was taken from " +
                        "the joint account in small transfers, each one " +
                        "just below the audit limit. Beside every entry " +
                        "she wrote a date and a single tick.",
                    evidenceType: "fraud",
                    isKey: false
                }
            },
            {
                id: "strongbox",
                name: "The iron strongbox",
                prompt: "The strongbox is unlocked and full of papers.",
                clue: {
                    id: "secret_receipts",
                    name: "Fraudulent transfer receipts",
                    description: "Bank receipts for transfers into accounts " +
                        "held by 'A. Marlowe' and 'H. Grey'. Both names " +
                        "are false. Every transfer was authorised with " +
                        "the signature of Edward Whitmore.",
                    evidenceType: "fraud",
                    isKey: true
                }
            },
            {
                id: "sealedNote",
                name: "A note under the lamp",
                prompt: "A note in Eleanor's handwriting is propped " +
                        "against the lamp.",
                clue: {
                    id: "secret_instructions",
                    name: "Eleanor's final written instructions",
                    description: "'If I cannot speak at midnight, give " +
                        "the ledger and these receipts to the detective. " +
                        "Thomas holds my letter to you and will see that " +
                        "it reaches you by half past ten. Do not let " +
                        "Edward Whitmore learn that I have them.'",
                    evidenceType: "motive",
                    isKey: false
                }
            }
        ],

        puzzle: null
    }
];


/* =========================================================
   3. THE TRUE MURDER TIMELINE
   This is what really happened. It is shown in the
   correct ending. It must never change.
========================================================= */

const TIMELINE = [
    {
        time: "8:00 PM",
        event: "All four suspects arrive at Ravenscroft Mansion."
    },
    {
        time: "8:30 PM",
        event: "Eleanor announces that she has discovered financial " +
               "misconduct."
    },
    {
        time: "9:00 PM",
        event: "Richard argues with Eleanor."
    },
    {
        time: "9:20 PM",
        event: "Clara discovers a hidden family letter."
    },
    {
        time: "9:35 PM",
        event: "Thomas receives an envelope from Eleanor."
    },
    {
        time: "9:45 PM",
        event: "Edward secretly enters the Study."
    },
    {
        time: "10:00 PM",
        event: "Edward kills Eleanor to stop her exposing his fraud."
    },
    {
        time: "10:10 PM",
        event: "Edward burns a document, cleans himself in the " +
               "Laboratory and creates a misleading timeline."
    },
    {
        time: "10:20 PM",
        event: "Edward leaves the mansion."
    },
    {
        time: "10:30 PM",
        event: "The detective receives Eleanor's letter and arrives."
    },
    {
        time: "11:59 PM",
        event: "Final accusation deadline."
    }
];


/* Quick message in the Console to confirm the file loaded. */
console.log("Game data loaded: " + ROOMS.length + " rooms.");