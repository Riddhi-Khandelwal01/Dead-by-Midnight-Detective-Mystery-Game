
package com.deadbymidnight.backend.model;

import java.util.ArrayList;
import java.util.List;

public class GameState {

    private Player player;

    private String currentRoom;

    private int currentHour;
    private int currentMinute;
    private String currentPeriod;

    private List<String> collectedClues;

    // Stores puzzles that have already been solved
    private List<String> solvedPuzzles;

    // Constructor
    public GameState() {

        this.player = new Player();

        this.currentRoom = "Study";

        this.currentHour = 10;
        this.currentMinute = 30;
        this.currentPeriod = "PM";

        this.collectedClues = new ArrayList<>();
        this.solvedPuzzles = new ArrayList<>();
    }

    // Getters
    public Player getPlayer() {
        return player;
    }

    public String getCurrentRoom() {
        return currentRoom;
    }

    public int getCurrentHour() {
        return currentHour;
    }

    public int getCurrentMinute() {
        return currentMinute;
    }

    public String getCurrentPeriod() {
        return currentPeriod;
    }

    public List<String> getCollectedClues() {
        return collectedClues;
    }

    public List<String> getSolvedPuzzles() {
        return solvedPuzzles;
    }

    // Change current room
    public void setCurrentRoom(String currentRoom) {
        this.currentRoom = currentRoom;
    }

    // Inspect a clue for the first time
    public boolean inspectClue(String clue) {

        if (clue == null || clue.isBlank()) {
            return false;
        }

        String cleanClue = clue.trim();

        if (collectedClues.contains(cleanClue)) {
            return false;
        }

        if (player.getMoves() <= 0) {
            return false;
        }

        player.useMove();
        player.addScore(10);

        collectedClues.add(cleanClue);

        advanceTime();

        return true;
    }

    // Check whether a room is unlocked
    public boolean isRoomUnlocked(String room) {

        if (room == null) {
            return false;
        }

        if ("Study".equalsIgnoreCase(room)) {
            return true;
        }

        if ("Library".equalsIgnoreCase(room)) {

            return collectedClues.contains("Torn Letter")
                    && collectedClues.contains("Broken Cufflink")
                    && collectedClues.contains(
                            "Partially Burned Business Document");
        }

        if ("Laboratory".equalsIgnoreCase(room)) {
            return solvedPuzzles.contains("Key Box");
        }

        return false;
    }

    // Enter an unlocked room
    public boolean enterRoom(String room) {

        if (room == null || room.isBlank()) {
            return false;
        }

        if (!isRoomUnlocked(room)) {
            return false;
        }

        setCurrentRoom(room);

        return true;
    }

    // Solve the Library Key Box puzzle
    public boolean solvePuzzle(String puzzleName, String answer) {

        if (puzzleName == null || answer == null) {
            return false;
        }

        // Puzzle can only be solved inside the Library
        if (!currentRoom.equalsIgnoreCase("Library")) {
            return false;
        }

        // Prevent solving the same puzzle twice
        if (solvedPuzzles.contains(puzzleName)) {
            return false;
        }

        if (player.getLives() <= 0) {
            return false;
        }

        if ("Key Box".equalsIgnoreCase(puzzleName.trim())) {

            String cleanAnswer = answer.trim();

            // Accept both 12 and MIDNIGHT
            if (cleanAnswer.equalsIgnoreCase("12")
                    || cleanAnswer.equalsIgnoreCase("MIDNIGHT")) {

                solvedPuzzles.add("Key Box");

                player.addScore(25);

                return true;
            }

            // Wrong answer costs one life
            player.loseLife();

            return false;
        }

        return false;
    }

    // Advance the game clock by two minutes
    public void advanceTime() {

        currentMinute += 2;

        if (currentMinute >= 60) {
            currentHour++;
            currentMinute -= 60;
        }

        if (currentHour > 12) {
            currentHour = 1;

            if (currentPeriod.equals("AM")) {
                currentPeriod = "PM";
            } else {
                currentPeriod = "AM";
            }
        }
    }
}
