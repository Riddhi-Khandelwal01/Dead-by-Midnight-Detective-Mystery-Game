
package com.deadbymidnight.backend.model;

// Stores the basic information about Dead by Midnight.
public class GameInfo {

    private String gameName;
    private String location;
    private String startingTime;
    private String deadline;
    private int totalSuspects;
    private int totalRooms;

    // Constructor to initialize game information.
    public GameInfo(
            String gameName,
            String location,
            String startingTime,
            String deadline,
            int totalSuspects,
            int totalRooms) {

        this.gameName = gameName;
        this.location = location;
        this.startingTime = startingTime;
        this.deadline = deadline;
        this.totalSuspects = totalSuspects;
        this.totalRooms = totalRooms;
    }

    // Getter methods allow other classes to access the values.
    public String getGameName() {
        return gameName;
    }

    public String getLocation() {
        return location;
    }

    public String getStartingTime() {
        return startingTime;
    }

    public String getDeadline() {
        return deadline;
    }

    public int getTotalSuspects() {
        return totalSuspects;
    }

    public int getTotalRooms() {
        return totalRooms;
    }
}

