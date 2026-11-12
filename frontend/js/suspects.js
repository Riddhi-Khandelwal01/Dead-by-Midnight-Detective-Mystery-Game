/* =========================================================
   DEAD BY MIDNIGHT - THE RAVENSCROFT CASE
   File: frontend/js/suspects.js

   This file stores the SUSPECT DATA only:
     - SUSPECTS : 4 profiles, each with 3 interrogation questions

   There is NO game logic here. Later files will read this
   data to show profiles and run interrogations.

   Question types:
     "general"        - always available to the player
     "confrontation"  - unlocks only when the player has
                        collected the clue named in
                        requiresClue

   Every requiresClue value is a clue id from data.js:
     study_letter, study_cufflink, lab_folder ... etc.

   Note: this file deliberately does NOT say who the
   murderer is. The final answer is checked later, in the
   accusation and endings files.

   Story note: Edward left the mansion at 10:20 PM. He
   returned when the detective summoned all four suspects.
========================================================= */

const SUSPECTS = [

    /* ---------------------------------------------------
       SUSPECT 1: RICHARD RAVENSCROFT (Eleanor's husband)
       Lie: he denied arguing with Eleanor.
       Truth: they argued at 9:00 PM. He is not the killer.
    --------------------------------------------------- */
    {
        id: "richard",
        name: "Richard Ravenscroft",
        initials: "RR",
        role: "Eleanor's husband",
        age: 58,
        description: "A proud, restless man who has lived in his " +
                     "wife's shadow for twenty years. He keeps " +
                     "glancing at the door as he talks.",
        statement: "I loved my wife. We had no quarrel tonight. " +
                   "I spent the evening alone in the smoking room.",
        lie: "He claimed there was no argument, but he argued " +
             "with Eleanor at 9:00 PM.",

        questions: [
            {
                id: "richard_q1",
                type: "general",
                requiresClue: null,
                text: "Where were you at ten o'clock tonight?",
                answer: "In the smoking room, with a glass of brandy " +
                        "and my own thoughts. No, nobody saw me. " +
                        "A man is allowed to be alone in his own house.",
                journalNote: "Richard says he was alone in the " +
                             "smoking room at 10 PM. No witness."
            },
            {
                id: "richard_q2",
                type: "general",
                requiresClue: null,
                text: "How would you describe your marriage?",
                answer: "Quiet. Eleanor ran the house, the money and " +
                        "the family. I was... permitted to attend. " +
                        "Still, I would never have harmed her.",
                journalNote: "Richard calls the marriage 'quiet'. He " +
                             "resents that Eleanor controlled the money."
            },
            {
                id: "richard_q3",
                type: "confrontation",
                requiresClue: "study_letter",
                text: "Eleanor planned to name someone at midnight. " +
                      "Did you quarrel with her about it?",
                answer: "...Very well. At nine o'clock we argued. I " +
                        "asked if she was changing her will. She only " +
                        "said, 'You will learn what you are worth at " +
                        "midnight.' I lied because I knew how it " +
                        "would look. But I never touched her.",
                journalNote: "Richard admits he argued with Eleanor " +
                             "at 9 PM, afraid of losing his " +
                             "inheritance. His lie is exposed, but " +
                             "nothing links him to the Study.",
                exposesLie: true
            }
        ]
    },


    /* ---------------------------------------------------
       SUSPECT 2: CLARA RAVENSCROFT (Eleanor's daughter)
       Lie: she denied entering the Study.
       Truth: she entered at about 10:15 PM, found her mother
       dead and ran. She saw Edward near the Laboratory stairs.
    --------------------------------------------------- */
    {
        id: "clara",
        name: "Clara Ravenscroft",
        initials: "CR",
        role: "Eleanor's daughter",
        age: 27,
        description: "Sharp-eyed and guarded. She and her mother " +
                     "argued often, and her eyes are red from " +
                     "crying.",
        statement: "I was in my bedroom all evening. I never went " +
                   "near the Study tonight.",
        lie: "She claimed she never entered the Study, but she " +
             "went in at about 10:15 PM and found her mother dead.",

        questions: [
            {
                id: "clara_q1",
                type: "general",
                requiresClue: null,
                text: "What were you doing at ten o'clock?",
                answer: "I was in my room. I had a headache and the " +
                        "door was closed. I heard nothing at all.",
                journalNote: "Clara says she was in her bedroom at " +
                             "10 PM and heard nothing."
            },
            {
                id: "clara_q2",
                type: "general",
                requiresClue: null,
                text: "Is it true you found something in the house " +
                      "earlier tonight?",
                answer: "At twenty past nine I found a letter hidden " +
                        "in my mother's writing box. It was in my " +
                        "grandfather's hand. It says the house and " +
                        "the fortune pass to me, and that Father has " +
                        "no claim to either. I told no one.",
                journalNote: "Clara found a hidden family letter at " +
                             "9:20 PM. Eleanor's estate goes to " +
                             "Clara, and Richard has no claim. " +
                             "(Richard does not know.)"
            },
            {
                id: "clara_q3",
                type: "confrontation",
                requiresClue: "study_cufflink",
                text: "Someone struggled in the Study and left a " +
                      "cufflink behind. Were you in that room?",
                answer: "...Yes. I went in at about a quarter past " +
                        "ten. I heard a noise and found Mother on " +
                        "the floor. I covered her with a sheet and " +
                        "ran. I was terrified. As I fled, I saw " +
                        "Edward hurrying away from the Laboratory " +
                        "stairs, pulling on his coat. He did not " +
                        "look at me.",
                journalNote: "Clara admits she entered the Study at " +
                             "about 10:15 PM and covered Eleanor's " +
                             "body. She saw Edward near the " +
                             "Laboratory stairs, putting on his " +
                             "coat. Edward claims he left earlier.",
                exposesLie: true
            }
        ]
    },


    /* ---------------------------------------------------
       SUSPECT 3: THOMAS BLACKWOOD (the butler)
       Concealed: an envelope Eleanor gave him at 9:35 PM.
       Truth: it held her letter to the detective. He posted
       it at the hour she asked.
    --------------------------------------------------- */
    {
        id: "thomas",
        name: "Thomas Blackwood",
        initials: "TB",
        role: "The butler",
        age: 67,
        description: "Calm, formal and impossible to read. He has " +
                     "served the Ravenscroft family for over " +
                     "thirty years.",
        statement: "Mrs Ravenscroft gave me no special instructions " +
                   "tonight. I attended to the guests as usual.",
        lie: "He claimed Eleanor gave him nothing, but she handed " +
             "him an envelope at 9:35 PM.",

        questions: [
            {
                id: "thomas_q1",
                type: "general",
                requiresClue: null,
                text: "How long have you served this family?",
                answer: "Thirty-one years, sir. A good butler hears " +
                        "everything and repeats nothing.",
                journalNote: "Thomas has served the family for 31 " +
                             "years. He knows many family secrets " +
                             "and keeps them."
            },
            {
                id: "thomas_q2",
                type: "general",
                requiresClue: null,
                text: "Did Eleanor give you any instructions tonight?",
                answer: "Nothing of importance, sir. Tea, the guests " +
                        "and the lamps. That was all.",
                journalNote: "Thomas says Eleanor gave him nothing of " +
                             "importance. He answered very quickly."
            },
            {
                id: "thomas_q3",
                type: "confrontation",
                requiresClue: "secret_instructions",
                text: "Eleanor's own note says you hold her letter " +
                      "to me. Tell me the truth, Thomas.",
                answer: "...She gave me a sealed envelope at twenty-" +
                        "five to ten, sir. I was to send it to you by " +
                        "half past ten and tell no one, above all " +
                        "Mr Whitmore. I did as she asked. I also " +
                        "saw Mr Whitmore go toward the Study at a " +
                        "quarter to ten. He says now that he had " +
                        "already left.",
                journalNote: "Thomas admits Eleanor gave him an " +
                             "envelope at 9:35 PM, her letter to the " +
                             "detective. He saw Edward heading to " +
                             "the Study at 9:45 PM, which contradicts " +
                             "Edward's story.",
                exposesLie: true
            }
        ]
    },


    /* ---------------------------------------------------
       SUSPECT 4: EDWARD WHITMORE (business partner)
       Lie: he said he left the mansion before 10 PM.
       Truth: he entered the Study at 9:45 PM, killed Eleanor
       at 10:00 PM and left at 10:20 PM.
    --------------------------------------------------- */
    {
        id: "edward",
        name: "Edward Whitmore",
        initials: "EW",
        role: "Eleanor's business partner",
        age: 55,
        description: "Polished, charming and a little too " +
                     "composed. He dresses like a wealthy man " +
                     "and smiles easily. He returned to the " +
                     "mansion when you summoned the suspects.",
        statement: "I left the mansion at half past nine for a late " +
                   "dinner. I knew nothing of this tragedy until " +
                   "your summons brought me back.",
        lie: "He claimed he left before 10 PM. In truth he entered " +
             "the Study at 9:45 PM, killed Eleanor at 10:00 PM " +
             "and left at 10:20 PM.",

        questions: [
            {
                id: "edward_q1",
                type: "general",
                requiresClue: null,
                text: "Where were you tonight, Mr Whitmore?",
                answer: "I left at half past nine, Detective, well " +
                        "before ten. Dinner in town, with plenty of " +
                        "people to confirm it, I assure you. I " +
                        "returned only because you sent for me.",
                journalNote: "Edward says he left the mansion at 9:30 " +
                             "PM and was at dinner in town. He " +
                             "offers no names."
            },
            {
                id: "edward_q2",
                type: "confrontation",
                requiresClue: "study_cufflink",
                text: "A broken cufflink engraved E.W. lay under " +
                      "Eleanor's desk. Is it yours?",
                answer: "It... may be mine. I lost one at dinner " +
                        "last week. Any visitor could have picked it " +
                        "up. Surely you are not accusing me over a " +
                        "piece of jewellery?",
                journalNote: "Edward admits the cufflink may be his " +
                             "but says he lost it last week. His " +
                             "answer sounds rehearsed."
            },
            {
                id: "edward_q3",
                type: "confrontation",
                requiresClue: "secret_receipts",
                text: "These transfer receipts go to false names and " +
                      "carry your signature. Explain them.",
                answer: "Those are... accounting arrangements. " +
                        "Eleanor never understood them. She was " +
                        "cruel and vindictive, and she meant to " +
                        "ruin me at midnight. You cannot prove I " +
                        "was anywhere near that Study.",
                journalNote: "Edward cannot explain the false-name " +
                             "transfers. Without being asked, he says " +
                             "Eleanor meant to ruin him at midnight, " +
                             "and he insists he was never near the " +
                             "Study."
            }
        ]
    }
];


/* Quick message in the Console to confirm the file loaded. */
console.log("Suspect data loaded: " + SUSPECTS.length + " suspects.");