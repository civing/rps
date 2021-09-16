package se.fryking.rps;

import java.util.List;
import java.util.ArrayList;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.util.HtmlUtils;
import java.util.Random;

@RestController
class GameController {
    private final GameRepository repository;

    @Autowired
    private SimpMessagingTemplate messageSender;
    
    Logger logger = LoggerFactory.getLogger(GameController.class);

    GameController(GameRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/api/games")
    List<Game> all() {
        return repository.findAll();
    }

    @PostMapping("/api/games")
    Game newGame(@RequestBody Game newGame) {
        return repository.save(newGame);
    }

    @GetMapping("/api/games/{id}")
    Game one(@PathVariable Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new GameNotFoundException(id));
    }

    @PutMapping("/api/games/{id}")
    Game updateGame(@RequestBody Game newGame, @PathVariable Long id) {
        return repository.findById(id)
            .map(game -> {
                String newPlayer = newGame.getPlayerTwoName();
                game.setPlayerTwoName(newPlayer);
                this.messageSender.convertAndSend("/topic/game/" + Long.toString(id) + "/new_opponent", new PlayerChoice(newPlayer));
                return repository.save(game);
            })
            .orElseThrow(() -> new GameNotFoundException(id));
    }

    @MessageMapping("/game/{gameId}/player_choice")
    @SendTo("/topic/game/{gameId}/player_done")
    public PlayerChoice choose(@DestinationVariable Long gameId, PlayerChoice message) throws Exception {
    	logger.trace("Received a message for game " + Long.toString(gameId) + " with name " + message.getName()+ " and " + message.getChoice());
        Optional<Game> optional = repository.findById(gameId);
        optional.ifPresent(game -> {
            game.setPlayerChoice(message.getName(), message.getChoice());
            if (game.isDone()) {
                PlayerChoice playerOne = new PlayerChoice(game.getPlayerOneName());
                playerOne.setChoice(game.getPlayerOneChoice());
                PlayerChoice playerTwo = new PlayerChoice(game.getPlayerTwoName());
                playerTwo.setChoice(game.getPlayerTwoChoice());
                List<PlayerChoice> result = new ArrayList<PlayerChoice>();
                result.add(playerOne);
                result.add(playerTwo);

                logger.trace("/topic/game/" + Long.toString(gameId) + "/result");
                this.messageSender.convertAndSend("/topic/game/" + Long.toString(gameId) + "/result", result);
                game.clearPlayerChoices();
            }
            repository.save(game);
        });
    	return new PlayerChoice(message.getName());
    }
}
