var stompClient = null;

const GAME_URL = "/api/games";

const CHOICES = {
  PAPER: 'paper',
  ROCK: 'rock',
  SCISSORS: 'scissors'
}

CHOICES.byIndex = [CHOICES.PAPER, CHOICES.ROCK, CHOICES.SCISSORS];

const PLAYER_GRAPHIC = [CHOICES.PAPER + "-inv.png", CHOICES.ROCK + "-inv.png", CHOICES.SCISSORS + "-inv.png"]
const OPPONENT_GRAPHIC = [CHOICES.PAPER + ".png", CHOICES.ROCK + ".png", CHOICES.SCISSORS + ".png"]

var currentPlayerChoice = 1; // Rock

var playerIsReady = false;

const gameId = getGameIdFromQueryParams();
const challenger = getChallengerFromQueryParams();

function getGameIdFromQueryParams() {
  let searchParams = new URLSearchParams(window.location.search);
  let gameId = null;
  if (searchParams.has('gameId')) {
    gameId = searchParams.get('gameId');
  }

  return gameId;
}

function getChallengerFromQueryParams() {
  let searchParams = new URLSearchParams(window.location.search);
  return searchParams.has('challenger');
}

function setConnected(connected) {
  $("#connect").prop("disabled", connected);
  $("#disconnect").prop("disabled", !connected);
  if (connected) {
    $("#conversation").show();
  }
  else {
    $("#conversation").hide();
  }
  $("#greetings").html("");
}

function connect() {
  var socket = new SockJS('/api/rps-sock');
  stompClient = Stomp.over(socket);
  stompClient.connect({}, function (frame) {
    setConnected(true);
    console.log('Connected: ' + frame);
    stompClient.subscribe("/topic/game/" + gameId + "/player_done", function (playerDone) {
      console.log(playerDone);
      markPlayerDone(JSON.parse(playerDone.body).name);
    });
    stompClient.subscribe("/topic/game/" + gameId + "/new_opponent", function (opponent) {
      console.log(opponent);
      newOpponent(JSON.parse(opponent.body).name);
    });
    stompClient.subscribe("/topic/game/" + gameId + "/result", function (result) {
      console.log("Getting results", result);
      evaluateGame(JSON.parse(result.body));
    });
  });
}

function newOpponent(name) {
  $("#opponentName").text(name);
}

function disconnect() {
  if (stompClient !== null) {
    stompClient.disconnect();
  }
  setConnected(false);
  console.log("Disconnected");
}

function sendChoice() {
  stompClient.send("/app/game/" + gameId + "/player_choice", {}, JSON.stringify({'name': $("#playerName").text(), 'choice': currentPlayerChoice}));
}

function markPlayerDone(name) {
  if (name == $("#playerName").text()) {
    $("#playerStatus").text("Done!");
  }
  else {
    $("#opponentStatus").text("Done!");
  }

}

function evaluateGame(result) {
  console.log("evaluating game", result);
  let opponentsChoice;
  for (let i = 0; i < result.length; i++) {
    if (result[i].name == $("#opponentName").text()) {
      opponentsChoice = result[i].choice;
      break;
    }
  }
  setOpponentGraphic(opponentsChoice);
  if (currentPlayerChoice == opponentsChoice) {
    indicateTie();
  }
  else {
    opponentsChoice = CHOICES.byIndex[opponentsChoice] // Convert to enum
    switch (CHOICES.byIndex[currentPlayerChoice]) {
      case CHOICES.PAPER:
        if (opponentsChoice == CHOICES.ROCK) {
          indicateWin();
        }
        else {
          indicateLoss();
        }
        break;
      case CHOICES.ROCK:
        if (opponentsChoice == CHOICES.SCISSORS) {
          indicateWin();
        }
        else {
          indicateLoss();
        }
        break;
      case CHOICES.SCISSORS:
        if (opponentsChoice == CHOICES.PAPER) {
          indicateWin();
        }
        else {
          indicateLoss();
        }
        break;
    }
  }

  newRound();
}

function indicateWin() {
  $("#result").text("Victory");
}

function indicateTie() {
  $("#result").text("Tie");
}

function indicateLoss() {
  $("#result").text("Loss");
}

function clearResult() {
  $("#result").text("");
}

function newRound() {
  playerIsReady = false;
  $("#readyButton").removeClass("disabled");
  $("#playerStatus").text("Choosing..");
  $("#opponentStatus").text("Choosing..");
}

function playerClicked() {
  stepPlayerChoice();
  setPlayerGraphic(currentPlayerChoice);
  clearResult();
}

function setPlayerGraphic(choice) {
  $("#player").attr("src", PLAYER_GRAPHIC[choice]);
}

function setOpponentGraphic(choice) {
  $("#opponent").attr("src", OPPONENT_GRAPHIC[choice]);
}

function stepPlayerChoice() {
  currentPlayerChoice += 1;
  if (currentPlayerChoice >= CHOICES.byIndex.length) {
    currentPlayerChoice = 0;
  }
}

function playerClickedReady() {
  playerIsReady = true;
  $( "#readyButton" ).addClass("disabled");
  sendChoice();
  clearResult();
}

function getGame() {
  // Create XMLHttpRequest object
  let req = new XMLHttpRequest();

  // Hook up the onreadystatechange event
  req.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE &&
      this.status === 200) {
      // Get product object
      game = JSON.parse(this.response);

      console.log(game)

      if (challenger) {
        $("#playerName").text(game.playerTwoName);
        $("#opponentName").text(game.playerOneName);
      }
      else {
        $("#playerName").text(game.playerOneName);
        $("#opponentName").append("<a href=/join.html?gameId=" + gameId + ">Invite link</a>");
      }
    }
  };

  // Open the request object
  req.open("GET", GAME_URL + "/" + gameId);
  // Add Content-Typheader
  req.setRequestHeader("Content-Type", "application/json");

  // Send the request to the server
  req.send();
  
  console.log("Sent new game request", req);
}

$(function () {
  $( "#player" ).click(function() { if (!playerIsReady) { playerClicked(); } });
  $( "#readyButton" ).click(function() {if (!playerIsReady) { playerClickedReady(); } });

  getGame()

  // Connect to broker
  connect();
});
