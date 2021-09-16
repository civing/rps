const GAME_URL = "/api/games";

const gameId = getGameIdFromQueryParams();

function getGameIdFromQueryParams() {
  let searchParams = new URLSearchParams(window.location.search);
  let gameId = null;
  if (searchParams.has('gameId')) {
    gameId = searchParams.get('gameId');
  }

  return gameId;
}

function joinGame(playerName) {
  // Create XMLHttpRequest object
  let req = new XMLHttpRequest();

  // Hook up the onreadystatechange event
  req.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE &&
      this.status === 200) {
      // Get product object
      game = JSON.parse(this.response);

      console.log(game)
      window.location.href = "/play.html?gameId=" + game.id + "&challenger";
    }
  };

  // Open the request object
  req.open("PUT", GAME_URL + "/" + gameId);
  // Add Content-Type header
  req.setRequestHeader("Content-Type", "application/json");

  // Send the request to the server
  req.send(JSON.stringify({playerTwoName: playerName}));
  
  console.log("Updated game with player name", req);
}

$(function () {
  $( "#joinGameButton" ).click(function() { if (!!$("#playerName").val()) { joinGame($("#playerName").val()); } });
});
