var games = ["Lobby", "Uno", "Canasta"];
var players = new Object();
var player;
var name;
var connection;
var inGame = false;
$(document).ready(function() {
    
    connection = new WebSocket("ws://localhost:6900/lobby");
    $("#nameform").submit(function() {
        connection.send("connect " + $("input#name").val() + "\n");
        name = $("input#name").val();
        $("#nameform").fadeOut();
        $("#creategame").fadeIn();

        return false;
    });

    $("#creategame").submit(function() {
        connection.send("create " + $("select#games").val() + "\n");
        $("#creategame").fadeOut();
        return false;
    });

    connection.onmessage = function(e) {
        var args = e.data.split(" ", 2);
        switch (args[0]) {
            case "player":
                player = new Object();
                var info = args[1].split(":", 2);
                player.name = info[0];
                player.point = info[1];
    
                if (!players.hasOwnProperty(player.name)) {
                    $("#userlist").append("<tr id=\"player-"+player.name+"\">");
                }
                $("#userlist #player-"+player.name).html("<td>"+player.name+"</td><td>"+player.point+"</td></tr>");
                players[player.name] = player;                
                break;
                case "Game":
                   inGame = true;
                    
                  $("#status").html("Start Now!");
                break;
            case "error":
                alert("Error: " + args[1]);
                break;
        }
        if(inGame){
            loop();
        }
    };
});
function start(){
            if(!inGame)
            connection.send("start "+"\n");
        
            return false;
}