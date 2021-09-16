package se.fryking.rps;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Transient;

@Entity
class Game {

    @Transient
    Logger logger = LoggerFactory.getLogger(Game.class);

    private @Id @GeneratedValue Long id;
    private String playerOneName;
    private String playerTwoName;
    private Integer playerOneChoice;
    private Integer playerTwoChoice;

    Game() {
        this.playerOneName = "N/A";
        this.playerTwoName = "N/A";
        this.playerOneChoice = -1;
        this.playerTwoChoice = -1;
    }

    Game(String playerOneName) {
        this.playerOneName = playerOneName;
        this.playerTwoName = "N/A";
        this.playerOneChoice = -1;
        this.playerTwoChoice = -1;
    }

    public Long getId() {
        return this.id;
    }

    public String getPlayerOneName() {
        return this.playerOneName;
    }

    public String getPlayerTwoName() {
        return this.playerTwoName;
    }

    public void setPlayerTwoName(String playerTwoName) {
        this.playerTwoName = playerTwoName;
    }

    public void setPlayerChoice(String playerName, Integer choice) {
        logger.trace("playerName = " + playerName + ", this.playerOneName = " + this.playerOneName + ", choice = " + Integer.toString(choice));
        if (playerName.equals(this.playerOneName)) {
            this.playerOneChoice = choice;
            logger.trace("Saving choice for playerOne");
        }
        else if (playerName.equals(this.playerTwoName)) {
            this.playerTwoChoice = choice;
            logger.trace("Saving choice for playerTwo");
        }
    }

    public void clearPlayerChoices() {
        this.playerOneChoice = -1;
        this.playerTwoChoice = -1;
    }

    public boolean isDone() {
        if (this.playerOneChoice == -1 || this.playerTwoChoice == -1) {
            return false;
        }

        return true;
    }

    public void setPlayerOneChoice(Integer choice) {
        this.playerOneChoice = choice;
    }

    public void setPlayerTwoChoice(Integer choice) {
        this.playerTwoChoice = choice;
    }

    public Integer getPlayerOneChoice() {
        return this.playerOneChoice;
    }

    public Integer getPlayerTwoChoice() {
        return this.playerTwoChoice;
    }
}
