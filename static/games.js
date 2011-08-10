var games = ["Lobby", "Uno", "Canasta"];
var players = new Object();

$(document).ready(function() {
  var connection = new WebSocket("ws://localhost:6900/lobby");

  $("#nameform").submit(function() {
    connection.send("connect " + $("input#name").val() + "\n");
    $("#nameform").fadeOut();
    $("#creategame").fadeIn();

    return false;
  });

  $("#creategame").submit(function() {
    connection.send("create " + $("select#games").val() + "\n");
    $("#creategame").fadeOut();

    return false;
  });

  // connection.onopen = function() {
    // connection.send("Ping");
  // };

  connection.onmessage = function(e) {
    var args = e.data.split(" ", 2);
    switch (args[0]) {
    case "player":
    var player = new Object();
      var info = args[1].split(":", 4);
      player.game = games[info[0]];
      player.room = info[0] == 0 ? "" : info[1];
      player.name = info[2];
 	player.point = info[3];

      if (!players.hasOwnProperty(player.name)) {
        $("#userlist").append("<tr id=\"player-"+player.name+"\"></tr>");
      }
      $("#userlist #player-"+player.name).html("<td>"+player.name+"</td><td>"+player.game+"</td><td>"+player.point+"</td><td>"+player.room+"</td>");

      players[player.name] = player;

      break;
    case "error":
      alert("Error: " + args[1]);

      break;
    }
  };
});
