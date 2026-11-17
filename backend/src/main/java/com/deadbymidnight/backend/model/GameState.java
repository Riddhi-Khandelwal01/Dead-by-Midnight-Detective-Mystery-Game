
package com.deadbymidnight.backend.model;

import java.util.ArrayList;
import java.util.List;

// Manages the overall progress and rules of the game.
public class GameState {

    private Player player;

    private String currentRoom;

    private int currentHour;
    private int currentMinute;
    private String currentPeriod;

    private List<String> collectedClues;
    private List<String> solvedPuzzles;

    // Initializes a new game.
    public GameState() {

        player = new Player();

        currentRoom = "Study";

        // The detective arrives at 10:30 PM.
        currentHour = 10;
        currentMinute = 30;
        currentPeriod = "PM";

        collectedClues = new ArrayList<>();
        solvedPuzzles = new ArrayList<>();
    }

    // Getter methods.
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

    // Inspects a clue and updates the player's progress.
    public boolean inspectClue(String clue) {

        if (clue == null || clue.trim().isEmpty()) {
            return false;
        }

        // Prevent collecting the same clue twice.
        if (collectedClues.contains(clue)) {
            return false;
        }

        if (player.getMoves() <= 0) {
            return false;
        }

        collectedClues.add(clue);

        player.useMove();
        player.addScore(10);

        advanceTime(2);

        return true;
    }

    // Checks whether a particular room is unlocked.
    public boolean isRoomUnlocked(String room) {

        if (room == null) {
            return false;
        }

        switch (room.toLowerCase()) {

            case "study":
                return true;

            case "library":
                return collectedClues.contains("Torn Letter")
                        && collectedClues.contains("Broken Cufflink")
                        && collectedClues.contains(
                                "Partially Burned Business Document");

            case "laboratory":
                return solvedPuzzles.contains("Key Box");

            case "secret room":
                return solvedPuzzles.contains("Hidden Panel");

            default:
                return false;
        }
    }

    // Allows the player to enter an unlocked room.
    public boolean enterRoom(String room) {

        if (!isRoomUnlocked(room)) {
            return false;
        }

        currentRoom = room;
        return true;
    }

    // Checks the player's answer to a puzzle.
    public boolean solvePuzzle(String puzzleName, String answer) {

        if (puzzleName == null || answer == null) {
            return false;
        }

        if (player.getLives() <= 0) {
            return false;
        }

        // Prevent solving the same puzzle more than once.
        if (solvedPuzzles.contains(puzzleName)) {
            return false;
        }

        boolean correct = false;

        // Library puzzle: Key Box.
        if (currentRoom.equalsIgnoreCase("Library")
                && puzzleName.equalsIgnoreCase("Key Box")) {

            correct = answer.equalsIgnoreCase("12")
                    || answer.equalsIgnoreCase("MIDNIGHT");
        }

        // Laboratory puzzle: Hidden Panel.
        else if (currentRoom.equalsIgnoreCase("Laboratory")
                && puzzleName.equalsIgnoreCase("Hidden Panel")) {

            correct = answer.equalsIgnoreCase("E.W.");
        }

        if (correct) {

            solvedPuzzles.add(puzzleName);
            player.addScore(25);

            return true;
        }

        // An incorrect puzzle answer costs one life.
        player.loseLife();

        return false;
    }

    // Advances the game clock by the given number of minutes.
    public void advanceTime(int minutes) {

        int totalMinutes = currentHour * 60 + currentMinute;

        // Convert PM time into 24-hour format.
        if (currentPeriod.equals("PM") && currentHour != 12) {
            totalMinutes += 12 * 60;
        }

        // Convert 12 AM to 00 hours.
        if (currentPeriod.equals("AM") && currentHour == 12) {
            totalMinutes -= 12 * 60;
        }

        totalMinutes += minutes;

        // Convert back to a 12-hour clock.
        totalMinutes %= 24 * 60;

        currentHour = (totalMinutes / 60) % 12;

        if (currentHour == 0) {
            currentHour = 12;
        }

        currentMinute = totalMinutes % 60;

        currentPeriod = totalMinutes >= 12 * 60 ? "PM" : "AM";
    }
}
