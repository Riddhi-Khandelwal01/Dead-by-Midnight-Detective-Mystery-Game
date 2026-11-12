
package com.deadbymidnight.backend.controller;

import com.deadbymidnight.backend.model.GameInfo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GameController {

    // API to check whether the backend is running
    @GetMapping("/api/game/status")
    public String getGameStatus() {
        return "Dead by Midnight backend is running!";
    }

    // API to get basic information about the game
    @GetMapping("/api/game/info")
    public GameInfo getGameInfo() {

        GameInfo game = new GameInfo(
            "Dead by Midnight",
            "Ravenscroft Mansion",
            "10:30 PM",
            "11:59 PM",
            4,
            4
        );

        return game;
    }
}
