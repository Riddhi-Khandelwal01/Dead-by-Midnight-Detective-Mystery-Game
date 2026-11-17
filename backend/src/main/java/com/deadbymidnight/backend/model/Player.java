
package com.deadbymidnight.backend.model;

// Stores and manages the player's game statistics.
public class Player {

    private int moves;
    private int lives;
    private int score;

    // Initializes the player with default game values.
    public Player() {
        this.moves = 40;
        this.lives = 3;
        this.score = 0;
    }

    // Getter methods to access player statistics.
    public int getMoves() {
        return moves;
    }

    public int getLives() {
        return lives;
    }

    public int getScore() {
        return score;
    }

    // Reduces the available moves by one.
    public void useMove() {
        if (moves > 0) {
            moves--;
        }
    }

    // Reduces the player's lives by one.
    public void loseLife() {
        if (lives > 0) {
            lives--;
        }
    }

    // Adds points to the player's score.
    public void addScore(int points) {
        if (points > 0) {
            score += points;
        }
    }
}
