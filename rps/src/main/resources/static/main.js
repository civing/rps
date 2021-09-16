const GAME_URL = "/api/games";

function createNewGame(playerName) {
  // Create XMLHttpRequest object
  let req = new XMLHttpRequest();

  // Hook up the onreadystatechange event
  req.onreadystatechange = function () {
    if (this.readyState === XMLHttpRequest.DONE &&
      this.status === 200) {
      // Get product object
      game = JSON.parse(this.response);

      console.log(game)
      window.location.href = "/play.html?gameId=" + game.id;

    }
  };

  // Open the request object
  req.open("POST", GAME_URL);
  // Add Content-Type header
  req.setRequestHeader("Content-Type", "application/json");

  // Send the request to the server
  req.send(JSON.stringify({playerOneName: playerName}));
  
  console.log("Sent new game request", req);
}

$(function () {
  $( "#newGameButton" ).click(function() { if (!!$("#playerName").val()) { createNewGame($("#playerName").val()); } });
});
