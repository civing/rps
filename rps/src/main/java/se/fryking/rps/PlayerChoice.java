package se.fryking.rps;

public class PlayerChoice {

    private String name;
    private Integer choice;

    public PlayerChoice() {
    }

    public PlayerChoice(String name) {
        this.name = name;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getChoice() {
        return this.choice;
    }

    public void setChoice(Integer choice) {
        this.choice = choice;
    }

}
