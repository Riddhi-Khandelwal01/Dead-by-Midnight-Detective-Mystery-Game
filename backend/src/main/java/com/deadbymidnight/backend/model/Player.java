
package com.deadbymidnight.backend.model;

public class Player {

    // Player's game statistics
    private int moves;
    private int lives;
    private int score;

    // Constructor: initializes the player's statistics
    public Player() {
        this.moves = 40;
        this.lives = 3;
        this.score = 0;
    }

    // Getters
    public int getMoves() {
        return moves;
    }

    public int getLives() {
        return lives;
    }

    public int getScore() {
        return score;
    }

    // Use one move
    public void useMove() {
        if (moves > 0) {
            moves--;
        }
    }

    // Lose one life
    public void loseLife() {
        if (lives > 0) {
            lives--;
        }
    }

    // Add points to the score
    public void addScore(int points) {
        if (points > 0) {
            score += points;
        }
    }
}
