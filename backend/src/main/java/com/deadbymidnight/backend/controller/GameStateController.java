
package com.deadbymidnight.backend.controller;

import com.deadbymidnight.backend.model.GameState;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class GameStateController {

    // Temporary game session
    private final GameState gameState = new GameState();

    // View current game progress
    @GetMapping("/api/game/progress")
    public GameState getGameProgress() {
        return gameState;
    }

    // Inspect a clue
    @PostMapping("/api/game/inspect")
    public Map<String, Object> inspectClue(
            @RequestBody Map<String, String> request) {

        String clue = request.get("clue");

        boolean success = gameState.inspectClue(clue);

        Map<String, Object> response = new HashMap<>();

        response.put("success", success);
        response.put("message", success
                ? "Clue discovered successfully!"
                : "Clue could not be inspected.");

        response.put("gameState", gameState);

        return response;
    }

    // Enter an unlocked room
    @PostMapping("/api/game/room")
    public Map<String, Object> enterRoom(
            @RequestBody Map<String, String> request) {

        String room = request.get("room");

        boolean success = gameState.enterRoom(room);

        Map<String, Object> response = new HashMap<>();

        response.put("success", success);
        response.put("message", success
                ? "You entered " + room + "!"
                : "This room is locked or invalid.");

        response.put("gameState", gameState);

        return response;
    }
}
